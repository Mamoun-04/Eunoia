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

// =============== Helper Functions =============== //

// Calculates the *current* streak (most recent consecutive days).
function calculateCurrentStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  // Sort descending by date
  const sortedDates = entries
    .map(e => new Date(e.createdAt).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = sortedDates[i - 1];
    const curr = sortedDates[i];
    // If previous day minus current day = exactly 1 day, increment streak
    if (prev - curr === 86400000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Calculates the *longest* streak in the user’s entire history.
function calculateLongestStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  // Sort ascending by date to scan from oldest to newest
  const sortedDates = entries
    .map(e => new Date(e.createdAt).setHours(0, 0, 0, 0))
    .sort((a, b) => a - b);

  let longest = 1;
  let current = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    // If consecutive day, increment; otherwise reset
    if (sortedDates[i] - sortedDates[i - 1] === 86400000) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

// Returns the next milestone after 'value' from a sorted array
// If value = 3 and milestones = [1, 5, 10], next milestone is 5.
function getNextMilestone(value: number, milestones: number[]): number {
  for (const m of milestones) {
    if (m > value) return m;
  }
  // If we exceed all milestones, just return the largest
  return milestones[milestones.length - 1];
}

// =============== Milestone Popup Dialog =============== //

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
          <Trophy className="mx-auto h-10 w-10 text-amber-500" />
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

// =============== Main Component =============== //

export default function EntriesPage() {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

  // Load entries
  const { data: entries = [], isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  // Basic stats
  const totalEntries = entries.length;
  const totalWords = entries.reduce((acc, e) => {
    return acc + e.content.split(/\s+/).filter(Boolean).length;
  }, 0);
  const currentStreak = calculateCurrentStreak(entries);
  const longestStreak = calculateLongestStreak(entries);

  // Milestone arrays (adjust as desired)
  const entryMilestones = [1, 5, 10, 25, 50, 100, 200];
  const wordMilestones = [100, 500, 1000, 5000, 10000, 20000, 50000];
  const streakMilestones = [1, 5, 10, 30, 60, 90, 180];

  // We'll store the user's "previous" stats in refs so we can detect crossing a milestone
  const prevEntriesRef = useRef<number>(0);
  const prevWordsRef = useRef<number>(0);
  const prevStreakRef = useRef<number>(0);

  // State for the popup message
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);

  // Whenever entries update, check if we crossed a new milestone
  useEffect(() => {
    if (isLoading) return;

    let newMessage: string | null = null;

    // 1) Starter Achievement for first entry
    if (prevEntriesRef.current === 0 && totalEntries === 1) {
      newMessage = "Congrats on writing your very first entry!";
    }

    // 2) Check entry milestones
    if (!newMessage && totalEntries > prevEntriesRef.current) {
      // Find the next milestone we just reached or exceeded
      const next = entryMilestones.find(
        (m) => m <= totalEntries && m > prevEntriesRef.current
      );
      if (next) {
        newMessage = next === 1
          ? "Congrats on your very first entry!"
          : `You’ve reached ${next} total entries! Keep going!`;
      }
    }

    // 3) Check word milestones
    if (!newMessage && totalWords > prevWordsRef.current) {
      const next = wordMilestones.find(
        (m) => m <= totalWords && m > prevWordsRef.current
      );
      if (next) {
        newMessage = `Wow, you’ve written ${next.toLocaleString()} words! Fantastic work!`;
      }
    }

    // 4) Check streak milestones (we also handle day=1 above, but let's keep it here for clarity)
    if (!newMessage && currentStreak > prevStreakRef.current) {
      const next = streakMilestones.find(
        (m) => m <= currentStreak && m > prevStreakRef.current
      );
      if (next) {
        if (next === 1) {
          newMessage = "You started a new streak—keep it up!";
        } else {
          newMessage = `You’ve hit a ${next}-day streak! Awesome dedication!`;
        }
      }
    }

    // If we found a new milestone, show the popup
    if (newMessage) {
      setMilestoneMessage(newMessage);
    }

    // Update "previous" stats
    prevEntriesRef.current = totalEntries;
    prevWordsRef.current = totalWords;
    prevStreakRef.current = currentStreak;
  }, [entries, isLoading, totalEntries, totalWords, currentStreak]);

  // --------------- Layout --------------- //
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
            <p className="text-lg text-muted-foreground">
              {format(new Date(), "MMMM d")}
            </p>
          </div>

          {/* 3 Major Achievements */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {/* 1) Total Entries */}
            <Card className="rounded-3xl p-6 shadow hover:shadow-md transition">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-5 w-5" />
                  <span>Entries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {totalEntries}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalEntries === 1 ? "1 entry" : `${totalEntries} entries`}
                </p>
              </CardContent>
            </Card>

            {/* 2) Total Words */}
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

            {/* 3) Streak (current & longest) */}
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
                  <span className="ml-2 text-base text-muted-foreground">
                    days
                  </span>
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
            ) : entries.length === 0 ? (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">
                  No entries yet. Start writing!
                </p>
              </Card>
            ) : (
              entries.slice(0, 5).map((entry) => (
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* ===== Mobile Bottom Navigation ===== */}
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

      {/* ===== Milestone Popup ===== */}
      <MilestoneDialog
        message={milestoneMessage}
        open={!!milestoneMessage}
        onClose={() => setMilestoneMessage(null)}
      />
    </div>
  );
}
