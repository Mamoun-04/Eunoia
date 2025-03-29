import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';
import { IStorage } from './storage';
import session from "express-session";
import { createInsertSchema } from "drizzle-zod";
import { eq, and, gte, lte, count } from 'drizzle-orm';
import { User, InsertUser, Entry, InsertEntry, SavedLesson, InsertSavedLesson } from '@shared/schema';
import pgSessionStore from 'connect-pg-simple';

const { Pool } = pg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle ORM instance with our schema
const db = drizzle(pool, { schema });

// Initialize the session store
const PgSessionStore = pgSessionStore(session);
const sessionStore = new PgSessionStore({
  pool,
  tableName: 'session', // Default table name
  createTableIfMissing: true,
});

export class PgStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = sessionStore;
    this.initializeDatabase().catch(err => {
      console.error('Failed to initialize database tables:', err);
    });
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  // Initialize database tables if they don't exist
  private async initializeDatabase() {
    try {
      // Create the tables if they don't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          subscription_status TEXT NOT NULL DEFAULT 'free',
          subscription_end_date TIMESTAMP,
          preferences TEXT,
          current_streak INTEGER DEFAULT 0,
          last_activity_date TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS entries (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          mood TEXT NOT NULL,
          category TEXT NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );

        CREATE TABLE IF NOT EXISTS saved_lessons (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          lesson_id TEXT NOT NULL,
          title TEXT NOT NULL,
          user_entry_text TEXT NOT NULL,
          is_pinned_to_home BOOLEAN DEFAULT false NOT NULL,
          completion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);
      console.log('Database tables initialized');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const users = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      return users.length ? users[0] : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const users = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
      return users.length ? users[0] : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Handle preferences - convert to string if provided
      const preferencesString = user.preferences ? JSON.stringify(user.preferences) : null;
      
      const [newUser] = await db.insert(schema.users).values({
        username: user.username,
        password: user.password,
        preferences: preferencesString,
        subscriptionStatus: 'free',
        currentStreak: 0
      } as any).returning();
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    try {
      // Handle preferences - convert to string if provided
      let updateData = { ...data };
      
      if (updateData.preferences && typeof updateData.preferences !== 'string') {
        updateData.preferences = JSON.stringify(updateData.preferences);
      }
      
      const [updatedUser] = await db.update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, id))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: number, feedback?: string): Promise<void> {
    try {
      // Delete all entries associated with the user
      await db.delete(schema.entries).where(eq(schema.entries.userId, id));
      
      // Delete all saved lessons associated with the user
      await db.delete(schema.savedLessons).where(eq(schema.savedLessons.userId, id));
      
      // Delete the user
      await db.delete(schema.users).where(eq(schema.users.id, id));
      
      // Log feedback if provided
      if (feedback) {
        console.log(`User ${id} deleted with feedback: ${feedback}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Entry methods
  async createEntry(userId: number, entry: InsertEntry): Promise<Entry> {
    try {
      // Update user streak when creating a new entry
      await this.updateUserStreak(userId);
      
      const [newEntry] = await db.insert(schema.entries).values({
        userId: userId,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        category: entry.category,
        imageUrl: entry.imageUrl
      }).returning();
      
      return newEntry;
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  }

  async getEntries(userId: number): Promise<Entry[]> {
    try {
      const entries = await db.select()
        .from(schema.entries)
        .where(eq(schema.entries.userId, userId))
        .orderBy(schema.entries.createdAt, 'desc' as any);
      
      return entries;
    } catch (error) {
      console.error('Error getting entries:', error);
      throw error;
    }
  }

  async getEntry(id: number): Promise<Entry | undefined> {
    try {
      const entries = await db.select()
        .from(schema.entries)
        .where(eq(schema.entries.id, id))
        .limit(1);
      
      return entries.length ? entries[0] : undefined;
    } catch (error) {
      console.error('Error getting entry:', error);
      throw error;
    }
  }

  async updateEntry(id: number, data: Partial<Entry>): Promise<Entry> {
    try {
      const [updatedEntry] = await db.update(schema.entries)
        .set(data)
        .where(eq(schema.entries.id, id))
        .returning();
      
      return updatedEntry;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }

  async deleteEntry(id: number): Promise<void> {
    try {
      await db.delete(schema.entries).where(eq(schema.entries.id, id));
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }

  // Saved Lessons methods
  async createSavedLesson(userId: number, savedLesson: InsertSavedLesson): Promise<SavedLesson> {
    try {
      const [newSavedLesson] = await db.insert(schema.savedLessons).values({
        userId: userId,
        lessonId: savedLesson.lessonId,
        title: savedLesson.title,
        userEntryText: savedLesson.userEntryText,
        isPinnedToHome: false
      } as any).returning();
      
      return newSavedLesson;
    } catch (error) {
      console.error('Error creating saved lesson:', error);
      throw error;
    }
  }

  async getSavedLessons(userId: number): Promise<SavedLesson[]> {
    try {
      const savedLessons = await db.select()
        .from(schema.savedLessons)
        .where(eq(schema.savedLessons.userId, userId))
        .orderBy(schema.savedLessons.createdAt, 'desc' as any);
      
      return savedLessons;
    } catch (error) {
      console.error('Error getting saved lessons:', error);
      throw error;
    }
  }

  async getSavedLesson(id: number): Promise<SavedLesson | undefined> {
    try {
      const savedLessons = await db.select()
        .from(schema.savedLessons)
        .where(eq(schema.savedLessons.id, id))
        .limit(1);
      
      return savedLessons.length ? savedLessons[0] : undefined;
    } catch (error) {
      console.error('Error getting saved lesson:', error);
      throw error;
    }
  }

  async deleteSavedLesson(id: number): Promise<void> {
    try {
      await db.delete(schema.savedLessons).where(eq(schema.savedLessons.id, id));
    } catch (error) {
      console.error('Error deleting saved lesson:', error);
      throw error;
    }
  }

  // Streak methods
  async getUserStreak(userId: number): Promise<number> {
    try {
      const users = await db.select({ currentStreak: schema.users.currentStreak })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);
      
      return users.length ? users[0].currentStreak || 0 : 0;
    } catch (error) {
      console.error('Error getting user streak:', error);
      throw error;
    }
  }

  async updateUserStreak(userId: number): Promise<number> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let newStreak = user.currentStreak || 0;
      let shouldUpdateStreak = false;
      
      // If user has no last activity date, this is their first entry
      if (!user.lastActivityDate) {
        newStreak = 1;
        shouldUpdateStreak = true;
      } else {
        const lastActivityDate = new Date(user.lastActivityDate);
        lastActivityDate.setHours(0, 0, 0, 0);
        
        // Calculate the difference in days
        const diffTime = today.getTime() - lastActivityDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // If user wrote yesterday, increment streak
        if (diffDays === 1) {
          newStreak += 1;
          shouldUpdateStreak = true;
        }
        // If user already wrote today, keep streak the same
        else if (diffDays === 0) {
          // Don't update anything
        }
        // If user missed a day or more, reset streak to 1
        else {
          newStreak = 1;
          shouldUpdateStreak = true;
        }
      }
      
      if (shouldUpdateStreak || !user.lastActivityDate) {
        // Update the streak and last activity date
        await db.update(schema.users)
          .set({
            currentStreak: newStreak,
            lastActivityDate: today
          })
          .where(eq(schema.users.id, userId));
      }
      
      return newStreak;
    } catch (error) {
      console.error('Error updating user streak:', error);
      throw error;
    }
  }

  // Free user limit methods
  async canCreateEntry(userId: number): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');
      
      // Premium users can create unlimited entries
      if (user.subscriptionStatus === 'active') {
        return { allowed: true };
      }
      
      // Check daily entry count for free users
      const dailyCount = await this.getUserDailyEntryCount(userId);
      if (dailyCount >= 1) {
        return {
          allowed: false,
          reason: "Free users can only create 1 entry per day. Upgrade to premium for unlimited entries."
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.error('Error checking if user can create entry:', error);
      throw error;
    }
  }

  async canAddImage(userId: number): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');
      
      // Only premium users can add images
      if (user.subscriptionStatus !== 'active') {
        return {
          allowed: false,
          reason: "Image uploads are a premium feature. Upgrade to add images to your entries."
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.error('Error checking if user can add image:', error);
      throw error;
    }
  }

  async getEntryContentLimit(userId: number): Promise<number> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');
      
      // Premium users have higher content limits
      return user.subscriptionStatus === 'active' ? 1000 : 250;
    } catch (error) {
      console.error('Error getting entry content limit:', error);
      throw error;
    }
  }

  async getUserDailyEntryCount(userId: number): Promise<number> {
    try {
      // Get today's start and end timestamps
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      
      // Count entries created today
      const result = await db.select({ count: count() })
        .from(schema.entries)
        .where(
          and(
            eq(schema.entries.userId, userId),
            gte(schema.entries.createdAt, startOfDay),
            lte(schema.entries.createdAt, endOfDay)
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting user daily entry count:', error);
      throw error;
    }
  }
  
  async getUserDailyImageCount(userId: number): Promise<number> {
    try {
      // Get today's start and end timestamps
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      
      // Count entries with images created today
      const result = await db.select({ count: count() })
        .from(schema.entries)
        .where(
          and(
            eq(schema.entries.userId, userId),
            gte(schema.entries.createdAt, startOfDay),
            lte(schema.entries.createdAt, endOfDay)
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting user daily image count:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const pgStorage = new PgStorage();