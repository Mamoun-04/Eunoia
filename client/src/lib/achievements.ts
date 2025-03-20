
import { Entry } from "@shared/schema";

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: string;
  tier: AchievementTier;
  category: string;
  checkUnlocked: (entries: Entry[]) => boolean;
  getProgress: (entries: Entry[]) => number;
}

export const achievements: Achievement[] = [
  {
    id: "wordsmith",
    name: "Wordsmith",
    description: "Write over 1000 words total",
    emoji: "✍️",
    requirement: "1000+ words",
    tier: "bronze",
    category: "writing",
    checkUnlocked: (entries) => {
      const totalWords = entries.reduce((sum, entry) => 
        sum + entry.content.split(/\s+/).length, 0);
      return totalWords >= 1000;
    },
    getProgress: (entries) => {
      const totalWords = entries.reduce((sum, entry) => 
        sum + entry.content.split(/\s+/).length, 0);
      return Math.min((totalWords / 1000) * 100, 100);
    }
  }
];
