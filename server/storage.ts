import { User, InsertUser, Entry, InsertEntry } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  createEntry(userId: number, entry: InsertEntry): Promise<Entry>;
  getEntries(userId: number): Promise<Entry[]>;
  getEntry(id: number): Promise<Entry | undefined>;
  updateEntry(id: number, data: Partial<Entry>): Promise<Entry>;
  deleteEntry(id: number): Promise<void>;
  
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
  private currentUserId: number;
  private currentEntryId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.entries = new Map();
    this.currentUserId = 1;
    this.currentEntryId = 1;
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
      preferences: preferencesString
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

  // Free user limit implementation methods
  async canCreateEntry(userId: number): Promise<{ allowed: boolean; reason?: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { allowed: false, reason: "User not found" };
    }

    // Premium users can create unlimited entries
    if (user.subscriptionStatus === "active") {
      return { allowed: true };
    }

    // Free users are limited to 2 entries per day
    const dailyEntryCount = await this.getUserDailyEntryCount(userId);
    if (dailyEntryCount >= 2) {
      return { 
        allowed: false, 
        reason: "Free users can only create 2 entries per day. Upgrade to Premium for unlimited entries."
      };
    }

    return { allowed: true };
  }

  async canAddImage(userId: number): Promise<{ allowed: boolean; reason?: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { allowed: false, reason: "User not found" };
    }

    // Premium users can add unlimited images
    if (user.subscriptionStatus === "active") {
      return { allowed: true };
    }

    // Free users are limited to 1 image per day
    const dailyImageCount = await this.getUserDailyImageCount(userId);
    if (dailyImageCount >= 1) {
      return { 
        allowed: false, 
        reason: "Free users can only upload 1 image per day. Upgrade to Premium for unlimited images."
      };
    }

    return { allowed: true };
  }

  async getEntryContentLimit(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) {
      return 0;
    }

    // Premium users have no content limit
    if (user.subscriptionStatus === "active") {
      return Infinity;
    }

    // Free users are limited to 300 words
    return 300;
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
}

export const storage = new MemStorage();
