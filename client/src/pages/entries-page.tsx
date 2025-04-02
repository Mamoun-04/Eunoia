import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LogOut,
  Settings,
  PenSquare,
  BookOpen,
  Trophy,
  Home,
  Edit,
  Trash2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// ===== Helper Functions ===== //

// Calculate the current streak (most recent consecutive days)
function calculateCurrentStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  const sortedDates = entries
    .map(e => new Date(e.createdAt).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = sortedDates[i - 1];
    const curr = sortedDates[i];
    if (prev - curr === 86400000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Calculate the longest streak in history
function calculateLongestStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  const sortedDates = entries
    .map(e => new Date(e.createdAt).setHours(0, 0, 0, 0))
    .sort((a, b) => a - b);
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    if (sortedDates[i] - sortedDates[i - 1] === 86400000) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

// Helper to check and mark a milestone as achieved in localStorage
function checkAndMarkMilestone(key: string, message: string): string | null {
  const achieved = JSON.parse(localStorage.getItem("achievedMilestones") || "{}");
  if (!achieved[key]) {
    achieved[key] = true;
    localStorage.setItem("achievedMilestones", JSON.stringify(achieved));
    return message;
  }
  return null;
}

// ===== Milestone Popup Dialog ===== //

function MilestoneDialog({
  message,
  open,
  onClose,
}: {
  message: string | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <div className="space-y-4">
          {/* Bouncing trophy icon for extra flair */}
          <Trophy className="mx-auto h-10 w-10 text-amber-500 animate-bounce" />
          <h2 className="text-xl font-bold">Milestone Unlocked!</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
          <Button onClick={onClose} className="mt-2">
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===== Main Component ===== //

export default function EntriesPage() {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();
  const { data: entries = [], isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  // Basic stats
  const totalEntries = entries.length;
  const totalWords = entries.reduce(
    (acc, e) => acc + e.content.split(/\s+/).filter(Boolean).length,
    0
  );
  const currentStreak = calculateCurrentStreak(entries);
  const longestStreak = calculateLongestStreak(entries);

  // Milestone arrays (adjust as needed)
  const entryMilestones = [1, 5, 10, 25, 50, 100, 200];
  const wordMilestones = [100, 500, 1000, 5000, 10000, 20000, 50000];
  const streakMilestones = [1, 5, 10, 30, 60, 90, 180];

  // Refs to store previous stats for milestone detection
  const prevEntriesRef = useRef<number>(0);
  const prevWordsRef = useRef<number>(0);
  const prevStreakRef = useRef<number>(0);

  // State for the milestone popup message
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);

  // Milestone detection effect (runs when entries update)
  useEffect(() => {
    if (isLoading) return;
    let newMessage: string | null = null;

    // 1. Starter Achievement (first entry)
    if (prevEntriesRef.current === 0 && totalEntries === 1) {
      newMessage = checkAndMarkMilestone(
        "entry-1",
        "Congrats on writing your very first entry!"
      );
    }

    // 2. Check total entry milestones
    if (!newMessage && totalEntries > prevEntriesRef.current) {
      const next = entryMilestones.find(
        (m) => m <= totalEntries && m > prevEntriesRef.current
      );
      if (next) {
        newMessage = checkAndMarkMilestone(
          `entry-${next}`,
          `You’ve reached ${next} total entries! Keep going!`
        );
      }
    }

    // 3. Check word count milestones
    if (!newMessage && totalWords > prevWordsRef.current) {
      const next = wordMilestones.find(
        (m) => m <= totalWords && m > prevWordsRef.current
      );
      if (next) {
        newMessage = checkAndMarkMilestone(
          `words-${next}`,
          `Wow, you’ve written ${next.toLocaleString()} words! Fantastic work!`
        );
      }
    }

    // 4. Check streak milestones
    if (!newMessage && currentStreak > prevStreakRef.current) {
      const next = streakMilestones.find(
        (m) => m <= currentStreak && m > prevStreakRef.current
      );
      if (next) {
        newMessage = checkAndMarkMilestone(
          `streak-${next}`,
          next === 1
            ? "You started a new streak—keep it up!"
            : `You’ve hit a ${next}-day streak! Awesome dedication!`
        );
      }
    }

    if (newMessage) {
      setMilestoneMessage(newMessage);
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Update previous stats
    prevEntriesRef.current = totalEntries;
    prevWordsRef.current = totalWords;
    prevStreakRef.current = currentStreak;
  }, [entries, isLoading, totalEntries, totalWords, currentStreak]);

  // Navigation remains unchanged
  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Entries", href: "/entries", icon: PenSquare },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background pb-16 lg:pb-0">
      {/* ===== Desktop Sidebar ===== */}
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

      {/* ===== Main Content ===== */}
      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Today</h1>
            <p className="text-lg text-muted-foreground">{format(new Date(), "MMMM d")}</p>
          </div>

          {/* 3 Major Achievement Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {/* Total Entries */}
            <Card className="rounded-3xl p-6 shadow hover:shadow-md transition">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-5 w-5" />
                  <span>Entries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{totalEntries}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalEntries === 1 ? "1 entry" : `${totalEntries} entries`}
                </p>
              </CardContent>
            </Card>

            {/* Total Words */}
            <Card className="rounded-3xl p-6 shadow hover:shadow-md transition">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <Edit className="h-5 w-5" />
                  <span>Words</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {totalWords.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Total Words</p>
              </CardContent>
            </Card>

            {/* Streak (Current & Longest) */}
            <Card className="rounded-3xl p-6 shadow hover:shadow-md transition">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="h-5 w-5" />
                  <span>Streak</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {currentStreak}
                  <span className="ml-2 text-base text-muted-foreground">days</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Longest: {longestStreak} {longestStreak === 1 ? "day" : "days"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Entries */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Entries</h2>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading entries...</p>
            ) : totalEntries === 0 ? (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">No entries yet. Start writing!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            )}
          </div>
        </div>
      </div>

      {/* ===== Mobile Bottom Navigation ===== */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 backdrop-blur-md bg-background/80 lg:hidden">
        <nav className="flex justify-around items-center px-6 py-3">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-full ${
                    isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent"
                  }`}
                  title={item.name}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ===== Milestone Popup (Global) ===== */}
      <MilestoneDialog
        message={milestoneMessage}
        open={!!milestoneMessage}
        onClose={() => setMilestoneMessage(null)}
      />
    </div>
  );
}