import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { Check, Heart } from 'lucide-react';

export default function InterestSelection() {
  const { data, updateData, setStep } = useOnboarding();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    data.interests || []
  );

  const interestOptions = [
    'Mindfulness',
    'Gratitude',
    'Healing',
    'Productivity',
    'Reflection',
    'Personal Growth',
    'Creativity',
    'Health & Wellness',
    'Emotional Intelligence',
    'Goal Setting',
    'Stress Management',
    'Self-Discovery'
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleContinue = () => {
    updateData({ interests: selectedInterests });
    setStep(5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-8 max-w-xl mx-auto shadow-sm"
    >
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Heart className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <h2 className="text-3xl font-serif font-bold mb-2 text-center">What interests you?</h2>
      <p className="text-center text-muted-foreground mb-8">
        Select topics you'd like to explore in your journaling practice
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {interestOptions.map((interest) => {
          const isSelected = selectedInterests.includes(interest);
          return (
            <Button
              key={interest}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              className={`h-auto py-3 px-4 rounded-full justify-between ${
                isSelected ? 'border-primary bg-primary' : 'border-input'
              }`}
              onClick={() => toggleInterest(interest)}
            >
              <span>{interest}</span>
              {isSelected && <Check className="h-4 w-4 ml-2" />}
            </Button>
          );
        })}
      </div>
      
      <Button 
        onClick={handleContinue} 
        className="w-full"
        disabled={selectedInterests.length === 0}
      >
        Continue
      </Button>
    </motion.div>
  );
}