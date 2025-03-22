import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type PlanFeature = {
  name: string;
  included: {
    free: boolean;
    monthly: boolean; 
    yearly: boolean;
  };
};

export default function SubscriptionStep() {
  const { data, updateData, setStep } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'yearly'>(
    data.subscriptionPlan || 'free'
  );

  const planFeatures: PlanFeature[] = [
    { 
      name: 'Basic journaling', 
      included: { free: true, monthly: true, yearly: true } 
    },
    { 
      name: 'Mood tracking', 
      included: { free: true, monthly: true, yearly: true } 
    },
    { 
      name: 'Daily reminders', 
      included: { free: true, monthly: true, yearly: true } 
    },
    { 
      name: 'Unlimited entries', 
      included: { free: false, monthly: true, yearly: true } 
    },
    { 
      name: 'AI writing assistance', 
      included: { free: false, monthly: true, yearly: true } 
    },
    { 
      name: 'Advanced analytics', 
      included: { free: false, monthly: true, yearly: true } 
    },
    { 
      name: 'Guided journal prompts', 
      included: { free: false, monthly: true, yearly: true } 
    },
    { 
      name: 'Priority support', 
      included: { free: false, monthly: false, yearly: true } 
    },
  ];

  const handleContinue = () => {
    updateData({ subscriptionPlan: selectedPlan });
    setStep(6);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <h2 className="text-3xl font-serif font-bold mb-2 text-center">Unlock Your Mindful Journey</h2>
      <p className="text-center text-muted-foreground mb-8 max-w-md mx-auto">
        Choose the plan that's right for you. All plans include a 7-day free trial.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Free Plan */}
        <Card 
          className={`p-6 relative border-2 transition-all ${
            selectedPlan === 'free' ? 'border-primary' : 'border-muted'
          }`}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge variant="outline" className="bg-background">Free Plan</Badge>
          </div>
          <div className="pt-4 text-center mb-4">
            <h3 className="text-2xl font-bold">$0</h3>
            <p className="text-muted-foreground">Forever</p>
          </div>
          
          <ul className="space-y-2 mb-8">
            {planFeatures.map((feature, index) => (
              <li 
                key={index} 
                className={`flex items-center gap-2 ${
                  !feature.included.free ? 'text-muted-foreground' : ''
                }`}
              >
                {feature.included.free ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <span className="h-4 w-4 block flex-shrink-0"></span>
                )}
                <span className="text-sm">{feature.name}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            variant={selectedPlan === 'free' ? 'default' : 'outline'} 
            className="w-full"
            onClick={() => setSelectedPlan('free')}
          >
            {selectedPlan === 'free' ? 'Selected' : 'Select'}
          </Button>
        </Card>
        
        {/* Monthly Plan */}
        <Card 
          className={`p-6 relative border-2 transition-all ${
            selectedPlan === 'monthly' ? 'border-primary' : 'border-muted'
          }`}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge variant="outline" className="bg-background">Monthly Plan</Badge>
          </div>
          <div className="pt-4 text-center mb-4">
            <h3 className="text-2xl font-bold">$3.99</h3>
            <p className="text-muted-foreground">per month</p>
          </div>
          
          <ul className="space-y-2 mb-8">
            {planFeatures.map((feature, index) => (
              <li 
                key={index} 
                className={`flex items-center gap-2 ${
                  !feature.included.monthly ? 'text-muted-foreground' : ''
                }`}
              >
                {feature.included.monthly ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <span className="h-4 w-4 block flex-shrink-0"></span>
                )}
                <span className="text-sm">{feature.name}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            variant={selectedPlan === 'monthly' ? 'default' : 'outline'} 
            className="w-full"
            onClick={() => setSelectedPlan('monthly')}
          >
            {selectedPlan === 'monthly' ? 'Selected' : 'Select'}
          </Button>
        </Card>
        
        {/* Yearly Plan */}
        <Card 
          className={`p-6 relative border-2 transition-all ${
            selectedPlan === 'yearly' ? 'border-primary' : 'border-muted'
          }`}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
          </div>
          <div className="pt-4 text-center mb-4">
            <h3 className="text-2xl font-bold">$39.99</h3>
            <p className="text-muted-foreground">per year</p>
          </div>
          
          <ul className="space-y-2 mb-4">
            {planFeatures.map((feature, index) => (
              <li 
                key={index} 
                className={`flex items-center gap-2 ${
                  !feature.included.yearly ? 'text-muted-foreground' : ''
                }`}
              >
                {feature.included.yearly ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <span className="h-4 w-4 block flex-shrink-0"></span>
                )}
                <span className="text-sm">{feature.name}</span>
              </li>
            ))}
          </ul>
          
          <div className="text-center text-sm text-green-600 mb-4">
            Save 17% compared to monthly
          </div>
          
          <Button 
            variant={selectedPlan === 'yearly' ? 'default' : 'outline'} 
            className="w-full"
            onClick={() => setSelectedPlan('yearly')}
          >
            {selectedPlan === 'yearly' ? 'Selected' : 'Select'}
          </Button>
        </Card>
      </div>
      
      <div className="text-center">
        <Button onClick={handleContinue} size="lg">
          Continue
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          7-day free trial, cancel anytime. No credit card required.
        </p>
      </div>
    </motion.div>
  );
}