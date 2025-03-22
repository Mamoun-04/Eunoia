import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Check, Target } from 'lucide-react';

type GoalOption = {
  id: string;
  text: string;
};

export default function GoalSetting() {
  const { data, updateData, setStep } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState<string>(data.goal || '');
  const [customGoal, setCustomGoal] = useState<string>(data.customGoal || '');

  const goalOptions: GoalOption[] = [
    { id: 'daily-5', text: 'Journal daily for 5 days' },
    { id: 'daily-7', text: 'Journal every day for 1 week' },
    { id: 'words-100', text: 'Write 100 words a day' },
    { id: 'custom', text: 'Set a custom goal' }
  ];

  const handleContinue = () => {
    updateData({
      goal: selectedGoal,
      customGoal: selectedGoal === 'custom' ? customGoal : undefined
    });
    setStep(4);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-8 max-w-lg mx-auto shadow-sm"
    >
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Target className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <h2 className="text-3xl font-serif font-bold mb-2 text-center">What's your journaling goal?</h2>
      <p className="text-center text-muted-foreground mb-8">
        Setting a clear goal will help you build a consistent journaling practice
      </p>
      
      <RadioGroup
        value={selectedGoal}
        onValueChange={setSelectedGoal}
        className="space-y-3 mb-8"
      >
        {goalOptions.map((option) => (
          <div
            key={option.id}
            className={`border rounded-lg p-4 transition-all ${
              selectedGoal === option.id
                ? 'border-primary bg-primary/5'
                : 'border-border'
            }`}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value={option.id} id={option.id} className="data-[state=checked]:border-primary" />
              <Label
                htmlFor={option.id}
                className="flex-1 cursor-pointer font-medium"
              >
                {option.text}
              </Label>
              {selectedGoal === option.id && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
      
      {selectedGoal === 'custom' && (
        <div className="mb-8">
          <Label htmlFor="custom-goal">Your custom goal</Label>
          <Input
            id="custom-goal"
            placeholder="e.g., Journal for 15 minutes every morning"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
          />
        </div>
      )}
      
      <Button 
        onClick={handleContinue} 
        className="w-full"
        disabled={selectedGoal === 'custom' && !customGoal.trim()}
      >
        Continue
      </Button>
    </motion.div>
  );
}