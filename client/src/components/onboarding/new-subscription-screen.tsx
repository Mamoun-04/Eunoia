
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpenText, Check, StarIcon } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

interface SubscriptionScreenProps {
  onNext: () => void;
}

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { updateData } = useOnboarding();
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'paid'>('paid');

  const handleStripeRedirect = () => {
    const stripeParams = {
      priceId: isAnnual ? 'price_annual' : 'price_monthly',
      mode: 'subscription',
      trialDays: selectedPlan === 'trial' ? 7 : 0
    };
    
    updateData({ 
      subscriptionPlan: 'premium',
      billingPeriod: isAnnual ? 'yearly' : 'monthly',
      paymentRedirect: JSON.stringify(stripeParams)
    });
    
    onNext();
  };

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-blue-50/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mx-auto text-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-12"
        >
          <div className="inline-flex p-2 mb-6 bg-blue-50 rounded-2xl">
            <Sparkles className="h-8 w-8 text-[#0000CC]" />
          </div>
          <h2 className="text-4xl font-serif font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#0000CC] to-blue-600">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Start your mindful journaling journey with Eunoia today
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={isAnnual ? 'text-gray-500' : 'text-[#0000CC] font-medium'}>Monthly</span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="data-[state=checked]:bg-[#0000CC]"
          />
          <span className={isAnnual ? 'text-[#0000CC] font-medium' : 'text-gray-500'}>
            Annually <span className="text-green-600 text-sm">(Save 16%)</span>
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02, translateY: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer bg-white ${
              selectedPlan === 'trial' 
                ? 'border-[#0000CC] shadow-lg shadow-blue-100' 
                : 'border-gray-100'
            }`}
            onClick={() => setSelectedPlan('trial')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">7-Day Trial</h3>
                <BookOpenText className="h-6 w-6 text-[#0000CC]" />
              </div>
              <div className="text-3xl font-bold mb-4">$0</div>
              <ul className="space-y-3 text-left">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#0000CC]" />
                  <span>Full access for 7 days</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#0000CC]" />
                  <span>Auto-renews at $4.99/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#0000CC]" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, translateY: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer bg-white ${
              selectedPlan === 'paid'
                ? 'border-[#0000CC] shadow-lg shadow-blue-100'
                : 'border-gray-100'
            }`}
            onClick={() => setSelectedPlan('paid')}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">Full Access</h3>
                <Sparkles className="h-6 w-6 text-[#0000CC]" />
              </div>
              <div className="text-3xl font-bold mb-4">
                ${isAnnual ? '49.99/year' : '4.99/month'}
              </div>
              <ul className="space-y-3 text-left">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#0000CC]" />
                  <span>Unlimited journaling</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#0000CC]" />
                  <span>Advanced AI features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#0000CC]" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            className="w-full sm:w-auto px-8 py-6 text-lg bg-[#0000CC] hover:bg-[#0000AA] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleStripeRedirect}
          >
            {selectedPlan === 'trial' ? 'Start Free Trial' : 'Continue to Payment'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
