import { Card } from "@/components/ui/card";
import { categoryOptions } from "@shared/schema";
import { JournalEditor } from "@/components/journal-editor";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  LogOut,
  Settings,
  CalendarDays,
  PenSquare,
  BookOpen
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Today", href: "/", icon: CalendarDays },
    { name: "Entries", href: "/entries", icon: PenSquare },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
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
          <h2 className="text-3xl font-bold mb-8">Writing Topics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryOptions.map((category) => (
              <Card
                key={category}
                className="p-6 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setSelectedCategory(category)}
              >
                <h3 className="text-xl font-semibold mb-2">{category}</h3>
                <p className="text-sm text-muted-foreground">
                  Explore your thoughts about {category.toLowerCase()}
                </p>
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

      {selectedCategory && (
        <JournalEditor
          initialCategory={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}