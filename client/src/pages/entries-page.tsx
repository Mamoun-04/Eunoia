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

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Entries</div>
                  <div className="text-3xl font-bold">{entriesThisMonth}</div>
                  <div className="text-sm text-muted-foreground">this month</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Words Written</div>
                  <div className="text-3xl font-bold">{totalWords.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">total</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Daily Streak</div>
                  <div className="text-3xl font-bold flex items-center gap-2">
                    <span>1</span>
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">Keep it up!</div>
                </div>
              </div>
            </CardContent>
          </Card>

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