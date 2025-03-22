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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

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
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
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

        

        {selectedCategory && (
          <JournalEditor
            initialCategory={selectedCategory}
            onClose={() => setSelectedCategory(null)}
          />
        )}
      </div>
    </div>
  );
}