import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
import { insertEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Journal entries routes
  app.post("/api/upload", requireAuth, async (req, res) => {
    try {
      // Check if user can add an image (free user limit)
      const canAddImage = await storage.canAddImage(req.user!.id);
      if (!canAddImage.allowed) {
        return res.status(403).json({ message: canAddImage.reason });
      }

      // Process the upload
      upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ message: "No image provided" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ url: imageUrl });
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process image upload" });
    }
  });

  app.post("/api/entries", requireAuth, async (req, res) => {
    try {
      // Check if user can create an entry (free user limit)
      const canCreateEntry = await storage.canCreateEntry(req.user!.id);
      if (!canCreateEntry.allowed) {
        return res.status(403).json({ message: canCreateEntry.reason });
      }

      // Get content limit
      const contentLimit = await storage.getEntryContentLimit(req.user!.id);

      // Check content length (word count)
      const data = insertEntrySchema.parse(req.body);
      const wordCount = data.content.trim().split(/\s+/).length;

      if (wordCount > contentLimit) {
        return res.status(403).json({ 
          message: `Free users are limited to ${contentLimit} words per entry. Upgrade to Premium for unlimited content.`
        });
      }

      const entry = await storage.createEntry(req.user!.id, data);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create entry" });
      }
    }
  });

  app.get("/api/entries", requireAuth, async (req, res) => {
    try {
      const entries = await storage.getEntries(req.user!.id);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  app.patch("/api/entries/:id", requireAuth, async (req, res) => {
    try {
      const entry = await storage.getEntry(parseInt(req.params.id));
      if (!entry || entry.userId !== req.user!.id) {
        return res.status(404).json({ message: "Entry not found" });
      }

      // If the updated entry contains content, check content limits for free users
      if (req.body.content) {
        // Get word limit
        const contentLimit = await storage.getEntryContentLimit(req.user!.id);

        // Count words in the new content
        const wordCount = req.body.content.trim().split(/\s+/).length;

        // Enforce the limit for free users
        if (wordCount > contentLimit) {
          return res.status(403).json({ 
            message: `Free users are limited to ${contentLimit} words per entry. Upgrade to Premium for unlimited content.`
          });
        }
      }

      const updatedEntry = await storage.updateEntry(entry.id, req.body);
      res.json(updatedEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update entry" });
    }
  });

  app.delete("/api/entries/:id", requireAuth, async (req, res) => {
    try {
      const entry = await storage.getEntry(parseInt(req.params.id));
      if (!entry || entry.userId !== req.user!.id) {
        return res.status(404).json({ message: "Entry not found" });
      }

      await storage.deleteEntry(entry.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Mock subscription endpoint
  app.post("/api/subscribe", requireAuth, async (req, res) => {
    const { plan } = req.body;
    if (!plan || !["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    try {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (plan === "yearly" ? 12 : 1));

      await storage.updateUser(req.user!.id, {
        subscriptionStatus: "active",
        subscriptionEndDate: endDate
      });

      res.json({ message: "Subscription activated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process subscription" });
    }
  });

  // AI Chat endpoint
  app.post("/api/chat", requireAuth, async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const prompt = `You are a thoughtful journaling assistant. Help users reflect deeply on their thoughts and emotions.

Your response should ALWAYS have two parts, separated by a blank line and the word "Prompt:":

1. First part: A warm, empathetic response (under 150 words) that:
   - Acknowledges their feelings
   - Offers gentle guidance or insight
   - Maintains a supportive tone

2. Second part (after "Prompt:"): A specific journaling prompt that:
   - Encourages deeper reflection
   - Relates to the current conversation
   - Is clear and focused

Example format:
I understand how you're feeling about... [empathetic response]

Prompt: [specific journaling prompt]

User message: ${message}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      const data = await response.json();
      res.json({ message: data.choices[0].message.content });
    } catch (error) {
      console.error('OpenAI API error:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.delete("/api/user", requireAuth, async (req, res) => {
    try {
      // Delete user's entries
      await storage.deleteEntriesByUserId(req.user!.id);
      // Delete user's account
      await storage.deleteUser(req.user!.id);
      // Logout user
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout after account deletion" });
        }
        res.sendStatus(204);
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}