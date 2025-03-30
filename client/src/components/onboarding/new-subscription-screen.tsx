import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface SubscriptionScreenProps {
  onNext: () => void;
}

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { updateData } = useOnboarding();

  const handleNext = () => {
    updateData({ 
      subscriptionPlan: 'premium',
      billingPeriod: 'yearly'
    });
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
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-serif font-medium mb-3">Welcome to Eunoia Premium!</h2>
        <p className="text-gray-600 text-lg mb-8">
          All premium features are automatically enabled for your account. Enjoy the full Eunoia experience!
        </p>
        <Button 
          className="w-full sm:w-auto px-6 py-4 text-lg"
          onClick={handleNext}
        >
          Start Your Journey
        </Button>
      </motion.div>
    </div>
  );
}