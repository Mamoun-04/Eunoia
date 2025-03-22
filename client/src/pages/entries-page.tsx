import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { useState } from "react";
import { BadgesDialog } from "@/components/badges-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LogOut,
  Settings,
  CalendarDays,
  PenSquare,
  BookOpen,
  Trophy,
  TrendingUp,
  BarChart,
  Target
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MetricCard } from "@/components/metrics-card";
import { Award as AwardIcon, Book as BookIcon, Clock as ClockIcon, PenSquare as PenSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Helper function to calculate streaks
const calculateStreak = (entries: Entry[]) => {
  if (entries.length === 0) return 0;
  
  const sortedDates = entries
    .map(e => new Date(e.createdAt).toISOString().split('T')[0])
    .sort()
    .reverse();
    
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const curr = new Date(sortedDates[i]);
    const prev = new Date(sortedDates[i - 1]);
    const diffDays = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak++;
    else break;
  }
  
  return streak;
};

// Define the tier types for achievements
type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// Color definitions for achievement tiers
const tierColors = {
  bronze: {
    background: 'from-[#8B4513]/80 via-[#CD7F32]/60 to-[#B8860B]/40 hover:from-[#CD7F32]/90 hover:to-[#B8860B]/50',
    border: 'border-[#CD7F32]/40 shadow-lg shadow-[#8B4513]/20',
    text: 'text-[#FFD700]',
    badge: 'border border-[#CD7F32]/50 bg-gradient-to-r from-[#8B4513]/30 to-[#CD7F32]/30 text-[#FFD700]',
    emoji: 'bg-gradient-to-r from-[#8B4513]/20 to-[#CD7F32]/20 animate-pulse-slow',
    barColor: 'bg-gradient-to-r from-[#8B4513] to-[#CD7F32]'
  },
  silver: {
    background: 'from-slate-400/40 to-slate-300/20 hover:from-slate-300/50 hover:to-slate-200/30',
    border: 'border-slate-400/40 backdrop-blur',
    text: 'text-slate-400',
    badge: 'border border-slate-400/50 bg-slate-400/30 text-slate-300',
    emoji: 'bg-slate-400/20 animate-pulse-slow',
    barColor: 'bg-slate-400'
  },
  gold: {
    background: 'from-yellow-500/40 to-amber-400/20 hover:from-yellow-400/50 hover:to-amber-300/30',
    border: 'border-yellow-500/40',
    text: 'text-yellow-500',
    badge: 'border border-yellow-500/50 bg-yellow-500/30 text-yellow-400',
    emoji: 'bg-yellow-500/20 animate-pulse-slow',
    barColor: 'bg-yellow-500'
  },
  platinum: {
    background: 'from-blue-400/40 via-sky-300/30 to-blue-200/20 hover:from-blue-300/50 hover:to-sky-200/30',
    border: 'border-blue-400/40 shadow-lg',
    text: 'text-blue-400',
    badge: 'border border-blue-400/50 bg-blue-400/30 text-blue-300',
    emoji: 'bg-blue-400/20 animate-pulse-slow',
    barColor: 'bg-blue-400'
  },
  diamond: {
    background: 'from-indigo-400/40 via-purple-300/30 to-indigo-200/20 hover:from-indigo-300/50 hover:to-purple-200/30',
    border: 'border-indigo-400/40 shadow-xl',
    text: 'text-indigo-400',
    badge: 'border border-indigo-400/50 bg-indigo-400/30 text-indigo-300',
    emoji: 'bg-indigo-400/20 animate-pulse-slow',
    shimmer: 'animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent',
    barColor: 'bg-indigo-400'
  }
};

// Define the interface for achievements
interface Achievement {
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

export default function EntriesPage() {
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const { logoutMutation } = useAuth();
  const [location] = useLocation();
  const [showBadges, setShowBadges] = useState(false);

  const { data: entries = [], isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const navigation = [
    { name: "Today", href: "/", icon: CalendarDays },
    { name: "Entries", href: "/entries", icon: PenSquare },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Calculate stats
  const currentMonth = format(new Date(), 'MMMM yyyy');
  const entriesThisMonth = entries.filter(entry =>
    format(new Date(entry.createdAt), 'MMMM yyyy') === currentMonth
  ).length;

  // Calculate word count
  const totalWords = entries.reduce((acc, entry) => {
    return acc + entry.content.split(/\s+/).filter(word => word.length > 0).length;
  }, 0);
  
  // Calculate current streak
  const currentStreak = calculateStreak(entries);
  
  // Get next milestone for streaks
  const streakMilestones = [3, 7, 14, 30, 90, 365];
  const nextStreakMilestone = streakMilestones.find(m => m > currentStreak) || currentStreak;


  return (
    <div className="flex min-h-screen bg-background pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-64 p-4 border-r">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold px-4">Eunoia</h1>
          <p className="text-sm text-muted-foreground px-4">Your Insights</p>
        </div>

        <nav className="flex flex-col gap-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : ""
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          className="mt-auto w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Today</h1>
            <p className="text-lg text-muted-foreground">
              {format(new Date(), 'MMMM d')}
            </p>
          </div>

          <div className="mb-8 space-y-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-[Playfair Display] font-bold">Insights</h2>
            </div>

            {/* Top Section - Metrics Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#111111] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4 text-muted-foreground">
                  <PenSquareIcon className="h-6 w-6" />
                  <span className="font-medium text-lg">Total Entries</span>
                </div>
                <div className="text-4xl font-bold text-primary tracking-tight">{entries.length}</div>
              </div>

              <div className="bg-white dark:bg-[#111111] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4 text-muted-foreground">
                  <BookIcon className="h-6 w-6" />
                  <span className="font-medium text-base">Total Words</span>
                </div>
                <div className="text-4xl font-bold text-primary tracking-tight">{entries.reduce((acc, entry) => acc + entry.content.split(/\s+/).length, 0)}</div>
              </div>

              <div className="bg-white dark:bg-[#111111] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4 text-muted-foreground">
                  <ClockIcon className="h-6 w-6" />
                  <span className="font-medium text-base">Time Journaling</span>
                </div>
                <div className="text-4xl font-bold text-primary tracking-tight">0<span className="text-xl ml-2 text-muted-foreground">min</span></div>
              </div>

              <div className="bg-white dark:bg-[#111111] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:translate-y-[-2px]">
                <div className="flex items-center gap-3 mb-4 text-muted-foreground">
                  <AwardIcon className="h-6 w-6" />
                  <span className="font-medium text-base">Daily Streak</span>
                </div>
                <div className="text-4xl font-bold text-primary tracking-tight">1</div>
              </div>
            </div>

            {/* Middle Section - Mood Distribution */}
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
              <div className="flex items-center gap-3 mb-6 text-muted-foreground">
                <AwardIcon className="h-6 w-6" />
                <span className="font-medium text-lg">Mood Distribution</span>
              </div>
              <div className="grid grid-cols-5 gap-3 sm:gap-6">
                {Object.entries(entries.reduce((acc, entry) => ({
                  ...acc,
                  [entry.mood]: (acc[entry.mood] || 0) + 1
                }), {} as Record<string, number>)).map(([mood, count]) => (
                  <div key={mood} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 shadow-lg">
                    <div className="text-2xl sm:text-4xl mb-2">{
                      mood === 'very_happy' ? '😄' :
                      mood === 'happy' ? '😊' :
                      mood === 'neutral' ? '😐' :
                      mood === 'sad' ? '😕' : '😢'
                    }</div>
                    <div className="text-2xl font-bold text-primary">{count}</div>
                    <div className="text-sm text-muted-foreground capitalize">{mood.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section - Achievements */}
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Trophy className="h-6 w-6" />
                  <span className="font-medium text-lg">Achievements</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowBadges(true)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  View All
                </Button>
              </div>
              
              <div className="flex flex-col gap-6">
                {/* Streak Achievement Progress */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-amber-700" />
                      <span className="font-medium text-base">Streak Progress</span>
                    </div>
                    <Badge className={cn(
                      currentStreak >= 30 ? tierColors.gold.badge :
                      currentStreak >= 14 ? tierColors.silver.badge :
                      tierColors.bronze.badge
                    )}>
                      {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          currentStreak >= 90 ? tierColors.platinum.barColor :
                          currentStreak >= 30 ? tierColors.gold.barColor :
                          currentStreak >= 14 ? tierColors.silver.barColor :
                          tierColors.bronze.barColor
                        )}
                        style={{ width: `${Math.min((currentStreak / nextStreakMilestone) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {currentStreak}/{nextStreakMilestone}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-muted-foreground">
                      {currentStreak >= nextStreakMilestone 
                        ? "Achievement complete!" 
                        : `${nextStreakMilestone - currentStreak} more days for next achievement`}
                    </div>
                    <div className="text-xs font-medium">
                      {currentStreak >= 365 ? "Diamond" :
                       currentStreak >= 90 ? "Platinum" :
                       currentStreak >= 30 ? "Gold" :
                       currentStreak >= 14 ? "Silver" : "Bronze"}
                    </div>
                  </div>
                </div>
                
                {/* Words Achievement Progress */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookIcon className="h-5 w-5 text-slate-500" />
                      <span className="font-medium text-base">Word Count</span>
                    </div>
                    <Badge className={cn(
                      totalWords >= 10000 ? tierColors.gold.badge :
                      totalWords >= 5000 ? tierColors.silver.badge :
                      tierColors.bronze.badge
                    )}>
                      {totalWords.toLocaleString()} words
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      {totalWords >= 1000 && (
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            totalWords >= 50000 ? tierColors.platinum.barColor :
                            totalWords >= 10000 ? tierColors.gold.barColor :
                            totalWords >= 5000 ? tierColors.silver.barColor :
                            tierColors.bronze.barColor
                          )}
                          style={{ 
                            width: totalWords >= 100000 ? '100%' : 
                                  totalWords >= 50000 ? `${(totalWords / 100000) * 100}%` : 
                                  totalWords >= 10000 ? `${(totalWords / 50000) * 100}%` : 
                                  totalWords >= 5000 ? `${(totalWords / 10000) * 100}%` : 
                                  totalWords >= 1000 ? `${(totalWords / 5000) * 100}%` : 
                                  `${(totalWords / 1000) * 100}%`
                          }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {totalWords >= 100000 ? '100K+' :
                       totalWords >= 50000 ? `${Math.round(totalWords/1000)}/100K` :
                       totalWords >= 10000 ? `${Math.round(totalWords/1000)}/50K` :
                       totalWords >= 5000 ? `${Math.round(totalWords/1000)}/10K` :
                       totalWords >= 1000 ? `${Math.round(totalWords/1000)}/5K` : `${totalWords}/1K`}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-muted-foreground">
                      {totalWords >= 100000 
                        ? "Literary Legend achieved!" 
                        : totalWords >= 50000
                        ? `${(100000 - totalWords).toLocaleString()} more words to Diamond` 
                        : totalWords >= 10000
                        ? `${(50000 - totalWords).toLocaleString()} more words to Platinum` 
                        : totalWords >= 5000
                        ? `${(10000 - totalWords).toLocaleString()} more words to Gold` 
                        : totalWords >= 1000
                        ? `${(5000 - totalWords).toLocaleString()} more words to Silver` 
                        : `${(1000 - totalWords).toLocaleString()} more words to Bronze`}
                    </div>
                    <div className="text-xs font-medium">
                      {totalWords >= 100000 ? "Diamond" :
                       totalWords >= 50000 ? "Platinum" :
                       totalWords >= 10000 ? "Gold" :
                       totalWords >= 5000 ? "Silver" : 
                       totalWords >= 1000 ? "Bronze" : "In progress"}
                    </div>
                  </div>
                </div>
                
                {/* Entry Frequency Progress */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-base">Entry Count</span>
                    </div>
                    <Badge className={cn(
                      entries.length >= 50 ? tierColors.gold.badge :
                      entries.length >= 25 ? tierColors.silver.badge :
                      tierColors.bronze.badge
                    )}>
                      {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          entries.length >= 100 ? tierColors.platinum.barColor :
                          entries.length >= 50 ? tierColors.gold.barColor :
                          entries.length >= 25 ? tierColors.silver.barColor :
                          tierColors.bronze.barColor
                        )}
                        style={{ 
                          width: entries.length >= 365 ? '100%' : 
                                entries.length >= 100 ? `${(entries.length / 365) * 100}%` : 
                                entries.length >= 50 ? `${(entries.length / 100) * 100}%` : 
                                entries.length >= 25 ? `${(entries.length / 50) * 100}%` : 
                                entries.length >= 10 ? `${(entries.length / 25) * 100}%` : 
                                entries.length >= 5 ? `${(entries.length / 10) * 100}%` : 
                                `${(entries.length / 5) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {entries.length}/
                      {entries.length >= 100 ? '365' :
                       entries.length >= 50 ? '100' :
                       entries.length >= 25 ? '50' :
                       entries.length >= 10 ? '25' :
                       entries.length >= 5 ? '10' : '5'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-muted-foreground">
                      {entries.length >= 365 
                        ? "Journal Oracle achieved!" 
                        : entries.length >= 100
                        ? `${365 - entries.length} more entries to Diamond` 
                        : entries.length >= 50
                        ? `${100 - entries.length} more entries to Platinum` 
                        : entries.length >= 25
                        ? `${50 - entries.length} more entries to Gold` 
                        : entries.length >= 10
                        ? `${25 - entries.length} more entries to Silver` 
                        : entries.length >= 5
                        ? `${10 - entries.length} more entries to next milestone` 
                        : `${5 - entries.length} more entries to first milestone`}
                    </div>
                    <div className="text-xs font-medium">
                      {entries.length >= 365 ? "Diamond" :
                       entries.length >= 100 ? "Platinum" :
                       entries.length >= 50 ? "Gold" :
                       entries.length >= 25 ? "Silver" : 
                       entries.length >= 5 ? "Bronze" : "In progress"}
                    </div>
                  </div>
                </div>
                
                <BadgesDialog open={showBadges} onOpenChange={setShowBadges} />
              </div>
            </div>
          </div>

          {/* Recent Entries */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Entries</h2>
            {entries.slice(0, 5).map((entry) => (
              <Card key={entry.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <p className="text-sm line-clamp-2">{entry.content}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background lg:hidden">
        <nav className="flex justify-around p-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="icon"
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}