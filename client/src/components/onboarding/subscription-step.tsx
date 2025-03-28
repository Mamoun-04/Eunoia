import { useState } from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/hooks/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const plans = {
  free: {
    name: "Free",
    price: 0,
    topFeatures: [
      "Limited entries per day",
      "Limited guided journaling lessons",
      "Basic theme options",
    ],
    extraFeatures: [
      "Limited photo uploads",
      "Basic features only",
      "No achievement tracking",
    ],
  },
  premium: {
    name: "Premium",
    monthlyPrice: 4.99,
    yearlyPrice: 49.99,
    topFeatures: [
      "Unlimited journal entries",
      "Unlimited guided journaling lessons",
      "Full theme customization",
    ],
    extraFeatures: [
      "Unlimited photo uploads",
      "Full achievement tracking",
      "Unlimited AI assistant access",
      "Priority support",
    ],
  },
};

const faqs = [
  {
    question: "Is Premium really worth it?",
    answer:
      "Most of our users think so — in fact, more than 50% of users upgrade to Premium within their first week.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Absolutely! You can upgrade or downgrade anytime. Your journal entries are always safe.",
  },
];

export default function SubscriptionStep() {
  const { data, updateData, setStep } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>(
    data.subscriptionPlan === 'monthly' || data.subscriptionPlan === 'yearly' ? 'premium' : 'free',
  );
  const [isYearly, setIsYearly] = useState(false);
  const [showMoreFeatures, setShowMoreFeatures] = useState({
    free: false,
    premium: false,
  });

  const handleContinue = () => {
    // Map 'premium' selection to the appropriate plan type based on toggle
    const planToSave = selectedPlan === 'premium' 
      ? (isYearly ? 'yearly' : 'monthly') 
      : 'free';
    
    updateData({ subscriptionPlan: planToSave });
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
        <h1 className="text-2xl font-bold text-center mb-2">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Select the plan that best fits your journaling journey
        </p>

        {/* Premium Toggle */}
        {selectedPlan === "premium" && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <span
              className={!isYearly ? "font-medium" : "text-muted-foreground"}
            >
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span
              className={isYearly ? "font-medium" : "text-muted-foreground"}
            >
              Yearly <span className="text-sm text-primary">(Save 33%)</span>
            </span>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card
            className={`p-6 cursor-pointer transition-all ${
              selectedPlan === "free" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedPlan("free")}
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold">{plans.free.name}</h3>
              <div className="text-3xl font-bold mt-2">Free</div>
            </div>

            <ul className="space-y-3 mb-4">
              {plans.free.topFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full mt-6" 
              onClick={() => handleContinue()}
            >
              Continue with Free Plan
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              You can upgrade anytime
            </p>
          </Card>

          {/* Premium Plan */}
          <Card
            className={`p-8 cursor-pointer relative overflow-hidden bg-white dark:bg-zinc-900 ${
              selectedPlan === "premium"
                ? "ring-2 ring-primary shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                : "hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            } rounded-2xl transition-all duration-300 hover:translate-y-[-2px]`}
            onClick={() => setSelectedPlan("premium")}
          >
            <div className="absolute top-3 right-3">
              <span className="text-xs bg-primary text-white px-4 py-2 rounded-full font-medium">
                Unlock Your Best Self
              </span>
            </div>

            <div className="mb-6">
              <div className="relative">
                <h3 className="text-2xl font-bold font-serif bg-gradient-to-r from-violet-600 to-primary bg-clip-text text-transparent">
                  {plans.premium.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 font-light">For serious journalers</p>
                <div className="text-5xl font-light mt-4 flex items-baseline tracking-tight transition-transform duration-300 hover:scale-105">
                  <span className="font-normal">${isYearly ? "4.17" : "4.99"}</span>
                  <span className="text-base font-light text-muted-foreground ml-1">
                    /month
                  </span>
                </div>
                {isYearly && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground">
                      Billed ${plans.premium.yearlyPrice}/year
                    </div>
                    <div className="text-sm text-primary font-medium mt-1">
                      Save ${(4.99 * 12 - 49.99).toFixed(2)} per year
                    </div>
                  </div>
                )}
              </div>

              <ul className="space-y-4 my-6">
                {plans.premium.topFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 group">
                    <div className="relative">
                      <Check className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <span className="text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="ghost"
                className="w-full justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                onClick={() => {
                  setShowMoreFeatures((prev) => ({
                    ...prev,
                    premium: !prev.premium,
                  }));
                }}
              >
                <span className="font-medium">
                  {showMoreFeatures.premium ? "Hide features" : "Show more features"}
                </span>
                {showMoreFeatures.premium ? (
                  <ChevronUp className="h-4 w-4 text-primary transition-transform duration-200" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-primary transition-transform duration-200" />
                )}
              </Button>

              <div className={`space-y-3 mt-4 transition-all duration-300 ${
                showMoreFeatures.premium ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'
              }`}>
                {plans.premium.extraFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                  </li>
                ))}
              </div>
              
              <Button 
                size="lg" 
                className="w-full mt-6 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all font-medium" 
                onClick={() => handleContinue()}
              >
                Continue with Premium {isYearly ? "Yearly" : "Monthly"}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Cancel anytime. No questions asked.
              </p>
            </div>
          </Card>
        </div>

        {/* FAQs */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">
            Frequently Asked Questions
          </h3>
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
    </motion.div>
  );
}