
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';

interface SubscriptionScreenProps {
  onNext: () => void;
}

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { updateData } = useOnboarding();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    updateData({ 
      subscriptionPlan: 'premium',
      billingPeriod: plan
    });
    // In a real implementation, this would redirect to payment
    onNext();
  };

  const handleFreeTrial = () => {
    updateData({
      subscriptionPlan: 'trial',
      billingPeriod: 'monthly',
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
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
          <Sparkles className="h-16 w-16 text-amber-500" />
        </div>
        <h2 className="text-3xl font-serif font-medium mb-3">Choose Your Plan</h2>
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
          Start your mindful journaling journey with premium features
        </p>

        <div className="bg-card border rounded-xl p-6 mb-8">
          <RadioGroup
            value={plan}
            onValueChange={(value: 'monthly' | 'yearly') => setPlan(value)}
            className="gap-4"
          >
            <div className="flex items-center space-x-4 border rounded-lg p-4">
              <RadioGroupItem value="yearly" id="yearly" />
              <label htmlFor="yearly" className="flex-1 cursor-pointer">
                <div className="font-medium">Yearly Plan</div>
                <div className="text-sm text-muted-foreground">$79/year (Save 33%)</div>
              </label>
              <div className="text-amber-500 text-sm font-medium">Best Value</div>
            </div>
            <div className="flex items-center space-x-4 border rounded-lg p-4">
              <RadioGroupItem value="monthly" id="monthly" />
              <label htmlFor="monthly" className="flex-1 cursor-pointer">
                <div className="font-medium">Monthly Plan</div>
                <div className="text-sm text-muted-foreground">$9.99/month</div>
              </label>
            </div>
          </RadioGroup>

          <div className="mt-6 space-y-3 text-left">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-amber-500" />
              <span>Unlimited journal entries</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-amber-500" />
              <span>AI-powered insights</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-amber-500" />
              <span>Premium themes and features</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full py-6 text-lg bg-gradient-to-r from-amber-500 to-amber-700"
            onClick={handleSubscribe}
            disabled={loading}
          >
            Subscribe Now
          </Button>
          <Button 
            variant="outline"
            className="w-full py-6 text-lg"
            onClick={handleFreeTrial}
            disabled={loading}
          >
            Start 14-Day Free Trial
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
