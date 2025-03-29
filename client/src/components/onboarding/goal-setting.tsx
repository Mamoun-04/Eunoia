
import { useState } from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brain, HeartHandshake, Heart, Sparkles, PenSquare, Leaf, Coffee } from "lucide-react";

const goalOptions = [
  { 
    id: "self-reflection", 
    text: "Engage in deeper self-reflection", 
    icon: <Brain className="text-primary/80" size={20} />, 
    description: "Discover insights about yourself through thoughtful journaling" 
  },
  { 
    id: "stress-reduction", 
    text: "Reduce stress and anxiety", 
    icon: <Coffee className="text-primary/80" size={20} />, 
    description: "Find calm and peace through regular writing practice" 
  },
  { 
    id: "gratitude", 
    text: "Practice more gratitude", 
    icon: <HeartHandshake className="text-primary/80" size={20} />, 
    description: "Cultivate appreciation for life's precious moments" 
  },
  { 
    id: "creativity", 
    text: "Enhance creativity", 
    icon: <PenSquare className="text-primary/80" size={20} />, 
    description: "Express yourself freely and nurture your creative spirit" 
  }
];

export default function GoalSetting() {
  const { data, updateData, setStep } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState(data.goal || "");

  const handleContinue = () => {
    updateData({ goal: selectedGoal });
    setStep(4);
  };

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
            <div key={option.id} className="space-y-3">
              <Label
                htmlFor={option.id}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Card className={`w-full cursor-pointer transition-all duration-200 ${
                  selectedGoal === option.id ? 'border-primary bg-primary/5' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span className="font-medium">{option.text}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-center pt-6">
          <Button
            onClick={handleContinue}
            disabled={!selectedGoal}
            className="w-full sm:w-auto px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Continue your journey
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
