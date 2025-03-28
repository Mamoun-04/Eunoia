
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/hooks/use-onboarding";

const goalOptions = [
  { id: "self-reflection", text: "Engage in deeper self-reflection", emoji: "🧠", description: "Discover insights about yourself through thoughtful journaling" },
  { id: "stress-reduction", text: "Reduce stress and anxiety", emoji: "💆", description: "Find calm and peace through regular writing practice" },
  { id: "gratitude", text: "Practice more gratitude", emoji: "🙏", description: "Cultivate appreciation for life's precious moments" },
  { id: "creativity", text: "Enhance creativity and self-expression", emoji: "🎨", description: "Express yourself freely and nurture your creative spirit" },
  { id: "emotional-awareness", text: "Develop better emotional awareness", emoji: "❤️", description: "Understand and process your feelings more deeply" },
  { id: "growth", text: "Track personal growth and progress", emoji: "🌱", description: "Document your journey of self-improvement" },
  { id: "custom", text: "Something else", emoji: "✨", description: "Tell us what matters most to you" }
];

export default function GoalSetting() {
  const { data, updateData, setStep } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState(data.goal || "");
  const [customGoal, setCustomGoal] = useState(data.customGoal || "");

  const handleContinue = () => {
    updateData({ 
      goal: selectedGoal, 
      customGoal: selectedGoal === "custom" ? customGoal : undefined 
    });
    setStep(4);
  };

  const isCustomSelected = selectedGoal === "custom";
  const isValid = selectedGoal && (!isCustomSelected || (isCustomSelected && customGoal.trim() !== ""));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 py-8"
    >
      <div className="text-center space-y-3 mb-8">
        <span className="text-sm font-medium text-primary/80">Step 2 of 5</span>
        <h1 className="text-3xl font-serif text-primary">Set Your Journaling Goal</h1>
        <p className="text-muted-foreground text-lg">
          What are you hoping to achieve with Eunoia?
        </p>
      </div>

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
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{option.emoji}</span>
                      <span className="font-medium">{option.text}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>

        {isCustomSelected && (
          <div className="space-y-2 p-4">
            <Label htmlFor="custom-goal">Tell us more about your goal</Label>
            <Input
              id="custom-goal"
              placeholder="What would you like to achieve?"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-center pt-6">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!isValid}
            className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Continue your journey
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
