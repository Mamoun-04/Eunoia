import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const interestOptions = [
  { id: "mindfulness", label: "Mindfulness", emoji: "🧘" },
  { id: "gratitude", label: "Gratitude", emoji: "🙏" },
  { id: "creativity", label: "Creativity", emoji: "🎨" },
  { id: "personal-growth", label: "Personal Growth", emoji: "🌱" },
  { id: "mental-health", label: "Mental Health", emoji: "🧠" },
  { id: "stress-management", label: "Stress Management", emoji: "😌" },
  { id: "motivation", label: "Motivation", emoji: "🔥" },
  { id: "productivity", label: "Productivity", emoji: "⏱" },
  { id: "self-awareness", label: "Self-Awareness", emoji: "🔍" },
  { id: "meditation", label: "Meditation", emoji: "✨" },
  { id: "emotional-intelligence", label: "Emotional Intelligence", emoji: "❤️" },
  { id: "goal-setting", label: "Goal Setting", emoji: "🎯" },
  { id: "reflection", label: "Reflection", emoji: "💭" },
  { id: "positive-psychology", label: "Positive Psychology", emoji: "😊" },
  { id: "self-compassion", label: "Self-Compassion", emoji: "🤗" },
];

export default function InterestSelection() {
  const { data, updateData, setStep } = useOnboarding();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(data.interests || []);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(item => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleContinue = () => {
    updateData({ interests: selectedInterests });
    setStep(5);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4"
    >
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Pick Your Interests</CardTitle>
          <CardDescription>Select at least 3 topics you'd like to explore in your journaling practice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <Badge
                key={interest.id}
                variant={selectedInterests.includes(interest.id) ? "default" : "outline"}
                className={`
                  text-base py-2 px-3 cursor-pointer hover:bg-primary/90 transition-all
                  ${selectedInterests.includes(interest.id) ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"}
                `}
                onClick={() => toggleInterest(interest.id)}
              >
                <span className="mr-1">{interest.emoji}</span> {interest.label}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
          <Button 
            disabled={selectedInterests.length < 3} 
            onClick={handleContinue}
            className="w-full sm:w-auto"
          >
            Continue ({selectedInterests.length}/3 selected)
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}