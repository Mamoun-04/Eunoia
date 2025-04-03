import { useOnboarding } from '@/hooks/use-onboarding';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface SubscriptionScreenProps {
  onNext: () => void;
}

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { updateData } = useOnboarding();

  useEffect(() => {
    // Load Stripe.js
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSkip = () => {
    updateData({ subscriptionPlan: 'free' });
    onNext();
  };

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-4xl mx-auto"
      >
        <stripe-pricing-table 
          pricing-table-id="prctbl_1R9saQFYtWG5sSMUmvLeSfXm"
          publishable-key="pk_test_51QkZILFYtWG5sSMULAz0VF4WmPiRbYdcXGFw44KYbXIRHlle8KKItAlGjn0SW8qzh53nd8JaSgEETqCl5bBqifQv00h3uKBhyT"
        ></stripe-pricing-table>

        <div className="mt-4">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Start with Free Plan
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-8 max-w-lg mx-auto">
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          You can cancel your subscription anytime from your account settings.
        </p>
      </motion.div>
    </div>
  );
}