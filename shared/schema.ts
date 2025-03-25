import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// -------------------
// Drizzle Table Setup
// -------------------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// -------------------
// Preferences Schema
// -------------------
export const userPreferencesSchema = z.object({
  name: z.string().optional(),
  profilePhoto: z.string().optional(),
  bio: z.string().optional(),
  goal: z.string().optional(),
  customGoal: z.string().optional(),
  interests: z.array(z.string()).default([]),
  subscriptionPlan: z.enum(['free', 'monthly', 'yearly']).default('free'),
  theme: z.enum(['light', 'dark']).default('light')
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// -------------------
// 1) Base User Schema
// -------------------
// NOTE: createInsertSchema() returns a Zod schema based on the Drizzle table definition.
// By default, it includes *all* columns. We `.pick()` only the columns we want from "users".
export const baseUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    email: true,
    password: true,
  })
  .extend({
    preferences: userPreferencesSchema.optional(),
  }); // <-- This is still a ZodObject

// ---------------------------
// 2) Registration User Schema
// ---------------------------
// Now we refine the base schema for password length, etc.
// Once we call .refine(), it becomes a ZodEffects.
export const insertUserSchema = baseUserSchema.refine(
  (data) => data.password.length >= 8,
  { message: "Password must be at least 8 characters long", path: ["password"] }
);

// ----------------------
// 3) Login User Schema
// ----------------------
// If you only want username & password for login, pick from the *base* (ZodObject).
export const loginUserSchema = baseUserSchema.pick({
  username: true,
  password: true,
});

// -------------------
// Entries Schema
// -------------------
export const insertEntrySchema = createInsertSchema(entries).pick({
  title: true,
  content: true,
  category: true,
  imageUrl: true
});

export type InsertUser = z.infer<typeof insertUserSchema>; // Registration type
export type LoginUser = z.infer<typeof loginUserSchema>;   // Login type
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});



export const subscriptionPlans = {
  monthly: {
    price: 3.99,
    name: "Monthly Plan",
    interval: "month"
  },
  yearly: {
    price: 34.99,
    name: "Yearly Plan", 
    interval: "year",
    monthlyPrice: 2.92
  }
} as const;
