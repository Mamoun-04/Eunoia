import { User, InsertUser, Entry, InsertEntry, SavedLesson, InsertSavedLesson, UserPreferences } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  deleteUser(id: number, feedback?: string): Promise<void>;
  
  createEntry(userId: number, entry: InsertEntry): Promise<Entry>;
  getEntries(userId: number): Promise<Entry[]>;
  getEntry(id: number): Promise<Entry | undefined>;
  updateEntry(id: number, data: Partial<Entry>): Promise<Entry>;
  deleteEntry(id: number): Promise<void>;
  
  // Saved Lessons methods
  createSavedLesson(userId: number, savedLesson: InsertSavedLesson): Promise<SavedLesson>;
  getSavedLessons(userId: number): Promise<SavedLesson[]>;
  getSavedLesson(id: number): Promise<SavedLesson | undefined>;
  deleteSavedLesson(id: number): Promise<void>;
  
  // Streak methods
  updateUserStreak(userId: number): Promise<number>;
  getUserStreak(userId: number): Promise<number>;
  
  // Free user limit methods
  canCreateEntry(userId: number): Promise<{ allowed: boolean; reason?: string }>;
  canAddImage(userId: number): Promise<{ allowed: boolean; reason?: string }>;
  getEntryContentLimit(userId: number): Promise<number>;
  getUserDailyEntryCount(userId: number): Promise<number>;
  getUserDailyImageCount(userId: number): Promise<number>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private entries: Map<number, Entry>;
  private savedLessons: Map<number, SavedLesson>;
  private currentUserId: number;
  private currentEntryId: number;
  private currentSavedLessonId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.entries = new Map();
    this.savedLessons = new Map();
    this.currentUserId = 1;
    this.currentEntryId = 1;
    this.currentSavedLessonId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    
    // Handle preferences - convert to string if provided
    const preferencesString = insertUser.preferences 
      ? JSON.stringify(insertUser.preferences) 
      : null;
      
    const user: User = {
      username: insertUser.username,
      password: insertUser.password,
      id,
      subscriptionStatus: "free",
      subscriptionEndDate: null,
      preferences: preferencesString,
      currentStreak: 0,
      lastActivityDate: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createEntry(userId: number, insertEntry: InsertEntry): Promise<Entry> {
    const id = this.currentEntryId++;
    const entry: Entry = {
      ...insertEntry,
      id,
      userId,
      imageUrl: insertEntry.imageUrl || null,
      createdAt: new Date()
    };
    this.entries.set(id, entry);
    return entry;
  }

  async getEntries(userId: number): Promise<Entry[]> {
    return Array.from(this.entries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getEntry(id: number): Promise<Entry | undefined> {
    return this.entries.get(id);
  }

  async updateEntry(id: number, data: Partial<Entry>): Promise<Entry> {
    const entry = await this.getEntry(id);
    if (!entry) throw new Error("Entry not found");
    
    const updatedEntry = { ...entry, ...data };
    this.entries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteEntry(id: number): Promise<void> {
    this.entries.delete(id);
  }
  
  async deleteUser(id: number, feedback?: string): Promise<void> {
    // Optionally store feedback before deletion
    if (feedback) {
      // In a real application, we might store this feedback in a separate table
      console.log(`User ${id} deletion feedback: ${feedback}`);
    }
    
    // Delete all user's entries
    const userEntries = await this.getEntries(id);
    for (const entry of userEntries) {
      await this.deleteEntry(entry.id);
    }
    
    // Delete all user's saved lessons
    const userSavedLessons = await this.getSavedLessons(id);
    for (const savedLesson of userSavedLessons) {
      await this.deleteSavedLesson(savedLesson.id);
    }
    
    // Delete the user
    this.users.delete(id);
  }

  // Free user limit implementation methods
  async canCreateEntry(userId: number): Promise<{ allowed: boolean; reason?: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { allowed: false, reason: "User not found" };
    }

    // Parse user preferences to get subscription plan
    let userPreferences: Partial<UserPreferences> = { 
      subscriptionPlan: "free", 
      interests: [], 
      theme: "light" 
    };
    
    if (user.preferences) {
      try {
        userPreferences = JSON.parse(user.preferences) as UserPreferences;
      } catch (e) {
        console.error("Error parsing user preferences:", e);
      }
    }

    // Premium users can create unlimited entries
    if (userPreferences.subscriptionPlan === "monthly" || userPreferences.subscriptionPlan === "yearly") {
      return { allowed: true };
    }

    // Free users are limited to 1 entry per day
    const dailyEntryCount = await this.getUserDailyEntryCount(userId);
    if (dailyEntryCount >= 1) {
      return { 
        allowed: false, 
        reason: "Free users are limited to 1 entry per day. Upgrade to Premium for unlimited journaling."
      };
    }

    return { allowed: true };
  }

  async canAddImage(userId: number): Promise<{ allowed: boolean; reason?: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { allowed: false, reason: "User not found" };
    }

    // Parse user preferences to get subscription plan
    let userPreferences: Partial<UserPreferences> = { 
      subscriptionPlan: "free", 
      interests: [], 
      theme: "light" 
    };
    
    if (user.preferences) {
      try {
        userPreferences = JSON.parse(user.preferences) as UserPreferences;
      } catch (e) {
        console.error("Error parsing user preferences:", e);
      }
    }

    // Premium users can add unlimited images
    if (userPreferences.subscriptionPlan === "monthly" || userPreferences.subscriptionPlan === "yearly") {
      return { allowed: true };
    }

    // Free users cannot upload images at all
    return { 
      allowed: false, 
      reason: "Image uploads are a premium feature. Upgrade to Premium to add images to your entries."
    };
  }

  async getEntryContentLimit(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) {
      return 0;
    }

    // Parse user preferences to get subscription plan
    let userPreferences: Partial<UserPreferences> = { 
      subscriptionPlan: "free", 
      interests: [], 
      theme: "light" 
    };
    
    if (user.preferences) {
      try {
        userPreferences = JSON.parse(user.preferences) as UserPreferences;
      } catch (e) {
        console.error("Error parsing user preferences:", e);
      }
    }

    // Premium users are limited to 1000 words
    if (userPreferences.subscriptionPlan === "monthly" || userPreferences.subscriptionPlan === "yearly") {
      return 1000;
    }

    // Free users are limited to 250 words
    return 250;
  }

  async getUserDailyEntryCount(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const entries = await this.getEntries(userId);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    }).length;
  }

  async getUserDailyImageCount(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const entries = await this.getEntries(userId);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime() && entry.imageUrl !== null;
    }).length;
  }

  // Saved Lessons Implementation
  async createSavedLesson(userId: number, insertSavedLesson: InsertSavedLesson): Promise<SavedLesson> {
    const id = this.currentSavedLessonId++;
    const now = new Date();
    
    const savedLesson: SavedLesson = {
      ...insertSavedLesson,
      id,
      userId,
      isPinnedToHome: false,
      completionTimestamp: now,
      createdAt: now
    };
    
    this.savedLessons.set(id, savedLesson);
    return savedLesson;
  }

  async getSavedLessons(userId: number): Promise<SavedLesson[]> {
    return Array.from(this.savedLessons.values())
      .filter(savedLesson => savedLesson.userId === userId)
      // Sort by completionTimestamp descending (newest first)
      .sort((a, b) => b.completionTimestamp.getTime() - a.completionTimestamp.getTime());
  }

  async getSavedLesson(id: number): Promise<SavedLesson | undefined> {
    return this.savedLessons.get(id);
  }

  async deleteSavedLesson(id: number): Promise<void> {
    this.savedLessons.delete(id);
  }
  
  // Streak methods implementation
  async getUserStreak(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;
    return user.currentStreak || 0;
  }
  
  async updateUserStreak(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActivity = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
    let streak = user.currentStreak || 0;
    
    if (!lastActivity) {
      // First activity ever - start streak at 1
      streak = 1;
    } else {
      const lastActivityDay = new Date(lastActivity);
      lastActivityDay.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const daysSinceLastActivity = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24));
      
      if (lastActivityDay.getTime() === today.getTime()) {
        // Already logged activity today, don't increment streak
        return streak;
      } else if (daysSinceLastActivity === 1 || lastActivityDay.getTime() === yesterday.getTime()) {
        // Activity was yesterday, increment streak
        streak += 1;
      } else if (daysSinceLastActivity > 1) {
        // Broke the streak, start over
        streak = 1;
      }
    }
    
    // Update user with new streak and activity timestamp
    await this.updateUser(userId, { 
      currentStreak: streak,
      lastActivityDate: today
    });
    
    return streak;
  }
}

export const storage = new MemStorage();
