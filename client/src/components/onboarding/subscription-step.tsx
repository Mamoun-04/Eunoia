import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
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

  const handlePlanSelection = (plan: 'free' | 'monthly' | 'yearly' | 'trial') => {
    subscribeMutation.mutate(plan);
    onComplete({ plan });
  };

  const faq = [
    { question: "What happens after the free trial?", answer: "After your 7-day free trial, your subscription will automatically convert to a paid monthly plan unless you cancel." },
    { question: "Can I cancel my subscription?", answer: "Yes, you can cancel your subscription at any time from your account settings." },
    { question: "What payment methods do you accept?", answer: "We accept all major credit cards and PayPal." }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Unlock Your Mindful Journey</h2>
        <p className="text-sm text-muted-foreground">Start with a 7-day free trial, then choose your plan</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
          <div className="text-3xl font-bold mb-4">$0<span className="text-lg text-muted-foreground">/mo</span></div>
          <ul className="space-y-2 mb-6">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full" onClick={() => handlePlanSelection('free')}>
            Start Free Plan
          </Button>
        </Card>

        <Card className="p-6 border-primary relative">
          <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
            7 Days Free
          </div>
          <h3 className="text-xl font-semibold mb-2">Monthly Premium</h3>
          <div className="text-3xl font-bold mb-4">$3.99<span className="text-lg text-muted-foreground">/mo</span></div>
          <ul className="space-y-2 mb-6">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full" onClick={() => handlePlanSelection('trial')}>
            Start Free Trial
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            After trial ends, $3.99/month
          </p>
        </Card>

        <Card className="p-6 border-primary/50 relative bg-primary/5">
          <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
            Best Value
          </div>
          <h3 className="text-xl font-semibold mb-2">Yearly Premium</h3>
          <div className="text-3xl font-bold mb-4">$39.99<span className="text-lg text-muted-foreground">/yr</span></div>
          <div className="text-sm text-primary mb-4">Save 16% annually</div>
          <ul className="space-y-2 mb-6">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full" onClick={() => handlePlanSelection('yearly')}>
            Choose Yearly Plan
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Billed annually at $39.99/year
          </p>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible>
          {faq.map((item, index) => (
            <AccordionItem key={index}>
              <AccordionTrigger className="font-medium">{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}