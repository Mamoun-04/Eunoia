import { useState } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ArrowRight, Calendar, Clock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

// Price IDs come from environment variables
const MONTHLY_PRICE_ID = import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID;
const ANNUAL_PRICE_ID = import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID;

interface SubscriptionScreenProps {
  onNext: () => void;
}

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { updateData } = useOnboarding();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSkip = () => {
    updateData({ subscriptionPlan: 'free' });
    onNext();
  };

  const handleSubscribe = async (priceId: string, planType: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to subscribe",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(priceId);

      // Initialize Stripe
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      if (!stripe) throw new Error("Failed to load Stripe");

      // Create checkout session on server
      const response = await apiRequest(
        'POST',
        '/api/create-checkout-session',
        {
          priceId,
          userId: user.id,
          planType
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const session = await response.json();

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to redirect to checkout');
      }

    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to process subscription",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <div className="flex justify-center mb-4">
          <Sparkles className="h-16 w-16 text-amber-500" />
        </div>
        <h2 className="text-3xl font-serif font-medium mb-3 bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
          Unlock Premium Features
        </h2>
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
          Enhance your journaling experience with premium features and take your mindfulness journey to the next level.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
          {/* Monthly Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-md p-6 flex flex-col"
          >
            <div className="text-left mb-6">
              <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Monthly Premium
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$4.99</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Flexible plan with all premium features
              </p>
            </div>

            <ul className="space-y-3 text-sm text-left mb-6 flex-grow">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Unlimited daily entries</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Extended entry length</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Upload images with your entries</span>
              </li>
            </ul>

            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => handleSubscribe(MONTHLY_PRICE_ID, 'monthly')}
              disabled={isLoading !== null}
            >
              {isLoading === MONTHLY_PRICE_ID ? 'Processing...' : 'Subscribe Monthly'}
            </Button>
          </motion.div>

          {/* Annual Plan - Best Value */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative overflow-hidden rounded-xl border-2 border-amber-500 bg-white dark:bg-gray-900 shadow-lg p-6 flex flex-col"
            whileHover={{ y: -5 }}
          >
            {/* Best Value Badge */}
            <div className="absolute -right-12 top-7 bg-amber-500 text-white text-xs font-bold py-1 px-12 transform rotate-45">
              BEST VALUE
            </div>

            <div className="text-left mb-6">
              <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                Annual Premium
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$49.99</span>
                <span className="text-gray-500 dark:text-gray-400">/year</span>
              </div>
              <p className="text-sm text-green-600 font-semibold mt-1">
                Save $9.89 compared to monthly
              </p>
            </div>

            <ul className="space-y-3 text-sm text-left mb-6 flex-grow">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Unlimited daily entries</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Extended entry length</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Upload images with your entries</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>

            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-lg relative overflow-hidden group"
              onClick={() => handleSubscribe(ANNUAL_PRICE_ID, 'annual')}
              disabled={isLoading !== null}
            >
              <span className="relative z-10">
                {isLoading === ANNUAL_PRICE_ID ? 'Processing...' : 'Subscribe Annually'}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </motion.div>
        </div>

        <div className="mt-4">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isLoading !== null}
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