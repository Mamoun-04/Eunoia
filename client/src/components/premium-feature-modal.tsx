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
  
  // All features are free now
  const featureDescriptions = {
    image_upload: {
      title: "Image Upload",
      description: "Upload unlimited images with your entries",
      icon: Image,
    },
    daily_entry: {
      title: "Daily Entries",
      description: "Create unlimited entries per day",
      icon: Calendar,
    },
    word_limit: {
      title: "Word Count",
      description: "Write entries of any length",
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
            <span>Early Access: Premium features included!</span>
          </div>
          
          <div className="text-sm text-muted-foreground mt-2">
            Join our early access program and experience premium features at no cost. Your feedback helps shape the future of Eunoia.
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Maybe later
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Start using
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}