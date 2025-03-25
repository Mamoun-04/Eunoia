
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
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
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEntrySchema = createInsertSchema(entries).pick({
  title: true,
  content: true,
  category: true,
  imageUrl: true,
});

export const subscriptionPlans = {
  monthly: {
    name: "Monthly Premium",
    price: 3.99,
  },
  yearly: {
    name: "Yearly Premium",
    price: 34.99,
  }
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entries.$inferSelect;
