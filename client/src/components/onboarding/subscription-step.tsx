import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PlanFeature = {
  name: string;
  included: {
    free: boolean;
    monthly: boolean; 
    yearly: boolean;
  };
};

const features: PlanFeature[] = [
  { 
    name: "Unlimited journal entries", 
    included: { free: true, monthly: true, yearly: true } 
  },
  { 
    name: "Basic mood tracking", 
    included: { free: true, monthly: true, yearly: true } 
  },
  { 
    name: "Daily mindfulness reminders", 
    included: { free: true, monthly: true, yearly: true } 
  },
  { 
    name: "Access to guided journaling prompts", 
    included: { free: false, monthly: true, yearly: true } 
  },
  { 
    name: "Advanced mood analytics", 
    included: { free: false, monthly: true, yearly: true } 
  },
  { 
    name: "Unlimited AI journal assistant", 
    included: { free: false, monthly: true, yearly: true } 
  },
  { 
    name: "Journal entry themes", 
    included: { free: false, monthly: true, yearly: true } 
  },
  { 
    name: "Priority support", 
    included: { free: false, monthly: false, yearly: true } 
  },
  { 
    name: "Advanced journaling insights", 
    included: { free: false, monthly: false, yearly: true } 
  },
  { 
    name: "Early access to new features", 
    included: { free: false, monthly: false, yearly: true } 
  },
];

export default function SubscriptionStep() {
  const { data, updateData, setStep } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'yearly'>(data.subscriptionPlan || 'free');

  const handleContinue = () => {
    updateData({ subscriptionPlan: selectedPlan });
    setStep(6);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4"
    >
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Choose Your Plan</CardTitle>
          <CardDescription>Select the best plan for your journaling needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div 
              className={`border rounded-xl p-5 cursor-pointer transition-all ${
                selectedPlan === 'free' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              onClick={() => setSelectedPlan('free')}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="text-2xl font-bold mt-2">$0</p>
                <p className="text-sm text-muted-foreground">Forever</p>
              </div>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li 
                    key={index} 
                    className={`flex items-center ${
                      !feature.included.free ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {feature.included.free ? (
                      <Check className="h-4 w-4 mr-2 text-primary" />
                    ) : (
                      <span className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-sm">{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Monthly Plan */}
            <div 
              className={`border rounded-xl p-5 cursor-pointer transition-all ${
                selectedPlan === 'monthly' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold">Premium</h3>
                <Badge variant="outline" className="mb-1">Popular</Badge>
                <p className="text-2xl font-bold mt-2">$4.99</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li 
                    key={index} 
                    className={`flex items-center ${
                      !feature.included.monthly ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {feature.included.monthly ? (
                      <Check className="h-4 w-4 mr-2 text-primary" />
                    ) : (
                      <span className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-sm">{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Yearly Plan */}
            <div 
              className={`border rounded-xl p-5 cursor-pointer transition-all ${
                selectedPlan === 'yearly' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              onClick={() => setSelectedPlan('yearly')}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold">Premium Plus</h3>
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-300 text-white border-none mb-1">
                  <Sparkles className="h-3 w-3 mr-1" /> Best Value
                </Badge>
                <p className="text-2xl font-bold mt-2">$39.99</p>
                <p className="text-sm text-muted-foreground">per year</p>
                <p className="text-xs mt-1 text-emerald-600 font-medium">Save $19.89</p>
              </div>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li 
                    key={index} 
                    className={`flex items-center ${
                      !feature.included.yearly ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {feature.included.yearly ? (
                      <Check className="h-4 w-4 mr-2 text-primary" />
                    ) : (
                      <span className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-sm">{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <Button 
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              Continue with {selectedPlan === 'free' ? 'Free Plan' : selectedPlan === 'monthly' ? 'Monthly Premium' : 'Yearly Premium Plus'}
            </Button>
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            You can change your plan anytime after registration. No credit card required for the free plan.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}