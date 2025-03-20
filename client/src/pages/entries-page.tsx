import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { useState } from "react";
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
  Award
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MetricCard } from "@/components/metrics-card";
import { Award as AwardIcon, Book as BookIcon, Clock as ClockIcon, PenSquare as PenSquareIcon } from "lucide-react"; // Added imports


export default function EntriesPage() {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

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
    return acc + entry.content.split(/\s+/).length;
  }, 0);

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

          <div className="mb-8 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-[Playfair Display] font-bold">Insights</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-1 bg-[#111111] rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <PenSquareIcon className="h-5 w-5" />
                  <span className="font-medium">Total Entries</span>
                </div>
                <div className="text-5xl font-bold text-primary">{entries.length}</div>
              </div>

              <div className="col-span-1 bg-[#111111] rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <BookIcon className="h-5 w-5" />
                  <span className="font-medium">Total Words</span>
                </div>
                <div className="text-5xl font-bold text-primary">{entries.reduce((acc, entry) => acc + entry.content.split(/\s+/).length, 0)}</div>
              </div>

              <div className="col-span-2 bg-[#111111] rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <ClockIcon className="h-5 w-5" />
                  <span className="font-medium">Time Journaling</span>
                </div>
                <div className="text-5xl font-bold text-primary">0<span className="text-2xl ml-2 text-muted-foreground">minutes</span></div>
              </div>

              <div className="col-span-1 bg-[#111111] rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <AwardIcon className="h-5 w-5" />
                  <span className="font-medium">Daily Streak</span>
                </div>
                <div className="flex gap-8 mt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">1</div>
                    <div className="text-sm text-muted-foreground">Current</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">1</div>
                    <div className="text-sm text-muted-foreground">Best</div>
                  </div>
                </div>
              </div>

              <div className="col-span-1 bg-[#111111] rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <AwardIcon className="h-5 w-5" />
                  <span className="font-medium">Weekly Streak</span>
                </div>
                <div className="flex gap-8 mt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">1</div>
                    <div className="text-sm text-muted-foreground">Current</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">1</div>
                    <div className="text-sm text-muted-foreground">Best</div>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm"  className="w-full">
              Suggest Improvement to Insights
            </Button>

            <div className="col-span-2 bg-[#111111] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <ClockIcon className="h-5 w-5" />
                <span>Time Journaling</span>
              </div>
              <div className="text-4xl font-bold text-primary">0 <span className="text-lg text-muted-foreground">minutes</span></div>
            </div>

            <div className="col-span-1 bg-[#111111] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <AwardIcon className="h-5 w-5" />
                <span>Daily Streak</span>
              </div>
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