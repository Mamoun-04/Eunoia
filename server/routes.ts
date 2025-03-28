import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";
import { insertEntrySchema, insertSavedLessonSchema } from "@shared/schema";
import { z } from "zod";
import { applePayments, stripePayments, isSubscriptionActive } from "./payment-utils";

// Database access
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

// Create a PostgreSQL connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle ORM instance with our schema
const db = drizzle(pool, { schema });

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

  // Set up Stripe and Apple IAP subscription endpoints
  app.post("/api/subscribe", requireAuth, async (req, res) => {
    const { plan, platform } = req.body;
    if (!plan || !["monthly", "yearly", "lifetime"].includes(plan)) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }
    
    // Get platform (default to web/stripe)
    const paymentPlatform = platform || 'web';
    
    if (paymentPlatform !== 'web' && paymentPlatform !== 'test' && paymentPlatform !== 'apple') {
      return res.status(400).json({ message: "Invalid platform. Use 'web' for website payments or 'apple' for iOS app." });
    }

    try {
      // Import payment utils dynamically
      const { stripePayments, applePayments, isSubscriptionActive } = await import('./payment-utils');
      
      // Get user 
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user preferences with subscription plan
      let userPreferences: Record<string, any> = {};
      if (user.preferences) {
        try {
          userPreferences = JSON.parse(user.preferences);
        } catch (e) {
          console.error("Error parsing user preferences:", e);
        }
      }
      
      // Update preferences with the new subscription plan
      userPreferences = {
        ...userPreferences,
        subscriptionPlan: plan
      };
      
      // For testing mode, create a mock subscription
      if (paymentPlatform === 'test') {
        // Set subscription end date based on plan
        const endDate = new Date();
        if (plan === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (plan === 'yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          // For lifetime, set a far future date
          endDate.setFullYear(endDate.getFullYear() + 100);
        }
        
        // Update user in database
        await storage.updateUser(req.user!.id, {
          subscriptionStatus: "active",
          subscriptionPlan: plan,
          subscriptionEndDate: endDate,
          paymentProcessor: 'test',
          preferences: JSON.stringify(userPreferences)
        });
        
        return res.json({ success: true, plan });
      }
      
      // For web platform, create Stripe payment
      if (paymentPlatform === 'web') {
        // Get or create Stripe customer
        const email = userPreferences.email || `user_${req.user!.id}@example.com`; // Fallback email
        const customer = await stripePayments.getOrCreateCustomer(req.user!.id, email);
        
        // Create subscription or payment
        const paymentResult = await stripePayments.createSubscription(customer.id, plan);
        
        // Update user record
        if (paymentResult.type === 'subscription' && paymentResult.subscription) {
          // For subscription (monthly/yearly)
          await storage.updateUser(req.user!.id, {
            stripeCustomerId: customer.id,
            stripeSubscriptionId: paymentResult.subscription.id,
            subscriptionStatus: "pending", // Will be updated to active when webhook confirms payment
            subscriptionPlan: plan,
            subscriptionEndDate: paymentResult.endDate,
            paymentProcessor: 'stripe',
            preferences: JSON.stringify(userPreferences)
          });
          
          // Return client secret for frontend to complete payment
          return res.json({
            success: true,
            requiresAction: true,
            clientSecret: (paymentResult.subscription.latest_invoice as any).payment_intent.client_secret,
            subscriptionId: paymentResult.subscription.id
          });
        } else if (paymentResult.type === 'payment_intent' && paymentResult.paymentIntent) {
          // For one-time payment (lifetime)
          await storage.updateUser(req.user!.id, {
            stripeCustomerId: customer.id,
            subscriptionStatus: "pending", // Will be updated to active when webhook confirms payment
            subscriptionPlan: plan,
            paymentProcessor: 'stripe',
            preferences: JSON.stringify(userPreferences)
          });
          
          // Return client secret for frontend to complete payment
          return res.json({
            success: true,
            requiresAction: true,
            clientSecret: paymentResult.paymentIntent.client_secret,
            paymentIntentId: paymentResult.paymentIntent.id
          });
        } else {
          return res.status(500).json({ message: "Failed to create payment" });
        }
      }
      
      // For Apple platform, verify the receipt
      if (paymentPlatform === 'apple') {
        const { receiptData } = req.body;
        
        if (!receiptData) {
          return res.status(400).json({ message: "Receipt data is required for Apple IAP verification" });
        }
        
        try {
          // Initialize IAP validation
          await import('./payment-utils').then(module => module.setupIAP());
          
          // Verify the receipt
          const verificationResult = await applePayments.verifyReceipt(receiptData);
          
          // Check if active
          const isActive = isSubscriptionActive(verificationResult.endDate, verificationResult.planType);
          
          if (!isActive) {
            return res.status(400).json({ message: "Subscription is not active" });
          }
          
          // Calculate end date based on the plan
          let endDate: Date | null = verificationResult.endDate;
          if (verificationResult.planType === 'lifetime') {
            // For lifetime subscription, set far future date
            endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 100);
          }
          
          // Update user record
          await storage.updateUser(req.user!.id, {
            subscriptionStatus: "active",
            subscriptionPlan: verificationResult.planType,
            subscriptionEndDate: endDate,
            paymentProcessor: 'apple',
            appleOriginalTransactionId: verificationResult.originalTransactionId,
            preferences: JSON.stringify(userPreferences)
          });
          
          return res.json({
            success: true,
            plan: verificationResult.planType,
            endDate: endDate
          });
        } catch (error) {
          console.error('Apple IAP verification error:', error);
          return res.status(400).json({ message: "Invalid receipt data" });
        }
      }
      
      // If we reach here, something went wrong
      return res.status(400).json({ message: "Invalid payment platform" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process subscription" });
    }
  });
  
  // Real cancel subscription endpoint
  app.post("/api/cancel-subscription", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If Stripe subscription, cancel it in Stripe
      if (user.paymentProcessor === 'stripe' && user.stripeSubscriptionId) {
        const { stripePayments } = await import('./payment-utils');
        await stripePayments.cancelSubscription(user.stripeSubscriptionId);
      }
      
      // Set subscription status to "canceled" but keep the end date
      // This allows users to continue using premium features until their subscription period ends
      await storage.updateUser(req.user!.id, {
        subscriptionStatus: "canceled"
      });
      
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });
  
  // Apple App Store notification URL for handling IAP events
  app.post("/api/apple/webhook", async (req, res) => {
    try {
      const notification = req.body;
      console.log('Received Apple notification:', JSON.stringify(notification));
      
      // Extract notification type and data
      const notificationType = notification.notificationType;
      const subtype = notification.subtype;
      const notificationData = notification.data;
      
      if (!notificationType || !notificationData) {
        return res.status(400).json({ message: "Invalid notification format" });
      }
      
      // Process based on the notification type
      switch (notificationType) {
        case 'SUBSCRIBED': // Initial subscription
        case 'DID_RENEW': // Subscription was renewed
          if (notificationData.signedTransactionInfo) {
            // Process successful subscription renewal
            const originalTransactionId = notificationData.signedTransactionInfo.originalTransactionId;
            if (!originalTransactionId) {
              console.error('Missing originalTransactionId in Apple notification');
              return res.status(400).json({ message: "Missing transaction ID" });
            }
            
            try {
              // Get user by Apple original transaction ID
              console.log(`Looking for user with Apple transaction ID: ${originalTransactionId}`);
              const result = await db.select()
                .from(schema.users)
                .where(eq(schema.users.appleOriginalTransactionId, originalTransactionId))
                .limit(1);
                
              if (result.length === 0) {
                console.error('No user found with Apple transaction ID:', originalTransactionId);
                return res.status(404).json({ message: "User not found" });
              }
              
              const user = result[0];
              console.log(`Found user ${user.id} with Apple transaction ID ${originalTransactionId}`);
              
              // Calculate new subscription end date
              // This information should be in the notification, but we'll calculate a default as fallback
              let endDate = new Date();
              if (user.subscriptionPlan === 'monthly') {
                endDate.setMonth(endDate.getMonth() + 1); // Add 1 month
              } else if (user.subscriptionPlan === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1); // Add 1 year
              } else if (user.subscriptionPlan === 'lifetime') {
                endDate.setFullYear(endDate.getFullYear() + 100); // Far future for lifetime plans
              }
              
              // Update user subscription status to active
              await storage.updateUser(user.id, {
                subscriptionStatus: "active",
                subscriptionEndDate: endDate,
                paymentProcessor: 'apple'
              });
              
              console.log(`Activated subscription for user ${user.id} via Apple IAP`);
            } catch (err) {
              console.error('Error processing Apple subscription event:', err);
              return res.status(500).json({ message: "Database error" });
            }
          }
          break;
          
        case 'DID_CHANGE_RENEWAL_STATUS':
          if (subtype === 'AUTO_RENEW_DISABLED') {
            // User turned off auto-renewal
            const originalTransactionId = notificationData.signedRenewalInfo?.originalTransactionId;
            if (originalTransactionId) {
              try {
                // Get user by Apple original transaction ID
                const result = await db.select()
                  .from(schema.users)
                  .where(eq(schema.users.appleOriginalTransactionId, originalTransactionId))
                  .limit(1);
                  
                if (result.length === 0) {
                  console.error('No user found with Apple transaction ID:', originalTransactionId);
                  return res.status(404).json({ message: "User not found" });
                }
                
                const user = result[0];
                
                // Mark subscription as canceled but don't change end date
                await storage.updateUser(user.id, {
                  subscriptionStatus: "canceled"
                });
                
                console.log(`Marked subscription as canceled for user ${user.id} via Apple IAP`);
              } catch (err) {
                console.error('Error processing Apple cancellation event:', err);
                return res.status(500).json({ message: "Database error" });
              }
            }
          }
          break;
          
        case 'EXPIRED':
          // Subscription expired
          if (notificationData.signedTransactionInfo) {
            const originalTransactionId = notificationData.signedTransactionInfo.originalTransactionId;
            if (originalTransactionId) {
              try {
                // Get user by Apple original transaction ID
                const result = await db.select()
                  .from(schema.users)
                  .where(eq(schema.users.appleOriginalTransactionId, originalTransactionId))
                  .limit(1);
                  
                if (result.length === 0) {
                  console.error('No user found with Apple transaction ID:', originalTransactionId);
                  return res.status(404).json({ message: "User not found" });
                }
                
                const user = result[0];
                
                // Mark subscription as expired
                await storage.updateUser(user.id, {
                  subscriptionStatus: "expired",
                  subscriptionEndDate: new Date() // Set to current date
                });
                
                console.log(`Marked subscription as expired for user ${user.id} via Apple IAP`);
              } catch (err) {
                console.error('Error processing Apple expiration event:', err);
                return res.status(500).json({ message: "Database error" });
              }
            }
          }
          break;
      }
      
      // Apple expects a 200 response
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Apple webhook error:', error);
      res.status(400).json({ message: "Error processing notification" });
    }
  });
  
  // Stripe webhook endpoint to handle subscription events
  app.post("/api/stripe/webhook", async (req, res) => {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).json({ message: "Missing stripe-signature header" });
    }
    
    try {
      const { default: Stripe } = await import('stripe');
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key';
      const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy_secret';
      const stripe = new Stripe(stripeSecretKey);
      
      // Verify webhook signature
      const event = stripe.webhooks.constructEvent(
        req.body.toString(),
        signature,
        stripeWebhookSecret
      );
      
      console.log(`Received Stripe webhook event: ${event.type}`);
      
      // Handle the event based on its type
      if (event.type === 'checkout.session.completed') {
        // Payment is successful and checkout session completed
        const session = event.data.object as any;
        
        // Check if we have a customer ID
        if (!session.customer) {
          console.error('No customer ID in checkout session');
          return res.status(400).json({ message: "Invalid checkout session" });
        }
        
        console.log(`Looking for user with Stripe customer ID: ${session.customer}`);
        
        try {
          // Get user by Stripe customer ID
          const result = await db.select()
            .from(schema.users)
            .where(eq(schema.users.stripeCustomerId, session.customer))
            .limit(1);
            
          if (result.length === 0) {
            console.error('No user found with Stripe customer ID:', session.customer);
            return res.status(404).json({ message: "User not found" });
          }
          
          const user = result[0];
          console.log(`Found user ${user.id} with Stripe customer ID ${session.customer}`);
          
          // Update user subscription status to active
          await storage.updateUser(user.id, {
            subscriptionStatus: "active"
          });
          
          console.log(`Activated subscription for user ${user.id} via checkout.session.completed`);
        } catch (err) {
          console.error('Error finding user by Stripe customer ID:', err);
          return res.status(500).json({ message: "Database error" });
        }
      } else if (event.type === 'invoice.payment_succeeded') {
        // Subscription payment succeeded
        const invoice = event.data.object as any;
        
        if (!invoice.subscription) {
          console.error('No subscription ID in invoice');
          return res.status(400).json({ message: "Invalid invoice" });
        }
        
        console.log(`Looking for user with Stripe subscription ID: ${invoice.subscription}`);
        
        try {
          // Get user by Stripe subscription ID
          const result = await db.select()
            .from(schema.users)
            .where(eq(schema.users.stripeSubscriptionId, invoice.subscription))
            .limit(1);
            
          if (result.length === 0) {
            console.error('No user found with Stripe subscription ID:', invoice.subscription);
            return res.status(404).json({ message: "User not found" });
          }
          
          const user = result[0];
          console.log(`Found user ${user.id} with Stripe subscription ID ${invoice.subscription}`);
          
          // Update user subscription status to active
          await storage.updateUser(user.id, {
            subscriptionStatus: "active"
          });
          
          console.log(`Activated subscription for user ${user.id} via invoice.payment_succeeded`);
        } catch (err) {
          console.error('Error finding user by Stripe subscription ID:', err);
          return res.status(500).json({ message: "Database error" });
        }
      } else if (event.type === 'payment_intent.succeeded') {
        // One-time payment succeeded (lifetime plan)
        const paymentIntent = event.data.object as any;
        
        if (!paymentIntent.customer) {
          console.error('No customer ID in payment intent');
          return res.status(400).json({ message: "Invalid payment intent" });
        }
        
        console.log(`Looking for user with Stripe customer ID: ${paymentIntent.customer}`);
        
        try {
          // Get user by Stripe customer ID
          const result = await db.select()
            .from(schema.users)
            .where(eq(schema.users.stripeCustomerId, paymentIntent.customer))
            .limit(1);
            
          if (result.length === 0) {
            console.error('No user found with Stripe customer ID:', paymentIntent.customer);
            return res.status(404).json({ message: "User not found" });
          }
          
          const user = result[0];
          console.log(`Found user ${user.id} with Stripe customer ID ${paymentIntent.customer}`);
          
          // Set a far future date for lifetime subscription
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 100);
          
          // Update user subscription status to active
          await storage.updateUser(user.id, {
            subscriptionStatus: "active",
            subscriptionEndDate: endDate
          });
          
          console.log(`Activated lifetime subscription for user ${user.id}`);
        } catch (err) {
          console.error('Error finding user by Stripe customer ID:', err);
          return res.status(500).json({ message: "Database error" });
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(400).json({ message: "Webhook error" });
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

  // (Endpoint already defined above)
  
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
