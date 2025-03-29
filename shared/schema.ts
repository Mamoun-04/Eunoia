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
  subscriptionActive: boolean("subscription_active").default(false),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  preferences: text("preferences"), // Stored as JSON string
  currentStreak: integer("current_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
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

// Extend the insert user schema to include preferences and validation
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
  })
  .extend({
    username: z.string().min(4, "Username must be at least 4 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
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

export const savedLessons = pgTable("saved_lessons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  title: text("title").notNull(),
  userEntryText: text("user_entry_text").notNull(), // Stores the full text of the user's answers
  isPinnedToHome: boolean("is_pinned_to_home").default(false).notNull(),
  completionTimestamp: timestamp("completion_timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavedLessonSchema = createInsertSchema(savedLessons).pick({
  lessonId: true,
  title: true,
  userEntryText: true,
});

export type SavedLesson = typeof savedLessons.$inferSelect;
export type InsertSavedLesson = z.infer<typeof insertSavedLessonSchema>;

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
