import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

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

const tierColors = {
  bronze: {
    background: 'from-amber-800/30 to-amber-700/10',
    border: 'border-amber-700/30',
    text: 'text-amber-700',
    badge: 'border border-amber-800/50 bg-amber-800/20 text-amber-800/90',
    emoji: 'bg-amber-800/10'
  },
  silver: {
    background: 'from-slate-400/30 to-slate-300/10',
    border: 'border-slate-400/30',
    text: 'text-slate-500',
    badge: 'border border-slate-500/50 bg-slate-400/20 text-slate-500/90',
    emoji: 'bg-slate-400/10'
  },
  gold: {
    background: 'from-yellow-500/30 to-yellow-400/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-600',
    badge: 'border border-yellow-600/50 bg-yellow-500/20 text-yellow-600/90',
    emoji: 'bg-yellow-500/10'
  },
  platinum: {
    background: 'from-blue-400/30 to-sky-300/10',
    border: 'border-blue-400/30',
    text: 'text-blue-500',
    badge: 'border border-blue-500/50 bg-blue-400/20 text-blue-500/90',
    emoji: 'bg-blue-400/10'
  },
  diamond: {
    background: 'from-indigo-400/30 to-purple-300/10',
    border: 'border-indigo-400/30',
    text: 'text-indigo-500',
    badge: 'border border-indigo-500/50 bg-indigo-400/20 text-indigo-500/90',
    emoji: 'bg-indigo-400/10',
    shimmer: 'animate-shimmer bg-gradient-to-r from-transparent via-indigo-300/20 to-transparent'
  }
};

// Helper functions for tracking streaks and progress
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

// Main achievement list
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

interface BadgesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BadgesDialog({ open, onOpenChange }: BadgesDialogProps) {
  const isMobile = useIsMobile();
  const { data: entries = [] } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<AchievementTier | null>(null);

  // Get all categories from achievements
  const categories = Array.from(
    new Set(ACHIEVEMENTS.map((achievement) => achievement.category))
  );

  // Filter achievements by category and tier if selected
  const filteredAchievements = ACHIEVEMENTS.filter((achievement) => {
    const categoryMatch = !selectedCategory || achievement.category === selectedCategory;
    const tierMatch = !filterTier || achievement.tier === filterTier;
    return categoryMatch && tierMatch;
  });

  // Get all unlocked achievements
  const unlockedAchievements = ACHIEVEMENTS.filter((achievement) => 
    achievement.checkUnlocked(entries)
  );

  // Get progress on locked achievements (for next achievement suggestion)
  const nextAchievements = ACHIEVEMENTS
    .filter((achievement) => !achievement.checkUnlocked(entries))
    .map((achievement) => ({
      ...achievement,
      progress: achievement.getProgress(entries)
    }))
    .sort((a, b) => b.progress - a.progress);

  // Get counts by tier
  const tierCounts = {
    bronze: unlockedAchievements.filter(a => a.tier === 'bronze').length,
    silver: unlockedAchievements.filter(a => a.tier === 'silver').length,
    gold: unlockedAchievements.filter(a => a.tier === 'gold').length,
    platinum: unlockedAchievements.filter(a => a.tier === 'platinum').length,
    diamond: unlockedAchievements.filter(a => a.tier === 'diamond').length,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "sm:max-w-[725px] rounded-2xl bg-background border-none shadow-xl",
          "transition-all duration-300 ease-in-out",
          "max-h-[85vh] overflow-y-auto",
          isMobile ? 'w-[95%] p-4' : ''
        )}
      >
        <DialogHeader className="mb-4 sticky top-0 bg-background py-4 z-10">
          <DialogTitle className="text-2xl font-[Playfair Display] text-center">
            Achievements Collection
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Track your journaling milestones and earn badges
          </DialogDescription>
          
          {/* Achievement Summary */}
          <div className="flex justify-center gap-3 mt-4">
            <Badge 
              className={cn(
                tierColors.bronze.badge, 
                "cursor-pointer transition-all",
                filterTier === 'bronze' ? 'ring-2 ring-amber-500' : ''
              )} 
              onClick={() => setFilterTier(filterTier === 'bronze' ? null : 'bronze')}
            >
              Bronze: {tierCounts.bronze}
            </Badge>
            <Badge 
              className={cn(
                tierColors.silver.badge, 
                "cursor-pointer transition-all",
                filterTier === 'silver' ? 'ring-2 ring-slate-500' : ''
              )} 
              onClick={() => setFilterTier(filterTier === 'silver' ? null : 'silver')}
            >
              Silver: {tierCounts.silver}
            </Badge>
            <Badge 
              className={cn(
                tierColors.gold.badge, 
                "cursor-pointer transition-all",
                filterTier === 'gold' ? 'ring-2 ring-yellow-500' : ''
              )} 
              onClick={() => setFilterTier(filterTier === 'gold' ? null : 'gold')}
            >
              Gold: {tierCounts.gold}
            </Badge>
            <Badge 
              className={cn(
                tierColors.platinum.badge, 
                "cursor-pointer transition-all",
                filterTier === 'platinum' ? 'ring-2 ring-blue-500' : ''
              )} 
              onClick={() => setFilterTier(filterTier === 'platinum' ? null : 'platinum')}
            >
              Platinum: {tierCounts.platinum}
            </Badge>
            <Badge 
              className={cn(
                tierColors.diamond.badge, 
                "cursor-pointer transition-all relative overflow-hidden",
                filterTier === 'diamond' ? 'ring-2 ring-indigo-500' : ''
              )} 
              onClick={() => setFilterTier(filterTier === 'diamond' ? null : 'diamond')}
            >
              <span className={tierColors.diamond.shimmer + " absolute inset-0 w-[200%] animate-[shimmer_2s_infinite]"}></span>
              <span className="relative">Diamond: {tierCounts.diamond}</span>
            </Badge>
          </div>
          
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge 
              className={cn(
                "border border-primary/20 bg-primary/10 text-primary cursor-pointer",
                !selectedCategory ? 'ring-2 ring-primary' : ''
              )} 
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map(category => (
              <Badge 
                key={category}
                className={cn(
                  "border border-primary/20 bg-primary/10 text-primary cursor-pointer",
                  selectedCategory === category ? 'ring-2 ring-primary' : ''
                )} 
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pb-4">
          {filteredAchievements.map((achievement) => {
            const isUnlocked = achievement.checkUnlocked(entries);
            const progress = achievement.getProgress(entries);
            const tierStyle = tierColors[achievement.tier];
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                key={achievement.id}
                className={cn(
                  "p-6 rounded-2xl transition-all duration-300",
                  `bg-gradient-to-br ${tierStyle.background}`,
                  tierStyle.border,
                  "shadow-lg hover:shadow-xl",
                  "relative overflow-hidden",
                  !isUnlocked && "opacity-70 hover:opacity-90 grayscale-[30%]"
                )}
              >
                {achievement.tier === 'diamond' && isUnlocked && (
                  <div className={cn(
                    "absolute inset-0 w-[200%]", 
                    "animate-[shimmer_2s_infinite]",
                    "bg-gradient-to-r from-transparent via-indigo-300/20 to-transparent"
                  )}/>
                )}
                
                <div className="flex items-center gap-4 relative">
                  <div className={cn(
                    "text-3xl p-3 rounded-full flex items-center justify-center",
                    tierStyle.emoji,
                    isUnlocked && (
                      achievement.tier === 'diamond' 
                        ? "animate-pulse" 
                        : "animate-glow"
                    )
                  )}>
                    {achievement.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-[Playfair Display] text-lg font-semibold mb-1",
                        tierStyle.text
                      )}>
                        {achievement.name}
                      </h3>
                      <Badge className={tierStyle.badge}>
                        {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    {!isUnlocked && (
                      <div className="w-full bg-muted/20 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div 
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            achievement.tier === 'bronze' && "bg-amber-700",
                            achievement.tier === 'silver' && "bg-slate-400",
                            achievement.tier === 'gold' && "bg-yellow-500",
                            achievement.tier === 'platinum' && "bg-blue-400",
                            achievement.tier === 'diamond' && "bg-indigo-400"
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
        
        {filteredAchievements.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No achievements in this category yet.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}