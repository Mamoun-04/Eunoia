
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, BookOpenText, Check, Calendar } from 'lucide-react';
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
    // This will be replaced with actual Stripe redirect
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
    <div className="min-h-[calc(100vh-90px)] flex flex-col items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <div className="flex justify-center mb-6">
          <Sparkles className="h-16 w-16 text-[#0000CC]" />
        </div>
        <h2 className="text-3xl font-serif font-medium mb-3 text-[#0000CC]">Choose Your Plan</h2>
        <p className="text-lg mb-8 text-gray-600">
          Start your mindful journaling journey with Eunoia today!
        </p>

        <div className="flex items-center justify-center gap-4 mb-8">
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
          {/* Free Trial Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedPlan === 'trial' ? 'border-[#0000CC] bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedPlan('trial')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium">7-Day Free Trial</h3>
              <Calendar className="h-6 w-6 text-[#0000CC]" />
            </div>
            <div className="text-2xl font-bold mb-4">$0</div>
            <ul className="space-y-3 text-left mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#0000CC]" />
                <span>Full access for 7 days</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#0000CC]" />
                <span>No charge for 7 days</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#0000CC]" />
                <span>Cancel anytime</span>
              </li>
            </ul>
          </motion.div>

          {/* Premium Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedPlan === 'paid' ? 'border-[#0000CC] bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedPlan('paid')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium">Premium</h3>
              <Sparkles className="h-6 w-6 text-[#0000CC]" />
            </div>
            <div className="text-2xl font-bold mb-4">
              ${isAnnual ? '49.99/year' : '4.99/month'}
            </div>
            <ul className="space-y-3 text-left mb-6">
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
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#0000CC]" />
                <span>All future features</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <Button 
          className="w-full sm:w-auto px-8 py-4 text-lg bg-[#0000CC] hover:bg-[#0000AA] text-white"
          onClick={handleStripeRedirect}
        >
          {selectedPlan === 'trial' ? 'Start Free Trial' : 'Continue to Payment'}
        </Button>
      </motion.div>
    </div>
  );
}
