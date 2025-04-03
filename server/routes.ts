
import type { Express } from "express";
import { createServer, type Server } from "http";
import { Router } from 'express';
import { storage } from "./storage";
import { setupAuth } from './auth';
import multer from "multer";
import express from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { insertEntrySchema, insertSavedLessonSchema } from "@shared/schema";
import { v2 as cloudinary } from 'cloudinary';
import * as stream from 'stream';
import { promisify } from 'util';

// Define Cloudinary upload result interface
interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
}

// We are using Cloudinary for image storage, no need for Replit object storage

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Allow only specific image formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max size
  }
});

function setupStorageRoutes(router: Router) {
  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // User routes
  router.get("/api/user", requireAuth, (req, res) => {
    res.json(req.user);
  });

  // Entry routes
  router.post("/api/entries", requireAuth, async (req, res) => {
    try {
      const entry = await storage.createEntry(req.user!.id, req.body);
      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ message: "Failed to create entry" });
    }
  });

  router.get("/api/entries", requireAuth, async (req, res) => {
    try {
      const entries = await storage.getEntries(req.user!.id);
      res.json(entries);
    } catch (error) {
      res.status(400).json({ message: "Failed to get entries" });
    }
  });

  router.get("/api/entries/:id", requireAuth, async (req, res) => {
    try {
      const entry = await storage.getEntry(parseInt(req.params.id));
      if (!entry || entry.userId !== req.user!.id) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Failed to get entry" });
    }
  });

  router.put("/api/entries/:id", requireAuth, async (req, res) => {
    try {
      const entry = await storage.getEntry(parseInt(req.params.id));
      if (!entry || entry.userId !== req.user!.id) {
        return res.status(404).json({ message: "Entry not found" });
      }
      const updatedEntry = await storage.updateEntry(parseInt(req.params.id), req.body);
      res.json(updatedEntry);
    } catch (error) {
      res.status(400).json({ message: "Failed to update entry" });
    }
  });

  router.delete("/api/entries/:id", requireAuth, async (req, res) => {
    try {
      const entry = await storage.getEntry(parseInt(req.params.id));
      if (!entry || entry.userId !== req.user!.id) {
        return res.status(404).json({ message: "Entry not found" });
      }
      await storage.deleteEntry(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete entry" });
    }
  });

  // Saved Lessons routes
  router.post("/api/saved-lessons", requireAuth, async (req, res) => {
    try {
      const savedLesson = await storage.createSavedLesson(req.user!.id, req.body);
      res.status(201).json(savedLesson);
    } catch (error) {
      res.status(400).json({ message: "Failed to save lesson" });
    }
  });

  router.get("/api/saved-lessons", requireAuth, async (req, res) => {
    try {
      const savedLessons = await storage.getSavedLessons(req.user!.id);
      res.json(savedLessons);
    } catch (error) {
      res.status(400).json({ message: "Failed to get saved lessons" });
    }
  });

  router.delete("/api/saved-lessons/:id", requireAuth, async (req, res) => {
    try {
      const savedLesson = await storage.getSavedLesson(parseInt(req.params.id));
      if (!savedLesson || savedLesson.userId !== req.user!.id) {
        return res.status(404).json({ message: "Saved lesson not found" });
      }
      await storage.deleteSavedLesson(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete saved lesson" });
    }
  });

  // User management routes
  router.put("/api/user", requireAuth, async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user!.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  router.delete("/api/user", requireAuth, async (req, res) => {
    try {
      await storage.deleteUser(req.user!.id, req.body.feedback);
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
        }
        res.status(204).send();
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete user" });
    }
  });

  // Cloudinary image upload route (authentication disabled for testing)
  router.post("/api/upload", upload.single("image"), async (req, res) => {
    // Check if file exists in the request
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    try {
      // Convert buffer to base64 string for Cloudinary upload
      const base64Image = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;
      
      // Upload to Cloudinary with transformation options
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload(dataURI, {
          // Add folder to organize uploads
          folder: 'journal-app-uploads', 
          // Set resource type to auto for proper file detection
          resource_type: 'auto',
          // Apply transformations:
          // - Convert to webp format for better compression
          // - Resize to max width of 800px while maintaining aspect ratio
          // - Set quality to 90% for good balance of quality and file size
          transformation: [
            { width: 800, crop: 'limit' },
            { quality: 90, fetch_format: 'webp' }
          ]
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      
      // Type assertion as the right shape, but avoid direct cast to our interface
      const uploadResult = result as any;
      
      // Return the secure Cloudinary URL and metadata
      res.json({ 
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({ message: "Failed to upload image to Cloudinary" });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  const router = Router();
  setupStorageRoutes(router);

  // Stripe routes
  // Middleware for authentication check
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  router.post("/api/create-checkout-session", requireAuth, async (req, res) => {
    try {
      const { priceId, trialDays } = req.body;
      const session = await createCheckoutSession(req.user!.id, priceId, trialDays);
      res.json({ sessionId: session.id });
    } catch (error) {
      res.status(400).json({ message: "Failed to create checkout session" });
    }
  });

  router.post("/api/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      await handleWebhook(event);
      res.json({ received: true });
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });
  
  // No need for the image serving route since Cloudinary will host the images directly
  // with their own CDN URLs
  
  // Add a test route for the upload demo
  router.get('/upload-test', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'upload-test.html'));
  });
  
  app.use(router);

  const httpServer = createServer(app);
  return httpServer;
}
