
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
  },
  {
    id: "consistent_writer",
    name: "Consistent Writer",
    description: "Write entries for 7 consecutive days",
    emoji: "📅",
    requirement: "7 day streak",
    tier: "silver",
    category: "consistency",
    checkUnlocked: (entries) => {
      if (entries.length < 7) return false;
      const dates = entries.map(e => new Date(e.createdAt).toISOString().split('T')[0]).sort();
      let streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const curr = new Date(dates[i]);
        const prev = new Date(dates[i - 1]);
        const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) streak++;
        else streak = 1;
        if (streak >= 7) return true;
      }
      return false;
    },
    getProgress: (entries) => {
      if (entries.length < 1) return 0;
      const dates = entries.map(e => new Date(e.createdAt).toISOString().split('T')[0]).sort();
      let streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const curr = new Date(dates[i]);
        const prev = new Date(dates[i - 1]);
        const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) streak++;
        else streak = 1;
      }
      return Math.min((streak / 7) * 100, 100);
    }
  },
  {
    id: "prolific_author",
    name: "Prolific Author",
    description: "Write 10 journal entries",
    emoji: "📚",
    requirement: "10 entries",
    tier: "bronze",
    category: "writing",
    checkUnlocked: (entries) => entries.length >= 10,
    getProgress: (entries) => Math.min((entries.length / 10) * 100, 100)
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Write an entry between midnight and 5 AM",
    emoji: "🦉",
    requirement: "Late night entry",
    tier: "silver",
    category: "timing",
    checkUnlocked: (entries) => {
      return entries.some(entry => {
        const hour = new Date(entry.createdAt).getHours();
        return hour >= 0 && hour < 5;
      });
    },
    getProgress: (entries) => {
      return entries.some(entry => {
        const hour = new Date(entry.createdAt).getHours();
        return hour >= 0 && hour < 5;
      }) ? 100 : 0;
    }
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Write an entry between 5 AM and 8 AM",
    emoji: "🌅",
    requirement: "Early morning entry",
    tier: "silver",
    category: "timing",
    checkUnlocked: (entries) => {
      return entries.some(entry => {
        const hour = new Date(entry.createdAt).getHours();
        return hour >= 5 && hour < 8;
      });
    },
    getProgress: (entries) => {
      return entries.some(entry => {
        const hour = new Date(entry.createdAt).getHours();
        return hour >= 5 && hour < 8;
      }) ? 100 : 0;
    }
  }
];
