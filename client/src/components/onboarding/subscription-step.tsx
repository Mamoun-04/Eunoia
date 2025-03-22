
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const FEATURES = [
  "Unlimited journal entries",
  "Advanced mood tracking",
  "Custom categories",
  "Cloud backup & sync",
  "Premium journal prompts",
  "Priority support",
];

export function SubscriptionStep({ onComplete }: { onComplete: (data: any) => void }) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="text-center">
        <h2 className="text-3xl font-semibold mb-2">Unlock Your Mindful Journey</h2>
        <p className="text-muted-foreground">Choose the plan that's right for you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">Monthly</h3>
          <div className="text-3xl font-bold mb-4">$3.99<span className="text-lg text-muted-foreground">/mo</span></div>
          <ul className="space-y-2 mb-6">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full" onClick={() => onComplete({ plan: 'monthly' })}>
            Start Monthly Plan
          </Button>
        </Card>

        <Card className="p-6 border-primary">
          <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
            Best Value
          </div>
          <h3 className="text-xl font-semibold mb-2">Yearly</h3>
          <div className="text-3xl font-bold mb-4">$39.99<span className="text-lg text-muted-foreground">/yr</span></div>
          <ul className="space-y-2 mb-6">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full" onClick={() => onComplete({ plan: 'yearly' })}>
            Start Yearly Plan
          </Button>
        </Card>
      </div>

      <Button
        variant="ghost"
        className="mx-auto"
        onClick={() => onComplete({ plan: 'free' })}
      >
        Continue with Free Plan
      </Button>
    </div>
  );
}
