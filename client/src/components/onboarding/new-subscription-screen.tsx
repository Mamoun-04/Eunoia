import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, Gift, Check } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-90px)] flex flex-col items-center justify-center px-6 py-8 bg-gradient-to-b from-background to-background/80">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg mx-auto space-y-8"
      >
        <div className="relative flex justify-center items-center w-full">
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-700/20 rounded-full blur"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <Sparkles className="h-16 w-16 text-amber-500 relative z-10" />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-medium bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
            Welcome to Eunoia Premium!
          </h2>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-lg font-medium text-amber-600 dark:text-amber-400">
              <Gift className="h-5 w-5" />
              <span>Early Access Program</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Get complete access to all premium features during our early access period. Experience the full power of mindful journaling – completely free!
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">
              Join now to lock in these premium benefits:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                Unlimited daily entries
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                AI-powered journaling assistant
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                Advanced insights and analytics
              </li>
            </ul>
          </div>
        </div>

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