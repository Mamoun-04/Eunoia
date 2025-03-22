
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const INTERESTS = [
  "Mindfulness",
  "Gratitude",
  "Healing",
  "Reflection",
  "Productivity",
  "Personal Growth",
  "Creativity",
  "Goals",
  "Relationships",
  "Mental Health",
];

export function InterestsStep({ onNext }: { onNext: (data: any) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelected(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
      <div className="text-center">
        <h2 className="text-3xl font-semibold mb-2">Choose Your Interests</h2>
        <p className="text-muted-foreground">Select the themes that resonate with you</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {INTERESTS.map((interest) => (
          <Button
            key={interest}
            variant={selected.includes(interest) ? "default" : "outline"}
            className="h-auto py-4"
            onClick={() => toggleInterest(interest)}
          >
            {interest}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => onNext({ interests: selected })}
        disabled={selected.length === 0}
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
