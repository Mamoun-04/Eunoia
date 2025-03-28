import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  Flower2, Heart, PenSquare, Leaf, Brain, Coffee, 
  Flame, Clock, Search, Sparkles, Target, 
  Lightbulb, Smile
} from "lucide-react";

const interestOptions = [
  { id: "mindfulness", label: "Mindfulness", icon: <Flower2 size={14} className="shrink-0" /> },
  { id: "gratitude", label: "Gratitude", icon: <Heart size={14} className="shrink-0" /> },
  { id: "creativity", label: "Creativity", icon: <PenSquare size={14} className="shrink-0" /> },
  { id: "personal-growth", label: "Personal Growth", icon: <Leaf size={14} className="shrink-0" /> },
  { id: "mental-health", label: "Mental Health", icon: <Brain size={14} className="shrink-0" /> },
  { id: "stress-management", label: "Stress Management", icon: <Coffee size={14} className="shrink-0" /> },
  { id: "motivation", label: "Motivation", icon: <Flame size={14} className="shrink-0" /> },
  { id: "productivity", label: "Productivity", icon: <Clock size={14} className="shrink-0" /> },
  { id: "self-awareness", label: "Self-Awareness", icon: <Search size={14} className="shrink-0" /> },
  { id: "meditation", label: "Meditation", icon: <Sparkles size={14} className="shrink-0" /> },
  { id: "emotional-intelligence", label: "Emotional Intelligence", icon: <Heart size={14} className="shrink-0" /> },
  { id: "goal-setting", label: "Goal Setting", icon: <Target size={14} className="shrink-0" /> },
  { id: "reflection", label: "Reflection", icon: <Lightbulb size={14} className="shrink-0" /> },
  { id: "positive-psychology", label: "Positive Psychology", icon: <Smile size={14} className="shrink-0" /> },
  { id: "self-compassion", label: "Self-Compassion", icon: <Heart size={14} className="shrink-0" /> },
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
    setStep(5); // Go to account creation
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 py-6"
    >
      <Card className="w-full max-w-3xl mx-auto shadow-lg overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-primary/10 opacity-70"></div>
        
        <motion.div 
          className="absolute inset-0 -z-10 opacity-70"
          animate={{ 
            background: [
              "linear-gradient(120deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.1) 50%, rgba(var(--primary-rgb), 0.05) 100%)",
              "linear-gradient(240deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.1) 50%, rgba(var(--primary-rgb), 0.05) 100%)",
              "linear-gradient(360deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.1) 50%, rgba(var(--primary-rgb), 0.05) 100%)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        <CardHeader className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Pick Your Interests</CardTitle>
            <CardDescription className="text-sm sm:text-base">Select at least 3 topics you'd like to explore in your journaling practice</CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="flex flex-wrap gap-2 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {interestOptions.map((interest, index) => (
              <motion.div
                key={interest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.02 }}
              >
                <Badge
                  variant={selectedInterests.includes(interest.id) ? "default" : "outline"}
                  className={`
                    text-sm sm:text-base py-1.5 sm:py-2 px-2 sm:px-3 cursor-pointer hover:bg-primary/90 transition-all
                    ${selectedInterests.includes(interest.id) ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"}
                  `}
                  onClick={() => toggleInterest(interest.id)}
                >
                  <span className="mr-1.5 flex items-center">{interest.icon}</span> {interest.label}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
        <CardFooter className="flex justify-center pt-4 pb-6">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              disabled={selectedInterests.length < 3} 
              onClick={handleContinue}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-md transition-all duration-200"
            >
              Continue ({selectedInterests.length}/3 selected)
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}