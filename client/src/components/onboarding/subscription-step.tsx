
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const plans = {
  free: {
    name: 'Free',
    price: 0,
    topFeatures: [
      'Limited entries per day',
      'Limited guided journaling lessons',
      'Basic theme options'
    ],
    extraFeatures: [
      'Limited photo uploads',
      'Basic features only',
      'No achievement tracking'
    ]
  },
  premium: {
    name: 'Premium',
    monthlyPrice: 3.99,
    yearlyPrice: 39.99,
    topFeatures: [
      'Unlimited journal entries',
      'Unlimited guided journaling lessons',
      'Full theme customization'
    ],
    extraFeatures: [
      'Unlimited photo uploads',
      'Full achievement tracking',
      'Unlimited AI assistant access',
      'Priority support'
    ]
  }
};

const faqs = [
  {
    question: "Is Premium really worth it?",
    answer: "Most of our users think so — in fact, 9 out of 10 people go Premium within their first week."
  },
  {
    question: "Can I change my plan later?",
    answer: "Absolutely! You can upgrade or downgrade anytime. Your journal entries are always safe."
  }
];

export default function SubscriptionStep() {
  const { data, updateData, setStep } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState(data.subscriptionPlan || 'free');
  const [isYearly, setIsYearly] = useState(false);
  const [showMoreFeatures, setShowMoreFeatures] = useState({ free: false, premium: false });

  const handleContinue = () => {
    updateData({ subscriptionPlan: selectedPlan });
    setStep(6);
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold text-center mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground text-center mb-8">Select the plan that best fits your journaling journey</p>

        {/* Premium Toggle */}
        {selectedPlan === 'premium' && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={!isYearly ? 'font-medium' : 'text-muted-foreground'}>Monthly</span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={isYearly ? 'font-medium' : 'text-muted-foreground'}>
              Yearly <span className="text-sm text-primary">(Save 33%)</span>
            </span>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card 
            className={`p-6 cursor-pointer transition-all ${
              selectedPlan === 'free' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedPlan('free')}
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold">{plans.free.name}</h3>
              <div className="text-3xl font-bold mt-2">Free</div>
            </div>

            <ul className="space-y-3 mb-4">
              {plans.free.topFeatures.map(feature => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Premium Plan */}
          <Card 
            className={`p-6 cursor-pointer transition-all relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 ${
              selectedPlan === 'premium' ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
            }`}
            onClick={() => setSelectedPlan('premium')}
          >
            <div className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-medium shadow-sm">
              Most Popular
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">{plans.premium.name}</h3>
              <div className="text-4xl font-bold mt-3 flex items-baseline">
                ${isYearly ? '2.92' : '3.99'}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  /month
                </span>
              </div>
              {isYearly && (
                <div className="mt-2">
                  <div className="text-sm text-muted-foreground">
                    Billed ${plans.premium.yearlyPrice}/year
                  </div>
                  <div className="text-sm text-primary font-medium mt-1">
                    Save ${((3.99 * 12) - 34.99).toFixed(2)} per year
                  </div>
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-4">
              {plans.premium.topFeatures.map(feature => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreFeatures(prev => ({ ...prev, premium: !prev.premium }));
              }}
            >
              {showMoreFeatures.premium ? 'Show less' : 'Show more features'}
              {showMoreFeatures.premium ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showMoreFeatures.premium && (
              <ul className="space-y-3 mt-4">
                {plans.premium.extraFeatures.map(feature => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* FAQs */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 border-t mt-auto">
        <div className="max-w-md mx-auto px-4">
          <Button
            size="lg"
            className="w-full"
            onClick={handleContinue}
          >
            Continue with {selectedPlan === 'free' ? 'Free Plan' : `Premium ${isYearly ? 'Yearly' : 'Monthly'}`}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            {selectedPlan === 'free' ? 'You can upgrade anytime' : 'Cancel anytime. No questions asked.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
