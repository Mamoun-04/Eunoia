import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { GuidedLesson } from "@/components/guided-lesson";
import { useState } from "react";
import {
  LogOut,
  Settings,
  CalendarDays,
  PenSquare,
  BookOpen,
  Search,
  Home,
  Filter
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SAMPLE_LESSONS = [
  {
    id: "lesson-47",
    title: "Inner Wisdom Reflection Practice",
    topic: "Wisdom",
    description: "Reflect on the wisdom that comes from introspection and life experiences.",
    questions: [
      {
        id: "innerwisdom-text-47",
        type: "text",
        prompt: "Share a moment today when you felt guided by your inner wisdom."
      },
      {
        id: "innerwisdom-slider-47",
        type: "slider",
        prompt: "On a scale of 1-10, how much did you trust your inner wisdom today?"
      },
      {
        id: "innerwisdom-mc-47",
        type: "multipleChoice",
        prompt: "Which option best captures your connection to inner wisdom today?",
        options: [
          "I felt deeply guided",
          "I relied on past experiences",
          "I was uncertain but listened inwardly",
          "I am still seeking clarity"
        ]
      }
    ]
  },
  // Generate 66 lessons with 5 prompts each
  ...Array(66).fill(null).map((_, index) => ({
    id: `lesson-${index + 1}`,
    title: `Reflection Practice ${index + 1}`,
    topic: "General",
    description: `A daily reflection practice focusing on personal growth and mindfulness.`,
    questions: Array(5).fill(null).map((_, qIndex) => ({
      id: `q-${index}-${qIndex}`,
      type: qIndex === 0 ? "text" : qIndex === 1 ? "slider" : "multipleChoice",
      prompt: `Question ${qIndex + 1} for reflection ${index + 1}`,
      ...(qIndex >= 2 && {
        options: [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ]
      })
    }))
  }))
];

export default function LibraryPage() {
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const { logoutMutation } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [lengthFilter, setLengthFilter] = useState("all");

  const filteredLessons = SAMPLE_LESSONS.filter((lesson) => {
    const titleMatch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    const topicMatch = lesson.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const lengthMatch = lengthFilter === "all" ||
      (lengthFilter === "short" && lesson.questions.length === 5) ||
      (lengthFilter === "medium" && lesson.questions.length === 10) ||
      (lengthFilter === "long" && lesson.questions.length === 15);
    return (titleMatch || topicMatch) && lengthMatch;
  });

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Entries", href: "/entries", icon: PenSquare },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLessonComplete = (answers: Record<string, any>) => {
    const entry = {
      title: selectedLesson.title,
      content: Object.entries(answers)
        .map(([key, value]) => {
          const question = selectedLesson.questions.find((q: any) => q.id === key);
          return `${question.prompt}\n${value}`;
        })
        .join('\n\n'),
      mood: "neutral",
      category: selectedLesson.topic
    };

    console.log("New entry:", entry);
    setSelectedLesson(null);
  };

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
        <div className="container mx-auto">
          {!selectedLesson ? (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Guided Journaling</h1>
                <p className="text-muted-foreground">
                  Choose a lesson below to begin your reflection journey
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by topic or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        {lengthFilter === "all" ? "All Lengths" :
                          lengthFilter === "short" ? "Short (5 prompts)" :
                            lengthFilter === "medium" ? "Medium (10 prompts)" : "Long (15 prompts)"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setLengthFilter("all")}>All Lengths</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLengthFilter("short")}>Short (5 prompts)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLengthFilter("medium")}>Medium (10 prompts)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLengthFilter("long")}>Long (15 prompts)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => (
                  <Card
                    key={lesson.id}
                    className="p-6 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <Sparkles className="h-8 w-8 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{lesson.description}</p>
                    <div className="text-sm text-primary">{lesson.questions.length} prompts • 5 min</div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => setSelectedLesson(null)}
                className="mb-4"
              >
                ← Back to Lessons
              </Button>
              <GuidedLesson
                {...selectedLesson}
                onComplete={handleLessonComplete}
                onClose={() => setSelectedLesson(null)}
              />
            </div>
          )}
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
                  variant="ghost"
                  size="icon"
                  className={`flex flex-col items-center gap-1 h-auto py-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : ""
                  }`}
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