
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOnboarding } from "@/hooks/use-onboarding";

const goals = [
  { id: "self-reflection", text: "Engage in deeper self-reflection", emoji: "🧠", description: "Discover insights about yourself through thoughtful journaling" },
  { id: "stress-reduction", text: "Reduce stress and anxiety", emoji: "💆", description: "Find calm and peace through regular writing practice" },
  { id: "gratitude", text: "Practice more gratitude", emoji: "🙏", description: "Cultivate appreciation for life's precious moments" },
  { id: "creativity", text: "Enhance creativity and self-expression", emoji: "🎨", description: "Express yourself freely and nurture your creative spirit" },
  { id: "emotional-awareness", text: "Develop better emotional awareness", emoji: "❤️", description: "Understand and process your feelings more deeply" },
  { id: "growth", text: "Track personal growth and progress", emoji: "🌱", description: "Document your journey of self-improvement" },
  { id: "custom", text: "Something else", emoji: "✨", description: "Tell us what matters most to you" }
];

export default function GoalSelection() {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full px-4 py-8 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <div className="text-center space-y-3">
          <span className="text-sm font-medium text-primary/80">Step 2 of 5</span>
          <h1 className="text-3xl font-serif text-primary">What matters to you right now?</h1>
          <p className="text-muted-foreground text-lg font-light">
            Choose what you'd like Eunoia to support you with in your journaling journey
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedGoal === goal.id 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedGoal(goal.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{goal.emoji}</span>
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">{goal.text}</h3>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedGoal === "custom" && (
        <div className="mb-8">
          <textarea
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder="Tell us what you'd like to achieve..."
            className="w-full p-4 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows={3}
          />
        </div>
      )}

      <div className="flex justify-center">
        <Button
          size="lg"
          className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={handleContinue}
          disabled={!selectedGoal || (selectedGoal === "custom" && !customGoal.trim())}
        >
          Continue your journey
        </Button>
      </div>
    </motion.div>
  );
}
