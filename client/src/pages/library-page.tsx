
import { useAuth } from "@/hooks/use-auth";
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
} from "lucide-react";
import { Link, useLocation } from "wouter";

const SAMPLE_LESSONS = [
  {
    id: "gratitude",
    title: "Daily Gratitude Practice",
    topic: "Gratitude",
    description: "Reflect on the blessings in your life and cultivate thankfulness.",
    questions: [
      {
        id: "grateful-moment",
        type: "text",
        prompt: "What is one specific moment from today that you're grateful for?"
      },
      {
        id: "gratitude-level",
        type: "slider",
        prompt: "How grateful do you feel right now?"
      },
      {
        id: "gratitude-impact",
        type: "multipleChoice",
        prompt: "How has gratitude impacted your day?",
        options: [
          "It's transformed my perspective",
          "I feel more content",
          "I notice small blessings more",
          "I'm still learning to be grateful"
        ]
      }
    ]
  },
  {
    id: "mindfulness",
    title: "Present Moment Awareness",
    topic: "Mindfulness",
    description: "Connect with the present moment and find peace in stillness.",
    questions: [
      {
        id: "current-feelings",
        type: "text",
        prompt: "What sensations and emotions are you experiencing right now?"
      },
      {
        id: "presence-level",
        type: "slider",
        prompt: "How present do you feel in this moment?"
      },
      {
        id: "mindfulness-practice",
        type: "multipleChoice",
        prompt: "What helps you stay present?",
        options: [
          "Breathing exercises",
          "Physical sensations",
          "Observing thoughts",
          "Connection with nature"
        ]
      }
    ]
  }
];

export default function LibraryPage() {
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Today", href: "/", icon: CalendarDays },
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
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-2 ${
                  location === item.href 
                    ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    : ""
                }`}
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
        <div className="container mx-auto">
          {!selectedLesson ? (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Guided Journaling</h1>
                <p className="text-muted-foreground">
                  Choose a lesson below to begin your reflection journey
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAMPLE_LESSONS.map((lesson) => (
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
