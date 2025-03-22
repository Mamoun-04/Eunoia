
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

const PRESET_GOALS = [
  "I want to journal daily for 5 days",
  "I want to journal every day for 1 week",
  "I want to write 100 words daily",
];

export function GoalStep({ onNext }: { onNext: (data: any) => void }) {
  const [selectedGoal, setSelectedGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
      <div className="text-center">
        <h2 className="text-3xl font-semibold mb-2">Set Your Goal</h2>
        <p className="text-muted-foreground">Build your habit, one day at a time.</p>
      </div>

      <div className="space-y-3">
        {PRESET_GOALS.map((goal) => (
          <Button
            key={goal}
            variant={selectedGoal === goal ? "default" : "outline"}
            className="w-full justify-start h-auto py-4 px-4"
            onClick={() => {
              setSelectedGoal(goal);
              setCustomGoal("");
            }}
          >
            {goal}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Or set a custom goal:</p>
        <Input
          placeholder="I want to..."
          value={customGoal}
          onChange={(e) => {
            setCustomGoal(e.target.value);
            setSelectedGoal("");
          }}
        />
      </div>

      <Button
        onClick={() => onNext({ goal: selectedGoal || customGoal })}
        disabled={!selectedGoal && !customGoal}
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
