import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { HomeIcon } from 'lucide-react';
import { useLocation } from 'wouter';

interface SubscriptionSuccessScreenProps {
  onContinue?: () => void;
}

export default function SubscriptionSuccessScreen({ onContinue }: SubscriptionSuccessScreenProps) {
  const [, setLocation] = useLocation();

  const handleContinueClick = () => {
    if (onContinue) {
      onContinue();
    } else {
      setLocation('/home');
    }
  };

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col items-center justify-center px-6 py-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-md"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-4">Welcome to Premium!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Your subscription is active. Enjoy your journaling journey with enhanced features and unlimited capabilities.
        </p>
        <Button 
          onClick={handleContinueClick}
          className="px-8 py-6 text-lg"
          size="lg"
        >
          <HomeIcon className="mr-2 h-5 w-5" />
          Continue to Home
        </Button>
      </motion.div>
    </div>
  );
}