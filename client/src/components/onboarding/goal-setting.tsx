import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";

type GoalOption = {
  id: string;
  text: string;
};

const goalOptions: GoalOption[] = [
  { id: "self-reflection", text: "Engage in deeper self-reflection" },
  { id: "stress-reduction", text: "Reduce stress and anxiety" },
  { id: "gratitude", text: "Practice more gratitude" },
  { id: "creativity", text: "Enhance creativity and self-expression" },
  { id: "emotional-awareness", text: "Develop better emotional awareness" },
  { id: "growth", text: "Track personal growth and progress" },
  { id: "custom", text: "Something else (specify below)" }
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4"
    >
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Set Your Journaling Goal</CardTitle>
          <CardDescription>What are you hoping to achieve with Eunoia?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup 
            value={selectedGoal} 
            onValueChange={setSelectedGoal}
            className="space-y-3"
          >
            {goalOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label 
                  htmlFor={option.id} 
                  className="cursor-pointer flex-1 text-base py-1"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {isCustomSelected && (
            <div className="space-y-2">
              <Label htmlFor="custom-goal">Your Custom Goal</Label>
              <Input
                id="custom-goal"
                placeholder="Please specify your journaling goal"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
              />
            </div>
          )}

          <div className="pt-4 flex justify-center">
            <Button 
              disabled={!isValid} 
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}