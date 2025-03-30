import { useState } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, Calendar, Star, Brain, Lightbulb, Compass, ArrowRight, PenLine } from 'lucide-react';

interface BenefitsGoalsScreenProps {
  onNext: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const goalOptions = [
  {
    id: 'self-reflection',
    label: 'Self-Reflection',
    description: 'Understand my thoughts and feelings better',
    icon: <Brain className="h-5 w-5 text-[#0000CC]" />
  },
  {
    id: 'gratitude',
    label: 'Gratitude Practice',
    description: 'Develop a habit of appreciating the good in my life',
    icon: <Heart className="h-5 w-5 text-[#0000CC]" />
  },
  {
    id: 'stress-reduction',
    label: 'Stress Reduction',
    description: 'Use journaling to reduce anxiety and manage stress',
    icon: <Star className="h-5 w-5 text-[#0000CC]" />
  },
  {
    id: 'personal-growth',
    label: 'Personal Growth',
    description: 'Track my development and set personal goals',
    icon: <Compass className="h-5 w-5 text-[#0000CC]" />
  },
  {
    id: 'creativity',
    label: 'Creative Expression',
    description: 'Use writing as a creative outlet for my thoughts',
    icon: <Lightbulb className="h-5 w-5 text-[#0000CC]" />
  },
  {
    id: 'custom',
    label: 'Something Else',
    description: 'I have a different goal in mind',
    icon: <PenLine className="h-5 w-5 text-[#0000CC]" />
  }
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily', description: 'Build a consistent daily habit' },
  { value: 'several-times-week', label: 'Several times a week', description: 'Find a flexible routine that works for you' },
  { value: 'weekly', label: 'Weekly', description: 'Reflect on your week at your own pace' },
  { value: 'occasionally', label: 'Occasionally', description: 'Journal whenever inspiration strikes' }
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
      customGoal: showCustomInput ? customGoal : undefined,
      journalingFrequency
    });
    
    onNext();
  };

  const isNextDisabled = selectedGoals.length === 0 || (showCustomInput && customGoal.trim().length === 0);

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col px-6 py-12 mx-auto">
      <div className="w-full max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-serif font-medium mb-3">Set Your Journaling Goals</h2>
          <p className="text-gray-600 text-lg">
            What are you hoping to achieve with your journaling practice?
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-xl font-medium mb-3 flex items-center">
              <Star className="h-5 w-5 mr-2 text-[#0000CC]" />
              Select your journaling goals
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalOptions.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`
                    flex flex-col rounded-xl border border-gray-200 overflow-hidden transition-all duration-300
                    ${selectedGoals.includes(goal.id) ? 
                      'bg-primary/5 border-primary shadow-md' : 
                      'bg-white hover:border-primary/30 hover:shadow-sm'}
                  `}
                >
                  <div 
                    className={`cursor-pointer flex flex-col h-full`}
                    onClick={() => handleGoalToggle(goal.id)}
                  >
                    <div className="flex items-center p-4 border-b">
                      <div className="mr-3">
                        {goal.icon}
                      </div>
                      <Label
                        htmlFor={goal.id}
                        className="font-medium text-base cursor-pointer flex-grow"
                      >
                        {goal.label}
                      </Label>
                      <Checkbox
                        id={goal.id}
                        checked={selectedGoals.includes(goal.id)}
                        onCheckedChange={() => handleGoalToggle(goal.id)}
                        className="mr-1"
                      />
                    </div>
                    
                    <div className="p-4 text-sm text-gray-600 flex-grow">
                      {goal.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {showCustomInput && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="bg-blue-50 p-5 rounded-xl space-y-3 border border-blue-100"
              >
                <Label htmlFor="custom-goal" className="font-medium">
                  What's your specific journaling goal?
                </Label>
                <Input
                  id="custom-goal"
                  placeholder="E.g., Tracking my fitness journey, processing difficult emotions..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="bg-white"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-xl font-medium mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-[#0000CC]" />
              How often do you plan to journal?
            </h3>
            
            <RadioGroup value={journalingFrequency} onValueChange={setJournalingFrequency}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {frequencyOptions.map((option, index) => (
                  <motion.div
                    key={option.value}
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`
                      border rounded-xl overflow-hidden
                      ${journalingFrequency === option.value ? 
                        'bg-primary/5 border-primary shadow-md' : 
                        'bg-white hover:border-primary/30 hover:shadow-sm'}
                    `}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setJournalingFrequency(option.value)}
                    >
                      <div className="flex items-center mb-2">
                        <RadioGroupItem 
                          value={option.value} 
                          id={option.value}
                          className="mr-3"
                        />
                        <Label 
                          htmlFor={option.value}
                          className="font-medium cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">{option.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </RadioGroup>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 flex justify-center"
        >
          <Button 
            size="lg"
            onClick={handleNext}
            disabled={isNextDisabled}
            className="bg-[#0000CC] hover:bg-[#0000AA] text-white py-6 px-10 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}