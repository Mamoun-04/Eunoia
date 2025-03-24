import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: "image_upload" | "daily_entry" | "word_limit";
  onSubscribe?: () => void;
};

export function PremiumFeatureModal({ open, onOpenChange, feature, onSubscribe }: Props) {
  const { toast } = useToast();

  const featureDetails = {
    image_upload: {
      title: "Image Uploads",
      description: "Add photos to your journal entries to capture memories visually.",
    },
    daily_entry: {
      title: "Unlimited Entries",
      description: "Create as many journal entries as you want each day.",
    },
    word_limit: {
      title: "Extended Writing",
      description: "Express yourself with up to 1,000 words per entry.",
    },
  };

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
      if (onSubscribe) {
        onSubscribe();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const details = featureDetails[feature];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Premium Feature</DialogTitle>
          <DialogDescription className="text-center px-6 pt-2">
            <span className="font-medium text-primary">{details.title}</span> is a premium feature.
            Upgrade to unlock this and all premium benefits.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg my-4">
          <p className="text-sm">{details.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Monthly Plan Button */}
          <Button
            onClick={() => subscribeMutation.mutate("monthly")}
            disabled={subscribeMutation.isPending}
            className="w-full"
          >
            {subscribeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Upgrade Now
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}