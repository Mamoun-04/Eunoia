
import type { Express } from "express";
import { createServer, type Server } from "http";
import { Router } from 'express';
import { storage } from "./storage";
import { setupAuth } from './auth';
import multer from "multer";
import express from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { z } from "zod";
import { insertEntrySchema, insertSavedLessonSchema } from "@shared/schema";

import { Client } from '@replit/object-storage';
const client = new Client({
  bucketName: process.env.BUCKET_NAME || 'default-bucket'
});

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
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

  // File upload route
  router.post("/api/upload", requireAuth, upload.single("image"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const uniqueName = `${uuidv4()}${path.extname(req.file.originalname)}`;
    const key = `user-uploads/${uniqueName}`;
    
    try {
      await client.uploadText(key, req.file.buffer.toString('base64'));
      const { url } = await client.getSignedUrl(key);
      res.json({ imageUrl: url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  const router = Router();
  setupStorageRoutes(router);
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  app.use(router);

  const httpServer = createServer(app);
  return httpServer;
}
