import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Flame, PenSquare, Calendar, Star, Palette, Trophy } from 'lucide-react';

type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

type Achievement = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: string;
  tier: AchievementTier;
  category: 'streak' | 'word-count' | 'entry-frequency' | 'multimedia' | 'community' | 'general';
  checkUnlocked: (entries: Entry[]) => boolean;
  getProgress: (entries: Entry[]) => number;
};

const CategoryIcon = {
  'streak': Flame,
  'word-count': PenSquare,
  'entry-frequency': Calendar,
  'general': Star,
  'multimedia': Palette,
  'community': Trophy
};

const calculateStreak = (entries: Entry[], requiredDays: number) => {
  if (entries.length < requiredDays) return { achieved: false, progress: (entries.length / requiredDays) * 100 };

  const sortedDates = entries
    .map(e => new Date(e.createdAt).toISOString().split('T')[0])
    .sort()
    .reverse();

  let currentStreak = 1;
  let maxStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const curr = new Date(sortedDates[i]);
    const prev = new Date(sortedDates[i - 1]);
    const diffDays = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return { 
    achieved: maxStreak >= requiredDays, 
    progress: Math.min((maxStreak / requiredDays) * 100, 100) 
  };
};

const calculateWordCount = (entries: Entry[], targetCount: number) => {
  const totalWords = entries.reduce((sum, entry) => {
    return sum + (entry.content?.split(/\s+/).length || 0);
  }, 0);

  return {
    achieved: totalWords >= targetCount,
    progress: Math.min((totalWords / targetCount) * 100, 100)
  };
};

const calculateEntriesInTimeframe = (entries: Entry[], requiredEntries: number, timeframeFilter: (entry: Entry) => boolean) => {
  const filteredEntries = entries.filter(timeframeFilter);
  return {
    achieved: filteredEntries.length >= requiredEntries,
    progress: Math.min((filteredEntries.length / requiredEntries) * 100, 100),
    count: filteredEntries.length
  };
};

const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements (Bronze to Diamond)
  {
    id: "streak_3_days",
    name: "Consistent Writer",
    description: "Write entries 3 days in a row",
    emoji: "🔥",
    requirement: "3-day streak",
    tier: "bronze",
    category: "streak",
    checkUnlocked: (entries) => calculateStreak(entries, 3).achieved,
    getProgress: (entries) => calculateStreak(entries, 3).progress,
  },
  {
    id: "streak_7_days",
    name: "Weekly Warrior",
    description: "Maintain a 7-day journaling streak",
    emoji: "🔥",
    requirement: "7-day streak",
    tier: "bronze",
    category: "streak",
    checkUnlocked: (entries) => calculateStreak(entries, 7).achieved,
    getProgress: (entries) => calculateStreak(entries, 7).progress,
  },
  {
    id: "streak_14_days",
    name: "Fortnight Focus",
    description: "Maintain a 14-day journaling streak",
    emoji: "🔥",
    requirement: "14-day streak",
    tier: "silver",
    category: "streak",
    checkUnlocked: (entries) => calculateStreak(entries, 14).achieved,
    getProgress: (entries) => calculateStreak(entries, 14).progress,
  },
  {
    id: "streak_30_days",
    name: "Monthly Master",
    description: "Maintain a 30-day journaling streak",
    emoji: "🔥",
    requirement: "30-day streak",
    tier: "gold",
    category: "streak",
    checkUnlocked: (entries) => calculateStreak(entries, 30).achieved,
    getProgress: (entries) => calculateStreak(entries, 30).progress,
  },
  {
    id: "streak_90_days",
    name: "Quarterly Conqueror",
    description: "Maintain a 90-day journaling streak",
    emoji: "🔥",
    requirement: "90-day streak",
    tier: "platinum",
    category: "streak",
    checkUnlocked: (entries) => calculateStreak(entries, 90).achieved,
    getProgress: (entries) => calculateStreak(entries, 90).progress,
  },
  {
    id: "streak_365_days",
    name: "Year-Long Luminary",
    description: "Maintain a 365-day journaling streak",
    emoji: "🔥",
    requirement: "365-day streak",
    tier: "diamond",
    category: "streak",
    checkUnlocked: (entries) => calculateStreak(entries, 365).achieved,
    getProgress: (entries) => calculateStreak(entries, 365).progress,
  },

  // Word count achievements (Bronze to Diamond)
  {
    id: "wordcount_500",
    name: "Word Collector",
    description: "Write 500 words total across all entries",
    emoji: "✍️",
    requirement: "500+ words",
    tier: "bronze",
    category: "word-count",
    checkUnlocked: (entries) => calculateWordCount(entries, 500).achieved,
    getProgress: (entries) => calculateWordCount(entries, 500).progress,
  },
  {
    id: "wordcount_1000",
    name: "Wordsmith",
    description: "Write 1,000 words total across all entries",
    emoji: "✍️",
    requirement: "1,000+ words",
    tier: "bronze",
    category: "word-count",
    checkUnlocked: (entries) => calculateWordCount(entries, 1000).achieved,
    getProgress: (entries) => calculateWordCount(entries, 1000).progress,
  },
  {
    id: "wordcount_5000",
    name: "Storyteller",
    description: "Write 5,000 words total across all entries",
    emoji: "📚",
    requirement: "5,000+ words",
    tier: "silver",
    category: "word-count",
    checkUnlocked: (entries) => calculateWordCount(entries, 5000).achieved,
    getProgress: (entries) => calculateWordCount(entries, 5000).progress,
  },
  {
    id: "wordcount_10000",
    name: "Novelist",
    description: "Write 10,000 words total across all entries",
    emoji: "📚",
    requirement: "10,000+ words",
    tier: "gold",
    category: "word-count",
    checkUnlocked: (entries) => calculateWordCount(entries, 10000).achieved,
    getProgress: (entries) => calculateWordCount(entries, 10000).progress,
  },
  {
    id: "wordcount_50000",
    name: "Epic Chronicler",
    description: "Write 50,000 words total across all entries",
    emoji: "📚",
    requirement: "50,000+ words",
    tier: "platinum",
    category: "word-count",
    checkUnlocked: (entries) => calculateWordCount(entries, 50000).achieved,
    getProgress: (entries) => calculateWordCount(entries, 50000).progress,
  },
  {
    id: "wordcount_100000",
    name: "Literary Legend",
    description: "Write 100,000 words total across all entries",
    emoji: "📚",
    requirement: "100,000+ words",
    tier: "diamond",
    category: "word-count",
    checkUnlocked: (entries) => calculateWordCount(entries, 100000).achieved,
    getProgress: (entries) => calculateWordCount(entries, 100000).progress,
  },

  // Entry frequency achievements (Bronze to Diamond)
  {
    id: "frequency_5_entries",
    name: "Journal Enthusiast",
    description: "Create 5 entries total",
    emoji: "📝",
    requirement: "5 entries",
    tier: "bronze",
    category: "entry-frequency",
    checkUnlocked: (entries) => entries.length >= 5,
    getProgress: (entries) => Math.min((entries.length / 5) * 100, 100),
  },
  {
    id: "frequency_10_entries",
    name: "Journal Aficionado",
    description: "Create 10 entries total",
    emoji: "📝",
    requirement: "10 entries",
    tier: "bronze",
    category: "entry-frequency",
    checkUnlocked: (entries) => entries.length >= 10,
    getProgress: (entries) => Math.min((entries.length / 10) * 100, 100),
  },
  {
    id: "frequency_25_entries",
    name: "Dedicated Journalist",
    description: "Create 25 entries total",
    emoji: "📝",
    requirement: "25 entries",
    tier: "silver",
    category: "entry-frequency",
    checkUnlocked: (entries) => entries.length >= 25,
    getProgress: (entries) => Math.min((entries.length / 25) * 100, 100),
  },
  {
    id: "frequency_50_entries",
    name: "Journaling Master",
    description: "Create 50 entries total",
    emoji: "📝",
    requirement: "50 entries",
    tier: "gold",
    category: "entry-frequency",
    checkUnlocked: (entries) => entries.length >= 50,
    getProgress: (entries) => Math.min((entries.length / 50) * 100, 100),
  },
  {
    id: "frequency_100_entries",
    name: "Journaling Expert",
    description: "Create 100 entries total",
    emoji: "📝",
    requirement: "100 entries",
    tier: "platinum",
    category: "entry-frequency",
    checkUnlocked: (entries) => entries.length >= 100,
    getProgress: (entries) => Math.min((entries.length / 100) * 100, 100),
  },
  {
    id: "frequency_365_entries",
    name: "Journal Oracle",
    description: "Create 365 entries total",
    emoji: "📝",
    requirement: "365 entries",
    tier: "diamond",
    category: "entry-frequency",
    checkUnlocked: (entries) => entries.length >= 365,
    getProgress: (entries) => Math.min((entries.length / 365) * 100, 100),
  },

  // Time-specific achievements
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Write 5 entries between 10 PM and 4 AM",
    emoji: "🌙",
    requirement: "5 late-night entries",
    tier: "silver",
    category: "general",
    checkUnlocked: (entries) => {
      const nightEntries = entries.filter(entry => {
        const hour = new Date(entry.createdAt).getHours();
        return hour >= 22 || hour <= 4;
      });
      return nightEntries.length >= 5;
    },
    getProgress: (entries) => {
      const nightEntries = entries.filter(entry => {
        const hour = new Date(entry.createdAt).getHours();
        return hour >= 22 || hour <= 4;
      });
      return Math.min((nightEntries.length / 5) * 100, 100);
    },
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Write 5 entries between 5 AM and 9 AM",
    emoji: "🌅",
    requirement: "5 early-morning entries",
    tier: "silver",
    category: "general",
    checkUnlocked: (entries) => {
      const morningEntries = entries.filter(entry => {
        const hour = new Date(entry.createdAt).getHours();
        return hour >= 5 && hour <= 9;
      });
      return morningEntries.length >= 5;
    },
    getProgress: (entries) => {
      const morningEntries = entries.filter(entry => {
        const hour = new Date(entry.createdAt).getHours();
        return hour >= 5 && hour <= 9;
      });
      return Math.min((morningEntries.length / 5) * 100, 100);
    },
  },
  {
    id: "first_entry",
    name: "First Steps",
    description: "Write your first journal entry",
    emoji: "🚀",
    requirement: "Write 1 entry",
    tier: "bronze",
    category: "general",
    checkUnlocked: (entries) => entries.length > 0,
    getProgress: (entries) => Math.min(entries.length * 100, 100),
  },

  // Add multimedia achievements and community achievements (placeholders - would require backend implementation)
  {
    id: "multimedia_10_images",
    name: "Visual Chronicler",
    description: "Add 10 images to your entries",
    emoji: "📷",
    requirement: "10 images added",
    tier: "silver",
    category: "multimedia",
    // These would require actual image attachment tracking in the backend
    checkUnlocked: (_entries) => false, // Placeholder
    getProgress: (_entries) => 0, // Placeholder
  },
  {
    id: "community_5_shares",
    name: "Community Contributor",
    description: "Share 5 of your reflections",
    emoji: "👥",
    requirement: "5 entries shared",
    tier: "silver",
    category: "community",
    // These would require sharing functionality in the backend
    checkUnlocked: (_entries) => false, // Placeholder
    getProgress: (_entries) => 0, // Placeholder
  },
];

export function BadgesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all');
  const { data: entries = [] } = useQuery({ 
    queryKey: ['entries'],
    staleTime: 0,
    cacheTime: 0
  });

  const filteredAchievements = ACHIEVEMENTS.filter(
    achievement => selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const achievementStats = useMemo(() => {
    const unlocked = ACHIEVEMENTS.filter(a => a.checkUnlocked(entries));
    const tierCounts = unlocked.reduce((acc, achievement) => {
      acc[achievement.tier] = (acc[achievement.tier] || 0) + 1;
      return acc;
    }, {} as Record<AchievementTier, number>);

    const progressMap = ACHIEVEMENTS.reduce((acc, achievement) => {
      acc[achievement.id] = achievement.getProgress(entries);
      return acc;
    }, {} as Record<string, number>);

    return {
      unlockedCount: unlocked.length,
      tierCounts,
      progressMap
    };
  }, [entries]);

  const categories = [
    { id: 'all', label: 'All Achievements' },
    { id: 'streak', label: 'Streaks' },
    { id: 'word-count', label: 'Word Count' },
    { id: 'entry-frequency', label: 'Entry Frequency' },
    { id: 'general', label: 'General' },
    { id: 'multimedia', label: 'Multimedia' },
    { id: 'community', label: 'Community' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-[Playfair Display] text-center mb-2">
            Achievements Gallery
          </DialogTitle>
          <div className="flex justify-center gap-4 flex-wrap mb-4">
            <div className="achievement-total-badge relative px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20">
              <span className="font-semibold text-foreground/90">
                {achievementStats.unlockedCount} / {ACHIEVEMENTS.length} Achieved
              </span>
            </div>
            {(['diamond', 'platinum', 'gold', 'silver', 'bronze'] as const).map(tier => (
                <motion.div
                  key={tier}
                  className={cn(
                    "achievement-tier-badge px-4 py-1.5 rounded-full font-medium",
                    "shadow-lg backdrop-blur-sm transition-all duration-300",
                    tier === 'diamond' && "bg-gradient-to-r from-blue-400/30 to-purple-400/30 border border-blue-300/30",
                    tier === 'platinum' && "bg-gradient-to-r from-slate-400/30 to-blue-300/30 border border-slate-300/30",
                    tier === 'gold' && "bg-gradient-to-r from-yellow-400/30 to-amber-300/30 border border-yellow-300/30",
                    tier === 'silver' && "bg-gradient-to-r from-slate-300/30 to-slate-200/30 border border-slate-200/30",
                    tier === 'bronze' && "bg-gradient-to-r from-orange-400/30 to-amber-500/30 border border-orange-300/30"
                  )}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {achievementStats.tierCounts[tier] || 0} {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </motion.div>
              ))}
          </div>

          <div className="flex gap-4 p-4 border-t border-b overflow-x-auto">
            {categories.map(category => {
              const Icon = CategoryIcon[category.id as keyof typeof CategoryIcon] || Star;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as Achievement['category'] | 'all')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map(achievement => {
                const isUnlocked = achievement.checkUnlocked(entries);
                const progress = achievementStats.progressMap[achievement.id];

                const tierStyle = {
                  'bronze': {
                    background: "from-orange-500/10 to-orange-600/10",
                    border: "border border-orange-500/20"
                  },
                  'silver': {
                    background: "from-slate-300/10 to-slate-400/10",
                    border: "border border-slate-400/20"
                  },
                  'gold': {
                    background: "from-yellow-400/10 to-yellow-500/10",
                    border: "border border-yellow-500/20"
                  },
                  'platinum': {
                    background: "from-emerald-400/10 to-emerald-500/10",
                    border: "border border-emerald-500/20"
                  },
                  'diamond': {
                    background: "from-blue-400/10 to-purple-500/10",
                    border: "border border-blue-500/20"
                  }
                }[achievement.tier];

                return (
                  <div
                    key={achievement.id}
                    className={cn(
                      "achievement-card p-6 rounded-2xl transition-all duration-500",
                      `bg-gradient-to-br ${tierStyle.background}`,
                      tierStyle.border,
                      "relative overflow-hidden backdrop-blur-sm",
                      isUnlocked && "animate-card-unlock"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-2xl">{achievement.emoji}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(progress)}%
                      </div>
                    </div>
                    <h3 className="font-semibold mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {achievement.description}
                    </p>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {achievement.requirement}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }