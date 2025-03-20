import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

type Achievement = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: string;
  tier: AchievementTier;
  category: 'streak' | 'word-count' | 'entry-frequency' | 'multimedia' | 'community' | 'general';
  checkUnlocked: (entries: any[]) => boolean;
  getProgress: (entries: any[]) => number;
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

const calculateStreak = (entries: any[], requiredDays: number) => {
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

const calculateWordCount = (entries: any[], targetCount: number) => {
  const totalWords = entries.reduce((sum, entry) => {
    return sum + (entry.content?.split(/\s+/).length || 0);
  }, 0);

  return {
    achieved: totalWords >= targetCount,
    progress: Math.min((totalWords / targetCount) * 100, 100)
  };
};


const calculateEntriesInTimeframe = (entries: any[], requiredEntries: number, timeframeFilter: (entry: any) => boolean) => {
  const filteredEntries = entries.filter(timeframeFilter);
  return {
    achieved: filteredEntries.length >= requiredEntries,
    progress: Math.min((filteredEntries.length / requiredEntries) * 100, 100),
    count: filteredEntries.length
  };
};

const tierColors = {
  diamond: {
    bg: "bg-gradient-to-r from-blue-400/30 to-purple-400/30",
    border: "border-blue-300/30",
    completed: "from-blue-400 to-purple-400 shadow-blue-500/50",
  },
  platinum: {
    bg: "bg-gradient-to-r from-slate-400/30 to-blue-300/30",
    border: "border-slate-300/30",
    completed: "from-slate-400 to-blue-300 shadow-slate-500/50",
  },
  gold: {
    bg: "bg-gradient-to-r from-amber-400/30 to-yellow-300/30",
    border: "border-amber-300/30",
    completed: "from-amber-400 to-yellow-300 shadow-amber-500/50",
  },
  silver: {
    bg: "bg-gradient-to-r from-slate-400/30 to-slate-300/30",
    border: "border-slate-300/30",
    completed: "from-slate-400 to-slate-300 shadow-slate-500/50",
  },
  bronze: {
    bg: "bg-gradient-to-r from-orange-400/30 to-orange-300/30",
    border: "border-orange-300/30",
    completed: "from-orange-400 to-orange-300 shadow-orange-500/50",
  },
};

export function BadgesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all');
  const { data: entries = [] } = useQuery({
    queryKey: ['entries'],
    staleTime: 0,
    cacheTime: 0
  });

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

  const filteredAchievements = ACHIEVEMENTS.filter(
    achievement => selectedCategory === 'all' || achievement.category === selectedCategory
  );

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
          <DialogTitle className="text-2xl font-[Playfair Display] text-center mb-4">
            Achievements Gallery
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <div className="achievement-total-badge px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20">
            <span className="font-semibold">
              {achievementStats.unlockedCount} / {ACHIEVEMENTS.length} Achieved
            </span>
          </div>
          {(['diamond', 'platinum', 'gold', 'silver', 'bronze'] as const).map(tier => (
            achievementStats.tierCounts[tier] ? (
              <motion.div
                key={tier}
                className={cn(
                  "px-4 py-1.5 rounded-full font-medium shadow-lg backdrop-blur-sm",
                  "border",
                  tierColors[tier].bg,
                  tierColors[tier].border
                )}
              >
                <span>{tier.charAt(0).toUpperCase() + tier.slice(1)}: {achievementStats.tierCounts[tier]}</span>
              </motion.div>
            ) : null
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map(category => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => setSelectedCategory(category.id as any)}
            >
              {category.label}
            </Badge>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map(achievement => {
              const isCompleted = achievement.checkUnlocked(entries);
              const progress = achievementStats.progressMap[achievement.id];

              return (
                <motion.div
                  key={achievement.id}
                  className={cn(
                    "relative p-4 rounded-xl border",
                    "transition-all duration-300",
                    isCompleted ? cn(
                      "bg-gradient-to-r shadow-lg",
                      tierColors[achievement.tier].completed
                    ) : cn(
                      tierColors[achievement.tier].bg,
                      tierColors[achievement.tier].border
                    )
                  )}
                >
                  {isCompleted && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{achievement.emoji}</span>
                    <h3 className="font-semibold">{achievement.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                  <div className="mt-auto">
                    <div className="text-sm font-medium mb-1">{Math.round(progress)}% Complete</div>
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground/90 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}