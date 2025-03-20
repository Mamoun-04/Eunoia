import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay, differenceInDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
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
  BookMarked,
  BarChart3
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { JournalEditor } from "@/components/journal-editor";
import { MoodSelector } from "@/components/mood-selector";

export default function EntriesPage() {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isEditing, setIsEditing] = useState(false);

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
  const totalEntries = entries.length;
  const entriesThisMonth = entries.filter(entry => 
    new Date(entry.createdAt).getMonth() === new Date().getMonth()
  ).length;
  
  // Calculate streak
  const getStreak = () => {
    if (entries.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Check if wrote today
    if (!isSameDay(new Date(sortedEntries[0].createdAt), today)) return 0;
    
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const curr = new Date(sortedEntries[i].createdAt);
      const next = new Date(sortedEntries[i + 1].createdAt);
      if (differenceInDays(curr, next) === 1) {
        streak++;
      } else break;
    }
    return streak + 1; // Add 1 for today
  };

  const currentStreak = getStreak();

  // Get entries for selected date
  const selectedDateEntries = selectedDate ? entries.filter(entry =>
    isSameDay(new Date(entry.createdAt), selectedDate)
  ) : [];

  // Calculate days with entries for calendar
  const daysWithEntries = entries.map(entry => new Date(entry.createdAt));

  return (
    <div className="flex min-h-screen bg-background pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-64 p-4 border-r">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold px-4">Eunoia</h1>
          <p className="text-sm text-muted-foreground px-4">Your Journal History</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stats Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                </div>
                <p className="text-sm text-muted-foreground">Keep writing daily!</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-primary" />
                  Monthly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{entriesThisMonth}</div>
                <p className="text-sm text-muted-foreground">
                  entries this month
                </p>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Journal Calendar
                </CardTitle>
                <CardDescription>
                  Select a date to view entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{ hasEntry: daysWithEntries }}
                  modifiersStyles={{
                    hasEntry: {
                      backgroundColor: "hsl(var(--primary) / 0.1)",
                      color: "hsl(var(--primary))",
                    }
                  }}
                  className="border rounded-lg p-4"
                />
              </CardContent>
            </Card>

            {/* Selected Date Entries */}
            {selectedDate && selectedDateEntries.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>
                    Entries for {format(selectedDate, 'MMMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedDateEntries.map((entry) => (
                    <Card key={entry.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">
                            {entry.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.createdAt), "p")}
                          </p>
                        </div>
                        <MoodSelector value={entry.mood} readonly />
                      </div>
                      <div className="prose dark:prose-invert max-w-none">
                        {entry.content}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}
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

      {isEditing && (
        <JournalEditor
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
