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
    id: "lesson-1",
    title: "Inner Wisdom Reflection Practice",
    topic: "Wisdom",
    description: "Reflect on the wisdom that comes from introspection and life experiences.",
    questions: [
      {
        id: "lesson-1-q1",
        type: "text",
        prompt: "Share a moment today when you felt guided by your inner wisdom."
      },
      {
        id: "lesson-1-q2",
        type: "text",
        prompt: "What lessons have you learned from past mistakes that shape your decisions today?"
      },
      {
        id: "lesson-1-q3",
        type: "text",
        prompt: "Describe a piece of advice you received that turned out to be deeply meaningful."
      },
      {
        id: "lesson-1-q4",
        type: "text",
        prompt: "How do you distinguish between your inner voice and external influences?"
      },
      {
        id: "lesson-1-q5",
        type: "text",
        prompt: "Write about a time when trusting your instincts led to personal growth."
      }
    ]
  },
  {
    id: "lesson-2",
    title: "Cultivating Gratitude",
    topic: "Gratitude",
    description: "Deepen your awareness of blessings in your life.",
    questions: [
      {
        id: "lesson-2-q1",
        type: "text",
        prompt: "List three small things you’re grateful for today."
      },
      {
        id: "lesson-2-q2",
        type: "text",
        prompt: "Who is someone you appreciate deeply, and why?"
      },
      {
        id: "lesson-2-q3",
        type: "text",
        prompt: "How does practicing gratitude change your perspective?"
      },
      {
        id: "lesson-2-q4",
        type: "text",
        prompt: "What challenge has helped you grow that you’re now thankful for?"
      },
      {
        id: "lesson-2-q5",
        type: "text",
        prompt: "What’s something beautiful you noticed today?"
      }
    ]
  },
  {
    id: "lesson-3",
    title: "The Power of Forgiveness",
    topic: "Forgiveness",
    description: "Explore your capacity to forgive and release emotional burdens.",
    questions: [
      {
        id: "lesson-3-q1",
        type: "text",
        prompt: "Is there someone you’re holding resentment toward?"
      },
      {
        id: "lesson-3-q2",
        type: "text",
        prompt: "What would it feel like to truly let go?"
      },
      {
        id: "lesson-3-q3",
        type: "text",
        prompt: "Have you forgiven yourself for past mistakes? Why or why not?"
      }
    ]
  },
  {
    id: "lesson-4",
    title: "Mindful Presence Practice",
    topic: "Mindfulness",
    description: "Practice being fully present in your thoughts, feelings, and surroundings.",
    questions: [
      {
        id: "lesson-4-q1",
        type: "text",
        prompt: "Describe how your body feels at this very moment."
      },
      {
        id: "lesson-4-q2",
        type: "text",
        prompt: "What are three sounds you can hear right now?"
      },
      {
        id: "lesson-4-q3",
        type: "text",
        prompt: "Recall a moment today when you felt truly present."
      },
      {
        id: "lesson-4-q4",
        type: "text",
        prompt: "How do distractions affect your peace of mind?"
      },
      {
        id: "lesson-4-q5",
        type: "text",
        prompt: "What helps you return to the present moment?"
      }
    ]
  },
  {
    id: "lesson-5",
    title: "Exploring Identity",
    topic: "Self-Awareness",
    description: "Delve into who you are and how your experiences shape you.",
    questions: [
      {
        id: "lesson-5-q1",
        type: "text",
        prompt: "How would you describe yourself to a stranger?"
      },
      {
        id: "lesson-5-q2",
        type: "text",
        prompt: "Which labels do you identify with most and why?"
      },
      {
        id: "lesson-5-q3",
        type: "text",
        prompt: "What parts of your identity have changed over time?"
      }
    ]
  },
  {
    id: "lesson-6",
    title: "Navigating Uncertainty",
    topic: "Trust",
    description: "Reflect on how you approach uncertainty and faith in the unseen.",
    questions: [
      {
        id: "lesson-6-q1",
        type: "text",
        prompt: "How do you typically react to uncertainty?"
      },
      {
        id: "lesson-6-q2",
        type: "text",
        prompt: "Recall a time when trusting the process led to a good outcome."
      },
      {
        id: "lesson-6-q3",
        type: "text",
        prompt: "What would it look like to fully surrender control?"
      },
      {
        id: "lesson-6-q4",
        type: "text",
        prompt: "What helps you build trust in yourself or something greater?"
      }
    ]
  },
  {
    id: "lesson-7",
    title: "Healing Through Writing",
    topic: "Emotional Healing",
    description: "Use your words to process pain and move toward healing.",
    questions: [
      {
        id: "lesson-7-q1",
        type: "text",
        prompt: "Write a letter to someone who hurt you—but don’t send it."
      },
      {
        id: "lesson-7-q2",
        type: "text",
        prompt: "What emotion have you been avoiding lately?"
      },
      {
        id: "lesson-7-q3",
        type: "text",
        prompt: "Describe a moment that broke you—and what you learned from it."
      },
      {
        id: "lesson-7-q4",
        type: "text",
        prompt: "What does healing feel like to you?"
      },
      {
        id: "lesson-7-q5",
        type: "text",
        prompt: "Who or what gives you the strength to keep going?"
      }
    ]
  },
  {
    id: "lesson-8",
    title: "Acts of Compassion",
    topic: "Compassion",
    description: "Develop your ability to see and serve others with empathy.",
    questions: [
      {
        id: "lesson-8-q1",
        type: "text",
        prompt: "Describe a time when someone showed you unexpected kindness."
      },
      {
        id: "lesson-8-q2",
        type: "text",
        prompt: "What’s one compassionate act you can do this week?"
      },
      {
        id: "lesson-8-q3",
        type: "text",
        prompt: "How do you treat yourself when you’re struggling?"
      }
    ]
  },
  {
    id: "lesson-9",
    title: "Purpose and Direction",
    topic: "Purpose",
    description: "Reflect on the deeper meaning behind your actions and dreams.",
    questions: [
      {
        id: "lesson-9-q1",
        type: "text",
        prompt: "What drives you to get out of bed in the morning?"
      },
      {
        id: "lesson-9-q2",
        type: "text",
        prompt: "What legacy would you like to leave behind?"
      },
      {
        id: "lesson-9-q3",
        type: "text",
        prompt: "How do your daily actions align with your long-term goals?"
      },
      {
        id: "lesson-9-q4",
        type: "text",
        prompt: "Describe your dream life in five years."
      },
      {
        id: "lesson-9-q5",
        type: "text",
        prompt: "What’s one thing you could start doing today to live more purposefully?"
      }
    ]
  },
  {
    id: "lesson-10",
    title: "Surrender and Serenity",
    topic: "Letting Go",
    description: "Let go of what you can’t control and embrace inner peace.",
    questions: [
      {
        id: "lesson-10-q1",
        type: "text",
        prompt: "What’s something you’ve been trying to control, but can’t?"
      },
      {
        id: "lesson-10-q2",
        type: "text",
        prompt: "How would it feel to truly let it go?"
      },
      {
        id: "lesson-10-q3",
        type: "text",
        prompt: "What’s a sign that you're holding on too tightly to something?"
      }
    ]
  }
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