import { useState } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BenefitsGoalsScreenProps {
  onNext: () => void;
}

const goalOptions = [
  {
    id: 'self-reflection',
    label: 'Self-Reflection',
    description: 'Understand my thoughts and feelings better'
  },
  {
    id: 'gratitude',
    label: 'Gratitude Practice',
    description: 'Develop a habit of appreciating the good in my life'
  },
  {
    id: 'stress-reduction',
    label: 'Stress Reduction',
    description: 'Use journaling to reduce anxiety and manage stress'
  },
  {
    id: 'personal-growth',
    label: 'Personal Growth',
    description: 'Track my development and set personal goals'
  },
  {
    id: 'creativity',
    label: 'Creative Expression',
    description: 'Use writing as a creative outlet for my thoughts'
  },
  {
    id: 'custom',
    label: 'Something Else',
    description: 'I have a different goal in mind'
  }
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'several-times-week', label: 'Several times a week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'occasionally', label: 'Occasionally' }
];

export default function BenefitsGoalsScreen({ onNext }: BenefitsGoalsScreenProps) {
  const { data, updateData } = useOnboarding();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(data.selectedGoals || []);
  const [customGoal, setCustomGoal] = useState<string>('');
  const [journalingFrequency, setJournalingFrequency] = useState<string>(data.journalingFrequency || 'daily');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(selectedGoals.includes('custom'));

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        // If removing the 'custom' goal, hide the custom input
        if (goalId === 'custom') {
          setShowCustomInput(false);
        }
        return prev.filter(id => id !== goalId);
      } else {
        // If adding the 'custom' goal, show the custom input
        if (goalId === 'custom') {
          setShowCustomInput(true);
        }
        return [...prev, goalId];
      }
    });
  };

  const handleNext = () => {
    // Update the onboarding context with selected goals
    updateData({
      selectedGoals,
      journalingFrequency
    });
    
    onNext();
  };

  const isNextDisabled = selectedGoals.length === 0 || (showCustomInput && customGoal.trim().length === 0);

  return (
    <div className="h-full flex flex-col px-6 py-8 max-w-lg mx-auto overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <h2 className="text-2xl font-medium mb-2">Journaling Benefits & Goals</h2>
        <p className="text-gray-600">
          What are you hoping to achieve with your journaling practice?
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6 mb-6"
      >
        <div>
          <h3 className="text-lg font-medium mb-3">Select your journaling goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goalOptions.map((goal) => (
              <div
                key={goal.id}
                className={`flex items-start space-x-3 p-3 rounded-md border transition-colors ${
                  selectedGoals.includes(goal.id) ? 'bg-primary/5 border-primary' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <Checkbox
                  id={goal.id}
                  checked={selectedGoals.includes(goal.id)}
                  onCheckedChange={() => handleGoalToggle(goal.id)}
                />
                <div>
                  <Label
                    htmlFor={goal.id}
                    className="font-medium text-base cursor-pointer"
                  >
                    {goal.label}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="custom-goal">What's your specific journaling goal?</Label>
            <Input
              id="custom-goal"
              placeholder="E.g., Tracking my fitness journey"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
            />
          </motion.div>
        )}

        <div className="space-y-3">
          <h3 className="text-lg font-medium">How often do you plan to journal?</h3>
          <RadioGroup
            value={journalingFrequency}
            onValueChange={setJournalingFrequency}
            className="space-y-2"
          >
            {frequencyOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2"
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-auto flex justify-center"
      >
        <Button 
          size="lg"
          onClick={handleNext}
          disabled={isNextDisabled}
          className="w-full max-w-xs"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}