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
import { Separator } from "@/components/ui/separator";
import { Sparkles, Image, Calendar, FileText } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: "image_upload" | "daily_entry" | "word_limit";
  onSubscribe?: () => void;
};

export function PremiumFeatureModal({ open, onOpenChange, feature, onSubscribe }: Props) {
  const { toast } = useToast();
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  
  const subscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscription", { plan: "monthly" });
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
        if (onSubscribe) {
          onSubscribe();
        }
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
  
  // Feature limits
  const featureLimits = {
    image_upload: {
      title: "Image Upload Limit Reached",
      description: "Free accounts are limited to 1 image per day",
      icon: Image,
    },
    daily_entry: {
      title: "Entry Limit Reached",
      description: "Free accounts are limited to 3 entries per day",
      icon: Calendar,
    },
    word_limit: {
      title: "Word Limit Reached",
      description: "Free accounts are limited to 500 words per entry",
      icon: FileText,
    },
  };
  
  const { title, description, icon: FeatureIcon } = featureLimits[feature];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FeatureIcon className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Upgrade to Premium for unlimited access to all features</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Maybe Later
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
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}