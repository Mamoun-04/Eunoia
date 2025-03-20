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
  Award,
  MessageSquare
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MetricCard } from "@/components/metrics-card";
import { Award as AwardIcon, Book as BookIcon, Clock as ClockIcon, PenSquare as PenSquareIcon } from "lucide-react"; // Added imports

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: string;
  isUnlocked: boolean;
}

export default function EntriesPage() {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();
  const [showBadges, setShowBadges] = useState(false);

  const { data: entries = [], isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const navigation = [
    { name: "Today", href: "/", icon: CalendarDays },
    { name: "Entries", href: "/entries", icon: PenSquare },
    { name: "AI Chat", href: "/assistant", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Calculate stats
  const currentMonth = format(new Date(), 'MMMM yyyy');
  const entriesThisMonth = entries.filter(entry =>
    format(new Date(entry.createdAt), 'MMMM yyyy') === currentMonth
  ).length;

  // Calculate word count
  const totalWords = entries.reduce((acc, entry) => {
    return acc + entry.content.split(/\s+/).length;
  }, 0);

  const BADGES: Badge[] = [
    {
      id: "first_entry",
      name: "First Steps",
      description: "Write your first journal entry",
      emoji: "📝",
      requirement: "Write 1 entry",
      isUnlocked: entries.length > 0,
    },
    // Add more badges here as needed
  ];


  return (
    <div className="flex min-h-screen bg-background pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-64 p-4 border-r">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold px-4">Eunoia</h1>
          <p className="text-sm text-muted-foreground px-4">Your Insights</p>
        </div>

        <nav className="flex flex-col gap-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          ))}
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
                  <div key={mood} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-black/20">
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
              <div className="flex items-center gap-3 mb-6 text-muted-foreground">
                <AwardIcon className="h-6 w-6" />
                <span className="font-medium text-lg">Achievements</span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-end gap-8">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Current</div>
                    <div className="flex items-end">
                      <div className="w-2 h-16 bg-primary rounded-full"></div>
                      <div className="ml-2">1</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Best</div>
                    <div className="flex items-end">
                      <div className="w-2 h-16 bg-primary rounded-full"></div>
                      <div className="ml-2">1</div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-muted pt-4">
                  <div className="text-sm text-muted-foreground mb-2">Next Achievement</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <div>
                      <div className="text-sm font-medium">Philosopher</div>
                      <div className="text-xs text-muted-foreground">4 more days for 5-day streak</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowBadges(true)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Unlocked:
                  {BADGES.filter(badge => badge.isUnlocked).map(badge => (
                    <span key={badge.id} className="ml-1" title={badge.name}>{badge.emoji}</span>
                  ))}
                  {BADGES.filter(badge => !badge.isUnlocked).map(badge => (
                    <span key={badge.id} className="ml-1 opacity-50" title={badge.name}>{badge.emoji}</span>
                  ))}
                </button>
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