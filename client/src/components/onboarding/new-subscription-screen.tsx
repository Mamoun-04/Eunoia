
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

interface SubscriptionScreenProps {
  onNext: () => void;
}

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY!);

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { updateData } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const plans = {
    monthly: {
      price: 4.99,
      period: 'month',
      savings: null,
      priceId: 'price_monthly' // Replace with your Stripe price ID
    },
    yearly: {
      price: 49.99,
      period: 'year',
      savings: '17%',
      priceId: 'price_yearly' // Replace with your Stripe price ID
    }
  };

  const handleSubscribe = async (priceId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          trialDays: 7
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeTrial = async () => {
    setIsLoading(true);
    try {
      // Start free trial with the monthly plan
      await handleSubscribe(plans.monthly.priceId);
      updateData({ subscriptionPlan: 'premium', billingPeriod: 'monthly' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <div className="flex justify-center mb-6">
          <Sparkles className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-serif font-medium mb-3">Choose Your Journey</h2>
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
          Start with a 7-day free trial, then continue with the plan that works best for you
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Monthly Plan */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border-2 cursor-pointer ${
              selectedPlan === 'monthly' ? 'border-primary' : 'border-gray-200'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <h3 className="text-xl font-medium mb-2">Monthly</h3>
            <div className="text-3xl font-bold mb-4">${plans.monthly.price}/mo</div>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                Full Access to All Features
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                Unlimited Journal Entries
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                AI-Powered Insights
              </li>
            </ul>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border-2 cursor-pointer ${
              selectedPlan === 'yearly' ? 'border-primary' : 'border-gray-200'
            }`}
            onClick={() => setSelectedPlan('yearly')}
          >
            <h3 className="text-xl font-medium mb-2">Yearly</h3>
            <div className="text-3xl font-bold mb-4">${plans.yearly.price}/yr</div>
            <div className="text-sm text-primary mb-4">Save {plans.yearly.savings}</div>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                Everything in Monthly
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                Priority Support
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                Early Access to New Features
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => handleSubscribe(plans[selectedPlan].priceId)}
            className="w-full sm:w-auto px-8 py-4 text-lg"
            disabled={isLoading}
          >
            Start 7-Day Free Trial
          </Button>
          <p className="text-sm text-gray-500">
            You'll be charged ${plans[selectedPlan].price} after your trial ends
          </p>
        </div>
      </motion.div>
    </div>
  );
}
