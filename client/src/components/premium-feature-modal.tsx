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
  
  // Feature limits - renamed to feature descriptions since there are no limits now
  const featureDescriptions = {
    image_upload: {
      title: "Feature Information",
      description: "You can upload unlimited images with your entries",
      icon: Image,
    },
    daily_entry: {
      title: "Feature Information",
      description: "You can create unlimited entries per day",
      icon: Calendar,
    },
    word_limit: {
      title: "Feature Information",
      description: "Entries can be up to 1000 words each",
      icon: FileText,
    },
  };
  
  const { title, description, icon: FeatureIcon } = featureDescriptions[feature];
  
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
            <span>All premium features are now available to everyone for free!</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}