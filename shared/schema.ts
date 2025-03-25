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

// Update entries table with a new "tags" column.
// (If your database supports JSONB, you might use that instead.)
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  // Removed mood if not used in the editor.
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  // New tags field, stored as a JSON string.
  tags: text("tags").default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create an insert schema for entries.
// We pick the fields we want to allow for insertion and then extend to add tags.
export const insertEntrySchema = createInsertSchema(entries)
  .pick({
    title: true,
    content: true,
    category: true,
    imageUrl: true,
  })
  .extend({
    // Parse tags as an array of strings; default to an empty array.
    tags: z.array(z.string()).default([]),
  });

export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entries.$inferSelect;
