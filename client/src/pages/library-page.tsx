
import { Card } from "@/components/ui/card";
import { categoryOptions } from "@shared/schema";
import { JournalEditor } from "@/components/journal-editor";
import { GuidedLesson } from "@/components/guided-lesson";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  LogOut,
  Settings,
  CalendarDays,
  PenSquare,
  BookOpen,
  Sparkles
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
        id: "grateful-person",
        type: "text",
        prompt: "Write about someone who has positively impacted your life recently. What qualities do you appreciate about them?"
      },
      {
        id: "gratitude-impact",
        type: "multipleChoice",
        prompt: "How has practicing gratitude affected your mindset?",
        options: [
          "It's transformed my perspective",
          "I feel more content",
          "I notice small blessings more",
          "I'm still learning to be grateful"
        ]
      },
      {
        id: "gratitude-expression",
        type: "multipleChoice",
        prompt: "How do you prefer to express gratitude to others?",
        options: [
          "Writing thank-you notes",
          "Verbal appreciation",
          "Acts of service",
          "Small gifts or gestures"
        ]
      },
      {
        id: "gratitude-level",
        type: "slider",
        prompt: "How grateful do you feel in this moment? (1-10)"
      }
    ]
  },
  {
    id: "mindfulness",
    title: "Present Moment Awareness",
    topic: "Mindfulness",
    description: "Practice being present and aware of your current experience.",
    questions: [
      {
        id: "present-moment",
        type: "text",
        prompt: "What sensations do you notice in your body right now?"
      },
      {
        id: "mindful-activity",
        type: "multipleChoice",
        prompt: "Which mindfulness practice resonates with you most?",
        options: [
          "Breathing exercises",
          "Body scan meditation",
          "Observing thoughts",
          "Connection with nature"
        ]
      },
      {
        id: "current-feelings",
        type: "text",
        prompt: "What physical sensations and emotions are you experiencing right now?"
      },
      {
        id: "environment",
        type: "text",
        prompt: "Describe three things you can observe in your immediate environment using your senses."
      },
      {
        id: "mindfulness-practice",
        type: "multipleChoice",
        prompt: "What mindfulness technique resonates with you most?",
        options: [
          "Breathing exercises",
          "Body scanning",
          "Mindful walking",
          "Sound awareness"
        ]
      },
      {
        id: "mindfulness-challenge",
        type: "multipleChoice",
        prompt: "What's your biggest challenge with staying present?",
        options: [
          "Racing thoughts",
          "Physical discomfort",
          "External distractions",
          "Time constraints"
        ]
      },
      {
        id: "presence-level",
        type: "slider",
        prompt: "How present and grounded do you feel right now? (1-10)"
      }
    ]
  }
          "Observing thoughts",
          "Connection with nature"
        ]
      }
    ]
  }
];

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    
    // Here you would typically save the entry
    console.log("New entry:", entry);
    setSelectedLesson(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
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
      </div>

      {selectedLesson && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto h-full flex items-center justify-center p-4">
            <GuidedLesson
              {...selectedLesson}
              onComplete={handleLessonComplete}
              onClose={() => setSelectedLesson(null)}
            />
          </div>
        </div>
      )}

      {selectedCategory && (
        <JournalEditor
          initialCategory={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
