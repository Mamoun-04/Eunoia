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
import { useState } from 'react';

const FREE_FEATURES = [
  "3 journal entries per week",
  "Basic mood tracking",
  "5 guided journaling lessons",
  "Limited AI chat assistant access",
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
    mutationFn: async (plan: string) => {
      const res = await apiRequest("POST", "/api/subscribe", { plan });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Subscription failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Plan selected",
        description: "Proceeding to account creation"
      });
      onComplete({ plan: data.plan });
      setLocation("/create-account");
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handlePlanSelection = (plan: string) => {
    subscribeMutation.mutate(plan);
  };

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
          {[
            {
              question: "What happens after the free trial?",
              answer: "After your 7-day free trial ends, you'll automatically continue with our monthly premium plan. You can cancel anytime before the trial ends to switch to our free plan. We'll notify you before the trial ends."
            },
            {
              question: "Can I cancel my subscription?",
              answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your current billing period."
            },
            {
              question: "What payment methods do you accept?",
              answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal for subscription payments."
            }
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function CreateAccountStep({ onComplete }: { onComplete: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!email.includes('@')) {
      setError('Invalid email format')
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Replace with your actual account creation API call
      const response = await fetch('/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, username })
      });
      if (!response.ok) {
        throw new Error(`Account creation failed: ${response.status}`);
      }
      onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export { CreateAccountStep };