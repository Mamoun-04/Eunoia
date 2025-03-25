import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { insertEntrySchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Image upload endpoint
  app.post("/api/upload", requireAuth, async (req, res) => {
    try {
      const canAddImage = await storage.canAddImage(req.user!.id);
      if (!canAddImage.allowed) {
        return res.status(403).json({ message: canAddImage.reason });
      }

      upload.single("image")(req, res, async (err) => {
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

  // Create a new journal entry
  app.post("/api/entries", requireAuth, async (req, res) => {
    try {
      const canCreateEntry = await storage.canCreateEntry(req.user!.id);
      if (!canCreateEntry.allowed) {
        return res.status(403).json({ message: canCreateEntry.reason });
      }

      const contentLimit = await storage.getEntryContentLimit(req.user!.id);
      const data = insertEntrySchema.parse(req.body);
      const wordCount = data.content.trim().split(/\s+/).length;
      if (wordCount > contentLimit) {
        return res.status(403).json({
          message: `Free users are limited to ${contentLimit} words per entry. Upgrade to Premium for unlimited content.`,
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

  // Retrieve entries for the logged-in user
  app.get("/api/entries", requireAuth, async (req, res) => {
    try {
      const entries = await storage.getEntries(req.user!.id);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  // Update an existing journal entry
  app.patch("/api/entries/:id", requireAuth, async (req, res) => {
    try {
      const entry = await storage.getEntry(parseInt(req.params.id));
      if (!entry || entry.userId !== req.user!.id) {
        return res.status(404).json({ message: "Entry not found" });
      }
      if (req.body.content) {
        const contentLimit = await storage.getEntryContentLimit(req.user!.id);
        const wordCount = req.body.content.trim().split(/\s+/).length;
        if (wordCount > contentLimit) {
          return res.status(403).json({
            message: `Free users are limited to ${contentLimit} words per entry. Upgrade to Premium for unlimited content.`,
          });
        }
      }
      const updatedEntry = await storage.updateEntry(entry.id, req.body);
      res.json(updatedEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update entry" });
    }
  });

  // Delete a journal entry
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

  // Subscription endpoint (no changes here)
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
        subscriptionEndDate: endDate,
      });
      res.json({ message: "Subscription activated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process subscription" });
    }
  });

  // Cancel subscription endpoint
  app.post("/api/cancel-subscription", requireAuth, async (req, res) => {
    try {
      // You should update this logic to properly cancel a subscription in your system
      await storage.updateUser(req.user!.id, {
        subscriptionStatus: "free",
        subscriptionEndDate: null,
      });
      res.json({ message: "Subscription cancelled" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
