
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  id: string;
  type: "text" | "multipleChoice" | "slider";
  prompt: string;
  options?: string[];
}

interface LessonProps {
  title: string;
  topic: string;
  description: string;
  questions: Question[];
  onComplete: (answers: Record<string, any>) => void;
  onClose: () => void;
}

export function GuidedLesson({ title, topic, description, questions, onComplete, onClose }: LessonProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion === questions.length - 1) {
      onComplete(answers);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    
    switch (question.type) {
      case "text":
        return (
          <Textarea
            placeholder="Write your thoughts..."
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            className="min-h-[100px]"
          />
        );
      case "multipleChoice":
        return (
          <RadioGroup
            value={answers[question.id]}
            onValueChange={handleAnswer}
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "slider":
        return (
          <div className="space-y-4">
            <Slider
              min={1}
              max={10}
              step={1}
              value={[answers[question.id] || 1]}
              onValueChange={([value]) => handleAnswer(value)}
            />
            <div className="flex justify-between text-sm">
              <span>1</span>
              <span>10</span>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-lg font-medium">{questions[currentQuestion].prompt}</h4>
        {renderQuestion()}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleNext}>
          {currentQuestion === questions.length - 1 ? "Complete" : "Next"}
        </Button>
      </div>
    </Card>
  );
}
