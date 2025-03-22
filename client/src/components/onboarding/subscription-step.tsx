import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { toast } from "@/hooks/use-toast"; // Corrected import path
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const plans = [
  {
    name: "Free",
    price: "0",
    features: [
      "Basic journaling features",
      "3 entries per day",
      "Basic analytics",
    ],
  },
  {
    name: "Pro",
    price: "9.99",
    features: [
      "Unlimited entries",
      "Advanced analytics",
      "AI-powered insights",
      "Priority support",
    ],
  },
];

export function SubscriptionStep({ data }: { data: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const { registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubscribe = async (plan: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) throw new Error("Subscription failed");

      // After successful subscription, register the user
      await registerMutation.mutateAsync(data);
      setLocation("/");

      toast({
        title: "Welcome to Eunoia!",
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Select the plan that best fits your journaling needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2">
                  ${plan.price}
                  <span className="text-lg text-muted-foreground">/month</span>
                </p>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan.name.toLowerCase())}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : `Get Started with ${plan.name}`}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-['Playfair Display'] font-semibold mb-4">
          Frequently Asked Questions
        </h2>
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