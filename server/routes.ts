import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
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
  app.post("/api/entries", requireAuth, async (req, res) => {
    try {
      const data = insertEntrySchema.parse(req.body);
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
      const { messages } = req.body;
      const recentMessages = messages?.slice(-10) || [];
      
      // Define system message to encourage varied responses
      const systemMessage = {
        role: "system",
        content: "You are an empathetic AI journaling assistant. Provide thoughtful, varied responses that help users reflect deeply on their thoughts and feelings. Never repeat the same response. If the user expresses emotions, acknowledge them specifically. Suggest relevant journaling prompts when appropriate."
      };

      // For now, generate dynamic mock responses based on context
      const lastUserMessage = recentMessages[recentMessages.length - 1]?.content?.toLowerCase() || "";
      
      let response = "";
      if (lastUserMessage.includes("sad") || lastUserMessage.includes("upset")) {
        response = "I hear that you're feeling down. Would you like to explore what's contributing to these feelings? Sometimes writing about our emotions can help us understand them better. Consider this prompt: 'What would help me feel more supported right now?'";
      } else if (lastUserMessage.includes("happy") || lastUserMessage.includes("good")) {
        response = "It's wonderful that you're feeling positive! Let's explore these good feelings. What specific moments or experiences contributed to your current state of mind?";
      } else if (lastUserMessage.includes("stress") || lastUserMessage.includes("anxious")) {
        response = "Managing stress can be challenging. Let's take a moment to break this down. What's the primary source of your stress? Writing about it can help create a sense of control and clarity.";
      } else if (recentMessages.length === 0) {
        response = "Welcome to your journaling session. What's on your mind today? I'm here to help you explore your thoughts and feelings.";
      } else {
        response = "Could you tell me more about that? Sometimes writing about our experiences helps us see them from a new perspective.";
      }

      res.json({ message: response });
    } catch (error) {
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
