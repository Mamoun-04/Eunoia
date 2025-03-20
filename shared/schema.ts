import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  subscriptionStatus: text("subscription_status").default("free").notNull(),  
  subscriptionEndDate: timestamp("subscription_end_date")
});

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

export const insertEntrySchema = createInsertSchema(entries).pick({
  title: true,
  content: true,
  mood: true,
  category: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type InsertEntry = z.infer<typeof insertEntrySchema>;

export const moodOptions = [
  "very_sad",
  "sad", 
  "neutral",
  "happy",
  "very_happy"
] as const;

export const categoryOptions = [
  "Work & Career",
  "Gratitude",
  "Creativity", 
  "Daily Reflection",
  "Health & Wellness",
  "Memories",
  "Emotions",
  "Goals & Planning",
  "Personal Growth",
  "Reflection"
] as const;

export const subscriptionPlans = {
  monthly: {
    price: 14.99,
    name: "Monthly Plan",
    interval: "month"
  },
  yearly: {
    price: 89.99,
    name: "Yearly Plan", 
    interval: "year"
  }
} as const;
