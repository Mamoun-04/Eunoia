import type { Express } from "express";
import { createServer, type Server } from "http";
import { Router } from 'express';
import { setupAuth } from './auth';

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
import { insertEntrySchema, insertSavedLessonSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  const router = Router();
  setupStorageRoutes(router);
  app.use(router);


  const httpServer = createServer(app);
  return httpServer;
}