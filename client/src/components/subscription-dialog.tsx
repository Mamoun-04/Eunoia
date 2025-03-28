import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, Sparkles, Calendar, Image, FileText } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubscriptionDialog({ open, onOpenChange }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const { toast } = useToast();
  
  const subscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscription", { plan: selectedPlan });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // If we received redirect URL (for Stripe), redirect to it
      if (data?.data?.url) {
        window.location.href = data.data.url;
      } else {
        toast({
          title: "Subscription activated",
          description: "Thank you for subscribing to Eunoia Premium!",
        });
        onOpenChange(false);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error activating subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const features = [
    { icon: Calendar, text: "Unlimited entries per day" },
    { icon: FileText, text: "Unlimited content length for entries" },
    { icon: Image, text: "Unlimited image uploads for entries" },
    { icon: Sparkles, text: "Access to premium themes" },
  ];
  
  const planOptions = [
    {
      id: "monthly",
      title: "Monthly Plan",
      price: "$4.99",
      period: "per month",
      description: "Enjoy all premium features with monthly billing",
      featured: false,
    },
    {
      id: "yearly",
      title: "Yearly Plan",
      price: "$49.99",
      period: "per year",
      description: "Save 15% with annual billing",
      featured: true,
    },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade to Eunoia Premium
          </DialogTitle>
          <DialogDescription>
            Unlock the full potential of your journaling practice
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Premium Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                  <feature.icon className="h-5 w-5 text-primary mt-0.5" />
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Choose a Plan</h3>
            <RadioGroup 
              value={selectedPlan} 
              onValueChange={(value) => setSelectedPlan(value as "monthly" | "yearly")}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {planOptions.map((plan) => (
                <div key={plan.id} className={`relative rounded-lg border p-4 hover:border-primary cursor-pointer ${selectedPlan === plan.id ? 'border-primary bg-primary/5' : ''}`}>
                  {plan.featured && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      Best Value
                    </div>
                  )}
                  <RadioGroupItem 
                    value={plan.id as "monthly" | "yearly"} 
                    id={plan.id} 
                    className="sr-only"
                  />
                  <Label htmlFor={plan.id} className="block cursor-pointer">
                    <div>
                      <div className="font-semibold">{plan.title}</div>
                      <div className="mt-1 mb-2">
                        <span className="text-2xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground text-sm"> {plan.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    {selectedPlan === plan.id && (
                      <div className="absolute bottom-4 right-4 h-5 w-5 text-primary">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => subscriptionMutation.mutate()}
              disabled={subscriptionMutation.isPending}
              className="bg-gradient-to-r from-primary/80 to-primary"
            >
              {subscriptionMutation.isPending ? (
                <span className="animate-spin mr-2">●</span>
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Subscribe Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}