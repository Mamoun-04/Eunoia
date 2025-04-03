
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, BookOpenText, Check } from 'lucide-react';
import { useState } from 'react';

interface SubscriptionScreenProps {
  onNext: () => void;
}

export default function NewSubscriptionScreen({ onNext }: SubscriptionScreenProps) {
  const { updateData } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('premium');

  const handleNext = () => {
    updateData({ 
      subscriptionPlan: selectedPlan,
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
        className="text-center max-w-3xl mx-auto"
      >
        <div className="flex justify-center mb-6">
          <Sparkles className="h-16 w-16 text-[#0000CC]" />
        </div>
        <h2 className="text-3xl font-serif font-medium mb-3 text-[#0000CC]">Choose Your Journey</h2>
        <p className="text-lg mb-8 text-gray-600">
          Start your mindful journaling journey with Eunoia today!
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Trial Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedPlan === 'free' ? 'border-[#0000CC] bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedPlan('free')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium">Free Trial</h3>
              <BookOpenText className="h-6 w-6 text-[#0000CC]" />
            </div>
            <div className="text-2xl font-bold mb-4">$0</div>
            <ul className="space-y-3 text-left mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#0000CC]" />
                <span>14-day trial period</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#0000CC]" />
                <span>Basic journaling features</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#0000CC]" />
                <span>Limited AI assistance</span>
              </li>
            </ul>
          </motion.div>

          {/* Premium Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedPlan === 'premium' ? 'border-[#0000CC] bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedPlan('premium')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium">Premium</h3>
              <Sparkles className="h-6 w-6 text-[#0000CC]" />
            </div>
            <div className="text-2xl font-bold mb-4">$9.99/month</div>
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
          onClick={handleNext}
        >
          {selectedPlan === 'free' ? 'Start Free Trial' : 'Continue to Payment'}
        </Button>
      </motion.div>
    </div>
  );
}
