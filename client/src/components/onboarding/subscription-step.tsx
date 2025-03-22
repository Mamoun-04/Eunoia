
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

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
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="text-center">
        <h2 className="text-3xl font-semibold mb-2">Unlock Your Mindful Journey</h2>
        <p className="text-muted-foreground">Start with a 7-day free trial, then choose your plan</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
          <div className="text-3xl font-bold mb-4">$0<span className="text-lg text-muted-foreground">/mo</span></div>
          <ul className="space-y-2 mb-6">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full" onClick={() => onComplete({ plan: 'free' })}>
            Start Free Plan
          </Button>
        </Card>

        <Card className="p-6 border-primary relative">
          <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
            7 Days Free
          </div>
          <h3 className="text-xl font-semibold mb-2">Premium</h3>
          <div className="text-3xl font-bold mb-4">$3.99<span className="text-lg text-muted-foreground">/mo</span></div>
          <ul className="space-y-2 mb-6">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full" onClick={() => onComplete({ plan: 'premium' })}>
            Start Free Trial
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            After trial ends, $3.99/month
          </p>
        </Card>
      </div>
    </div>
  );
}
