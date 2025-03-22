import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FREE_FEATURES = [
  "1 journal entry per day",
  "Basic mood tracking",
  "1 guided journaling lesson daily",
  "Limited AI chat assistant (15 mins/day)",
  "Standard support",
  "Basic data encryption",
  "Text-only entries"
];

const PREMIUM_FEATURES = [
  "Unlimited journal entries",
  "Advanced mood analytics & insights",
  "Unlimited guided journaling lessons",
  "Unlimited AI chat assistant access",
  "Image attachments for entries",
  "Priority support & coaching",
  "Enhanced data security & encryption",
  "Cloud backup & sync",
  "Custom categories & tags",
  "Premium journal prompts"
];

export function SubscriptionStep({ onComplete }: { onComplete: (data: any) => void }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (plan: 'free' | 'monthly' | 'yearly' | 'trial') => {
      const res = await apiRequest("POST", "/api/subscribe", { plan });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Plan activated",
        description: data.message || "Your plan has been activated successfully!"
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handlePlanSelection = async (plan: 'free' | 'monthly' | 'yearly') => {
    try {
      await subscribeMutation.mutateAsync(plan);
      // Refresh user data
      await queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onComplete({ plan });
      // Use replace to prevent going back to onboarding
      setLocation('/', { replace: true });
    } catch (error) {
      console.error('Failed to activate subscription:', error);
      toast({
        title: "Error",
        description: "Failed to activate subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  const faq = [
    { question: "What happens after the free trial?", answer: "After your 7-day free trial, your subscription will automatically convert to a paid monthly plan unless you cancel." },
    { question: "Can I cancel my subscription?", answer: "Yes, you can cancel your subscription at any time from your account settings." },
    { question: "What payment methods do you accept?", answer: "We accept all major credit cards and PayPal." }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="text-center">
        <h2 className="text-2xl font-['Playfair Display'] font-semibold mb-2">Unlock Your Mindful Journey</h2>
        <p className="text-sm text-muted-foreground font-['Inter']">Start with a 7-day free trial, then choose your plan</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-['The Seasons'] font-semibold mb-2">Free Plan</h3>
          <div className="text-3xl font-['Hello Paris'] text-center mb-4">$0<span className="text-lg text-muted-foreground font-['Inter']">/mo</span></div>
          <ul className="space-y-2 mb-6">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 font-['Inter']">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full font-['Inter']" onClick={() => handlePlanSelection('free')}>
            Start Free Plan
          </Button>
        </Card>

        <Card className="p-6 border-primary relative">
          <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-['Inter']">
            7 Days Free
          </div>
          <h3 className="text-xl font-['The Seasons'] font-semibold mb-2">Monthly Premium</h3>
          <div className="text-3xl font-['Hello Paris'] text-center mb-4">$3.99<span className="text-lg text-muted-foreground font-['Inter']">/mo</span></div>
          <ul className="space-y-2 mb-6">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 font-['Inter']">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full font-['Inter']" onClick={() => handlePlanSelection('monthly')}>
            Start Free Trial
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2 font-['Inter']">
            After trial ends, $3.99/month
          </p>
        </Card>

        <Card className="p-6 border-primary/50 relative bg-primary/5">
          <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-['Inter']">
            Best Value
          </div>
          <h3 className="text-xl font-['The Seasons'] font-semibold mb-2">Yearly Premium</h3>
          <div className="text-3xl font-['Hello Paris'] text-center mb-4">$39.99<span className="text-lg text-muted-foreground font-['Inter']">/yr</span></div>
          <div className="text-sm text-primary mb-4 font-['Inter']">Save 16% annually</div>
          <ul className="space-y-2 mb-6">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 font-['Inter']">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full font-['Inter']" onClick={() => handlePlanSelection('yearly')}>
            Choose Yearly Plan
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2 font-['Inter']">
            Billed annually at $39.99/year
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-['Playfair Display'] font-semibold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="after-trial">
            <AccordionTrigger>What happens after the free trial?</AccordionTrigger>
            <AccordionContent className="font-['Times New Roman']">
              After your 7-day free trial ends, you'll automatically continue with our monthly premium plan. You can cancel anytime before the trial ends to switch to our free plan. We'll notify you before the trial ends.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="cancel">
            <AccordionTrigger>Can I cancel my subscription?</AccordionTrigger>
            <AccordionContent className="font-['Times New Roman']">
              Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your current billing period.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="payment">
            <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
            <AccordionContent className="font-['Times New Roman']">
              We accept all major credit cards (Visa, MasterCard, American Express) and PayPal for subscription payments.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}