import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Image, Calendar, FileText, Info } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: "image_upload" | "daily_entry" | "word_limit";
  onSubscribe?: () => void;
};

export function PremiumFeatureModal({ open, onOpenChange, feature, onSubscribe }: Props) {
  const { toast } = useToast();
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const { isIOS, isAndroid } = useIsMobile();
  
  const subscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscription", { 
        plan: "monthly",
        platform: isIOS ? 'ios' : isAndroid ? 'android' : 'web'
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Handle different response types based on platform
      if (data?.data?.checkoutUrl) {
        // Stripe checkout URL
        window.location.href = data.data.checkoutUrl;
      } else if (data?.data?.redirectToAppStore) {
        // Should redirect to App Store - here we'd normally deep link
        toast({
          title: "App Store Required",
          description: "Please complete your purchase through the App Store.",
        });
        // In production, you would use something like:
        // window.location.href = "https://apps.apple.com/app/your-app-id";
      } else if (data?.data?.redirectToPlayStore) {
        // Should redirect to Play Store
        toast({
          title: "Google Play Required",
          description: "Please complete your purchase through the Google Play Store.",
        });
        // In production, you would use something like:
        // window.location.href = "https://play.google.com/store/apps/details?id=your.package.id";
      } else {
        // Regular success
        toast({
          title: "Subscription Activated",
          description: "Thank you for subscribing to Eunoia Premium!",
        });
        onOpenChange(false);
        if (onSubscribe) {
          onSubscribe();
        }
      }
    },
    onError: (error: any) => {
      // Check for mobile store redirects that might be in the error
      if (error?.data?.redirectToAppStore) {
        toast({
          title: "App Store Required",
          description: "Please complete your purchase through the App Store.",
        });
        // In production, deep link to App Store
      } else if (error?.data?.redirectToPlayStore) {
        toast({
          title: "Google Play Required",
          description: "Please complete your purchase through the Google Play Store.",
        });
        // In production, deep link to Play Store
      } else {
        toast({
          title: "Error Activating Subscription",
          description: error.message || "An unknown error occurred",
          variant: "destructive",
        });
      }
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
          
          {/* Mobile platform info notice */}
          {(isIOS || isAndroid) && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-start gap-3 mb-4">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {isIOS ? (
                  <p>You'll be redirected to complete your purchase through Apple.</p>
                ) : (
                  <p>You'll be redirected to complete your purchase through Google Play.</p>
                )}
              </div>
            </div>
          )}
          
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