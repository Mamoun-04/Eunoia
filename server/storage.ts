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
    const user: User = {
      ...insertUser,
      id,
      subscriptionStatus: "free",
      subscriptionEndDate: null
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
      imageUrl: null,
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
}

export const storage = new MemStorage();
