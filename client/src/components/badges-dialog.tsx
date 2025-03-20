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
  const { data: entries = [] as Entry[] } = useQuery({ 
    queryKey: ['/api/entries'],
    staleTime: 0,
    gcTime: 0 // gcTime is the replacement for cacheTime in React Query v5
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
        </DialogHeader>
        
        {/* Top section - Achievement Stats */}
        <div className="flex justify-center gap-4 flex-wrap mb-6">
          <div className="achievement-total-badge relative px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 shadow-md">
            <span className="font-semibold text-foreground/90">
              {achievementStats.unlockedCount} / {ACHIEVEMENTS.length} Achieved
            </span>
          </div>
          
          {/* Tier badges with consistent colors */}
          {(['diamond', 'platinum', 'gold', 'silver', 'bronze'] as const).map(tier => {
            // Define consistent tier styling
            const tierColor = {
              'diamond': "from-blue-400/30 to-purple-500/30 border-blue-400/40",
              'platinum': "from-emerald-400/30 to-emerald-500/30 border-emerald-400/40",
              'gold': "from-yellow-400/30 to-yellow-500/30 border-yellow-400/40",
              'silver': "from-slate-300/30 to-slate-400/30 border-slate-300/40",
              'bronze': "from-orange-400/30 to-orange-600/30 border-orange-400/40"
            }[tier];
            
            return (
              <motion.div
                key={tier}
                className={cn(
                  "achievement-tier-badge px-4 py-2 rounded-full font-medium",
                  "shadow-lg backdrop-blur-sm transition-all duration-300",
                  `bg-gradient-to-r ${tierColor} border`
                )}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                {achievementStats.tierCounts[tier] || 0} {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </motion.div>
            );
          })}
        </div>

        {/* Category filters - improved alignment */}
        <div className="flex gap-3 px-4 py-3 mb-2 border-t border-b overflow-x-auto sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          {categories.map(category => {
            const Icon = CategoryIcon[category.id as keyof typeof CategoryIcon] || Star;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as Achievement['category'] | 'all')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  "text-sm font-medium",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted/80"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main achievements grid */}
        <div className="flex-1 overflow-y-auto py-4 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAchievements.map(achievement => {
                const isUnlocked = achievement.checkUnlocked(entries);
                const progress = achievementStats.progressMap[achievement.id];

                // Define more consistent and vibrant tier styles that match the tier badges
                const tierStyle = {
                  'bronze': {
                    background: "from-orange-500/10 to-orange-600/10",
                    border: "border border-orange-500/20",
                    glow: "shadow-[0_0_10px_rgba(234,88,12,0.2)]",
                    progressBar: "bg-gradient-to-r from-orange-400 to-orange-600"
                  },
                  'silver': {
                    background: "from-slate-300/10 to-slate-400/10",
                    border: "border border-slate-400/20",
                    glow: "shadow-[0_0_10px_rgba(148,163,184,0.2)]",
                    progressBar: "bg-gradient-to-r from-slate-300 to-slate-400"
                  },
                  'gold': {
                    background: "from-yellow-400/10 to-yellow-500/10",
                    border: "border border-yellow-500/20",
                    glow: "shadow-[0_0_10px_rgba(234,179,8,0.2)]",
                    progressBar: "bg-gradient-to-r from-yellow-400 to-yellow-500"
                  },
                  'platinum': {
                    background: "from-emerald-400/10 to-emerald-500/10",
                    border: "border border-emerald-500/20",
                    glow: "shadow-[0_0_10px_rgba(16,185,129,0.2)]",
                    progressBar: "bg-gradient-to-r from-emerald-400 to-emerald-500"
                  },
                  'diamond': {
                    background: "from-blue-400/10 to-purple-500/10",
                    border: "border border-blue-500/20",
                    glow: "shadow-[0_0_15px_rgba(96,165,250,0.3)]",
                    progressBar: "bg-gradient-to-r from-blue-400 to-purple-500"
                  }
                }[achievement.tier];

                return (
                  <motion.div
                    key={achievement.id}
                    className={cn(
                      "achievement-card p-6 rounded-2xl transition-all duration-500",
                      `bg-gradient-to-br ${tierStyle.background}`,
                      tierStyle.border,
                      "relative overflow-hidden backdrop-blur-sm",
                      isUnlocked 
                        ? cn("ring-1 ring-opacity-40", tierStyle.glow, {
                            'ring-orange-400': achievement.tier === 'bronze',
                            'ring-slate-300': achievement.tier === 'silver',
                            'ring-yellow-400': achievement.tier === 'gold',
                            'ring-emerald-400': achievement.tier === 'platinum',
                            'ring-blue-400': achievement.tier === 'diamond',
                          })
                        : "opacity-75"
                    )}
                    animate={isUnlocked ? { scale: 1 } : { scale: 0.98 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    {/* Add a completion checkmark for unlocked achievements */}
                    {isUnlocked && (
                      <div className="absolute top-4 right-4 bg-green-500/20 p-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-2xl">{achievement.emoji}</div>
                      <div className={cn(
                        "text-sm font-medium px-2 py-0.5 rounded-full",
                        isUnlocked ? "bg-green-500/20 text-green-500" : "text-muted-foreground"
                      )}>
                        {Math.round(progress)}%
                      </div>
                    </div>
                    
                    <h3 className={cn(
                      "font-semibold mb-1 text-lg",
                      isUnlocked && "text-foreground"
                    )}>
                      {achievement.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {achievement.description}
                    </p>
                    
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500",
                          progress === 100 ? tierStyle.progressBar : "bg-primary"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground flex justify-between items-center">
                      <span>{achievement.requirement}</span>
                      {isUnlocked && (
                        <span className="text-xs text-green-500 font-medium">Completed!</span>
                      )}
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