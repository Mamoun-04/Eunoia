import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import express from "express";
import { z } from "zod";
import { 
  subscriptionPlans, 
  insertEntrySchema, 
  insertSavedLessonSchema 
} from "@shared/schema";
import * as subscriptionManager from './payment/subscription-manager';

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
  app.post("/api/upload", requireAuth, (req, res) => {
    // First handle the file upload with multer
    upload.single('image')(req, res, async (err) => {
      try {
        // Check for multer errors first
        if (err) {
          console.error("Multer error:", err);
          return res.status(400).json({ message: err.message });
        }

        // Then check for authenticated user (should always be there due to requireAuth middleware)
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        // Check if user can add an image (free user limit)
        const canAddImage = await storage.canAddImage(req.user.id);
        if (!canAddImage.allowed) {
          return res.status(403).json({ message: canAddImage.reason });
        }

        // Check if file was uploaded
        if (!req.file) {
          return res.status(400).json({ message: "No image provided" });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        return res.status(200).json({ url: imageUrl });
      } catch (error) {
        console.error("Image upload error:", error);
        return res.status(500).json({ message: "Failed to process image upload" });
      }
    });
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
      
      // Update user streak for this activity
      const updatedStreak = await storage.updateUserStreak(req.user!.id);
      
      res.status(201).json({ ...entry, currentStreak: updatedStreak });
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
  
  // Saved Lessons routes
  app.post("/api/saved-lessons", requireAuth, async (req, res) => {
    try {
      const data = insertSavedLessonSchema.parse(req.body);
      const savedLesson = await storage.createSavedLesson(req.user!.id, data);
      
      // Update user streak for this guided lesson activity
      const updatedStreak = await storage.updateUserStreak(req.user!.id);
      
      res.status(201).json({ ...savedLesson, currentStreak: updatedStreak });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid saved lesson data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save lesson" });
      }
    }
  });

  // Get user info route
  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      
      // Create a sanitized user object without sensitive data
      const userInfo: {
        id: number;
        username: string;
        subscriptionStatus: string;
        subscriptionEndDate: Date | null;
        subscriptionPlan?: string;
        currentStreak: number;
        lastActivityDate: Date | null;
      } = {
        id: user!.id,
        username: user!.username,
        subscriptionStatus: user!.subscriptionStatus,
        subscriptionEndDate: user!.subscriptionEndDate,
        currentStreak: user!.currentStreak || 0,
        lastActivityDate: user!.lastActivityDate
      };
      
      // Add subscription plan from preferences if available
      if (user!.preferences) {
        try {
          const preferences = JSON.parse(user!.preferences);
          userInfo.subscriptionPlan = preferences.subscriptionPlan || "free";
        } catch (e) {
          console.error("Error parsing user preferences:", e);
          userInfo.subscriptionPlan = "free";
        }
      } else {
        userInfo.subscriptionPlan = "free";
      }
      
      res.json(userInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user information" });
    }
  });
  
  app.get("/api/saved-lessons", requireAuth, async (req, res) => {
    try {
      const savedLessons = await storage.getSavedLessons(req.user!.id);
      res.json(savedLessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved lessons" });
    }
  });
  
  // Get user streak data
  app.get("/api/streak", requireAuth, async (req, res) => {
    try {
      const currentStreak = await storage.getUserStreak(req.user!.id);
      res.json({ currentStreak });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch streak data" });
    }
  });

  app.get("/api/saved-lessons/:id", requireAuth, async (req, res) => {
    try {
      const savedLesson = await storage.getSavedLesson(parseInt(req.params.id));
      
      if (!savedLesson || savedLesson.userId !== req.user!.id) {
        return res.status(404).json({ message: "Saved lesson not found" });
      }
      
      res.json(savedLesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved lesson" });
    }
  });

  app.delete("/api/saved-lessons/:id", requireAuth, async (req, res) => {
    try {
      const savedLesson = await storage.getSavedLesson(parseInt(req.params.id));
      
      if (!savedLesson || savedLesson.userId !== req.user!.id) {
        return res.status(404).json({ message: "Saved lesson not found" });
      }
      
      await storage.deleteSavedLesson(savedLesson.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete saved lesson" });
    }
  });

  // Subscription routes
  
  // Get subscription plans
  app.get("/api/subscription/plans", (req, res) => {
    try {
      res.json({
        plans: subscriptionPlans,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });
  
  // Create subscription
  app.post("/api/subscription", requireAuth, async (req, res) => {
    try {
      const { plan, platform: clientPlatform } = req.body;
      
      if (!plan || !["monthly", "yearly"].includes(plan)) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }
      
      // Get user agent to determine platform, but allow client platform to override
      const userAgent = req.headers["user-agent"] || "";
      const platform = subscriptionManager.getSubscriptionPlatform(userAgent, clientPlatform);
      
      console.log(`Subscription request - Platform: ${platform}, User Agent: ${userAgent}, Client Platform: ${clientPlatform}`);
      
      // For Apple payments, receipt data is required
      if (platform === 'apple' && !req.body.receiptData) {
        return res.status(400).json({ 
          message: "Receipt data is required for Apple payments",
          data: { 
            redirectToAppStore: true,
            platform: platform 
          }
        });
      }
      
      // For Android Play Store, handle similar to Apple
      if (platform === 'android' && !req.body.receiptData) {
        return res.status(400).json({ 
          message: "Receipt data is required for Google Play payments",
          data: { 
            redirectToPlayStore: true,
            platform: platform 
          }
        });
      }
      
      // For Stripe payments, email is helpful but we can fallback to username
      const email = req.body.email || `${req.user!.username}@example.com`;
      
      // Create subscription based on platform
      const result = await subscriptionManager.createSubscription(
        req.user!.id,
        plan,
        platform,
        req.body.receiptData,
        email
      );
      
      if (!result.success) {
        return res.status(400).json({ message: result.message, data: result.data });
      }
      
      res.json({ 
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });
  
  // Cancel subscription
  app.post("/api/subscription/cancel", requireAuth, async (req, res) => {
    try {
      const cancelled = await subscriptionManager.cancelUserSubscription(req.user!.id);
      
      if (!cancelled) {
        return res.status(400).json({ message: "Failed to cancel subscription" });
      }
      
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process cancellation request" });
    }
  });
  
  // Stripe webhook endpoint
  app.post("/api/stripe-webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({ message: "Stripe signature missing" });
      }
      
      // Process the webhook
      await subscriptionManager.handleStripeWebhookEvent(req.body, signature);
      
      res.sendStatus(200);
    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(500).json({ message: "Failed to process Stripe webhook" });
    }
  });
  
  // Apple app store server notification webhook
  app.post("/api/apple-webhook", async (req, res) => {
    try {
      const { signedPayload } = req.body;
      
      if (!signedPayload) {
        return res.status(400).json({ message: "Missing signed payload" });
      }
      
      // Process the Apple server notification
      await subscriptionManager.handleAppleServerNotification(signedPayload);
      
      res.sendStatus(200);
    } catch (error) {
      console.error('Apple webhook error:', error);
      res.status(500).json({ message: "Failed to process Apple server notification" });
    }
  });
  
  // Delete account endpoint
  app.post("/api/delete-account", requireAuth, async (req, res) => {
    try {
      const { feedback, reason } = req.body;
      
      // Format the feedback
      let formattedFeedback = "";
      if (reason) {
        formattedFeedback = `Reason: ${reason}`;
        if (reason === "Other" && feedback) {
          formattedFeedback += `, Details: ${feedback}`;
        }
      }
      
      // Delete the user and all associated data
      await storage.deleteUser(req.user!.id, formattedFeedback);
      
      // Destroy the session first
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Error during session destruction" });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Account deleted successfully" });
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}