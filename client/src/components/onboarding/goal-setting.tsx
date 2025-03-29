import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Brain, HeartHandshake, Heart, Sparkles, PenSquare, Leaf, Coffee } from "lucide-react";

export default function GoalSetting() {
  const [selectedGoal, setSelectedGoal] = useState("");
  const { data, updateData, nextStep } = useOnboarding();

  const goalOptions = [
    {
      id: "mindfulness",
      text: "Mindfulness & Reflection",
      icon: <Brain />,
      description: "Practice mindfulness and self-reflection"
    },
    {
      id: "growth",
      text: "Personal Growth",
      icon: <Sparkles />,
      description: "Focus on personal development and growth"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <RadioGroup
        value={selectedGoal}
        onValueChange={setSelectedGoal}
        className="space-y-3"
      >
        {goalOptions.map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedGoal === option.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedGoal(option.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-4 items-center">
                  <RadioGroupItem value={option.id} id={option.id} />
                </div>
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8">{option.icon}</span>
                    <span className="font-medium">{option.text}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                </Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
}