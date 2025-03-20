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
    .reverse()
    .slice(0, requiredDays);

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const curr = new Date(sortedDates[i]);
    const prev = new Date(sortedDates[i - 1]);
    const diffDays = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak++;
  }

  return { 
    achieved: streak >= requiredDays, 
    progress: Math.min((streak / requiredDays) * 100, 100) 
  };
};

const calculateWordCount = (entries: Entry[], requiredWords: number) => {
  const totalWords = entries.reduce((sum, entry) => 
    sum + entry.content.split(/\s+/).filter(word => word.length > 0).length, 0);

  return {
    achieved: totalWords >= requiredWords,
    progress: Math.min((totalWords / requiredWords) * 100, 100),
    count: totalWords
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
  // Streak-based achievements (Bronze to Diamond)
  {
    id: "streak_3_days",
    name: "Getting Started",
    description: "Maintain a 3-day journaling streak",
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
    queryFn: () => [] as Entry[]
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
    
    return {
      unlockedCount: unlocked.length,
      tierCounts,
      progressMap: ACHIEVEMENTS.reduce((acc, achievement) => {
        acc[achievement.id] = achievement.getProgress(entries);
        return acc;
      }, {} as Record<string, number>)
    };
  }, [entries]);

  const { unlockedCount, tierCounts, progressMap } = achievementStats;

  const categories: { id: Achievement['category'] | 'all'; label: string }[] = [
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
        <DialogHeader className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-muted to-background opacity-50" />
          <div className="relative">
            <DialogTitle className="text-2xl font-[Playfair Display] text-center mb-2">
              Achievements Gallery
            </DialogTitle>
            <div className="flex justify-center gap-4 flex-wrap mb-4">
              {/* Total Achievement Counter */}
              <motion.div
                className="achievement-total-badge relative px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-semibold text-foreground/90">
                  {unlockedCount} / {ACHIEVEMENTS.length} Achieved
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </motion.div>

              {/* Tier Counters */}
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
                  {tierCounts[tier] || 0} {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </motion.div>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex justify-center gap-2 flex-wrap">
              {categories.map(({ id, label }) => {
                const Icon = id !== 'all' ? CategoryIcon[id] : Star;
                return (
                  <Button
                    key={id}
                    variant={selectedCategory === id ? "default" : "outline"}
                    className={cn(
                      "transition-all duration-300",
                      selectedCategory === id && "bg-primary text-primary-foreground shadow-lg",
                      "hover:scale-105"
                    )}
                    onClick={() => setSelectedCategory(id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map(achievement => {
              const isUnlocked = achievement.checkUnlocked(entries);
              const progress = progressMap[achievement.id];

              const tierStyle = {
                diamond: {
                  background: "from-blue-500/5 to-purple-500/5",
                  border: "border-blue-300/20",
                  badge: "bg-blue-400/20 text-blue-200",
                  text: "text-blue-200",
                  emoji: "bg-blue-400/10"
                },
                platinum: {
                  background: "from-slate-400/5 to-blue-300/5",
                  border: "border-slate-300/20",
                  badge: "bg-slate-400/20 text-slate-200",
                  text: "text-slate-200",
                  emoji: "bg-slate-400/10"
                },
                gold: {
                  background: "from-yellow-500/5 to-amber-500/5",
                  border: "border-yellow-300/20",
                  badge: "bg-yellow-400/20 text-yellow-200",
                  text: "text-yellow-200",
                  emoji: "bg-yellow-400/10"
                },
                silver: {
                  background: "from-slate-300/5 to-slate-200/5",
                  border: "border-slate-200/20",
                  badge: "bg-slate-300/20 text-slate-300",
                  text: "text-slate-300",
                  emoji: "bg-slate-300/10"
                },
                bronze: {
                  background: "from-orange-500/5 to-amber-600/5",
                  border: "border-orange-300/20",
                  badge: "bg-orange-400/20 text-orange-200",
                  text: "text-orange-200",
                  emoji: "bg-orange-400/10"
                }
              }[achievement.tier];

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  key={achievement.id}
                  className={cn(
                    "achievement-card p-6 rounded-2xl transition-all duration-500",
                    `bg-gradient-to-br ${tierStyle.background}`,
                    tierStyle.border,
                    "shadow-lg hover:shadow-xl",
                    "relative overflow-hidden backdrop-blur-sm",
                    "hover:scale-[1.02] transition-transform",
                    isUnlocked && "animate-card-unlock"
                  )}
                >
                  {isUnlocked && achievement.tier === 'diamond' && (
                    <div className="absolute inset-0 achievement-sparkle-container">
                      <div className="achievement-sparkle" style={{animationDelay: '0.2s'}}/>
                      <div className="achievement-sparkle" style={{animationDelay: '0.5s'}}/>
                      <div className="achievement-sparkle" style={{animationDelay: '0.8s'}}/>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "text-3xl p-3 rounded-xl flex items-center justify-center",
                      tierStyle.emoji,
                      isUnlocked && "animate-glow"
                    )}>
                      {achievement.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          "font-[Playfair Display] text-lg font-semibold",
                          tierStyle.text
                        )}>
                          {achievement.name}
                        </h3>
                        <Badge className={tierStyle.badge}>
                          {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      {!isUnlocked && (
                        <div className="w-full bg-muted/20 rounded-full h-1.5 mt-2">
                          <div 
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-500",
                              `bg-gradient-to-r ${tierStyle.background}`
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={cn(
                    "mt-2 text-xs pl-16",
                    !isUnlocked ? "text-muted-foreground" : tierStyle.text
                  )}>
                    {!isUnlocked
                      ? `Progress: ${Math.round(progress)}% complete`
                      : `Achieved! (${achievement.requirement})`}
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