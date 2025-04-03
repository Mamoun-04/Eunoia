
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SubscriptionScreenProps {
  onNext: () => void;
}

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { updateData } = useOnboarding();

  const handleNext = () => {
    updateData({ subscriptionPlan: 'free' });
    onNext();
  };

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg mx-auto"
      >
        <div className="flex justify-center mb-6">
          <Sparkles className="h-16 w-16 text-amber-500" />
        </div>
        <h2 className="text-3xl font-serif font-medium mb-3 bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">Welcome to Eunoia!</h2>
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
          Start your mindful journaling journey today!
        </p>
        <Button 
          className="w-full sm:w-auto px-6 py-4 text-lg bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
          onClick={handleNext}
        >
          Start Your Journey
        </Button>
      </motion.div>
    </div>
  );
}
