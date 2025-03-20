import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { subscriptionPlans } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubscriptionDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (plan: "monthly" | "yearly") => {
      const res = await apiRequest("POST", "/api/subscribe", { plan });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Subscription activated",
        description: "Thank you for subscribing to Eunoia Premium!",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const features = [
    "Unlimited journal entries",
    "Advanced mood analytics",
    "Cloud backup & sync",
    "Premium journal prompts",
    "Custom categories",
    "Priority support",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade to Premium</DialogTitle>
          <DialogDescription>
            Unlock all features and start your journey to mindful journaling
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Plan */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="text-xl font-semibold">
                {subscriptionPlans.monthly.name}
              </div>
              <div className="text-3xl font-bold">
                ${subscriptionPlans.monthly.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </div>
              <ul className="space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => subscribeMutation.mutate("monthly")}
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Start Monthly Plan"
                )}
              </Button>
            </div>

            {/* Yearly Plan */}
            <div className="border rounded-lg p-6 space-y-4 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                Best Value
              </div>
              <div className="text-xl font-semibold">
                {subscriptionPlans.yearly.name}
              </div>
              <div className="text-3xl font-bold">
                ${subscriptionPlans.yearly.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /year
                </span>
              </div>
              <ul className="space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => subscribeMutation.mutate("yearly")}
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Start Yearly Plan"
                )}
              </Button>
            </div>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="faq">
              <AccordionTrigger className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Frequently Asked Questions
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">What's included in Premium?</h4>
                  <p className="text-sm text-muted-foreground">
                    Premium includes unlimited journal entries, advanced mood analytics,
                    cloud backup, premium prompts, and priority support.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Can I cancel anytime?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can cancel your subscription at any time. You'll
                    continue to have access until the end of your billing period.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Is there a free trial?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, all new subscribers get a 7-day free trial to explore all
                    premium features.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
