import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  subscriptionStatus: text("subscription_status").default("free").notNull(),
  subscriptionEndDate: timestamp("subscription_end_date"),
  preferences: text("preferences"), // Stored as JSON string
});

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define UserPreferences schema
export const userPreferencesSchema = z.object({
  name: z.string().optional(),
  profilePhoto: z.string().optional(),
  bio: z.string().optional(),
  goal: z.string().optional(),
  customGoal: z.string().optional(),
  interests: z.array(z.string()).default([]),
  subscriptionPlan: z.enum(["free", "monthly", "yearly"]).default("free"),
  theme: z.enum(["light", "dark"]).default("light"),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// Extend the insert user schema to include preferences
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
  })
  .extend({
    preferences: userPreferencesSchema.optional(),
  });

export const insertEntrySchema = createInsertSchema(entries).pick({
  title: true,
  content: true,
  mood: true,
  category: true,
  imageUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type InsertEntry = z.infer<typeof insertEntrySchema>;

export const lessonTypes = {
  text: "text",
} as const;

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  description: text("description").notNull(),
  questions: text("questions").notNull(), // JSON string of questions array
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPlans = {
  monthly: {
    price: 3.99,
    name: "Monthly Plan",
    interval: "month",
  },
  yearly: {
    price: 34.99,
    name: "Yearly Plan",
    interval: "year",
    monthlyPrice: 2.92,
  },
} as const;
