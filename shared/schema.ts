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
  theme: z.enum(["light", "dark"]).default("light"),
  // No subscription plan needed - all features are available to all users
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

// All features are available to everyone - no subscription plans needed
