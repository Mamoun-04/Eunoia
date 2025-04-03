
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type DeleteAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAccountDialog({ 
  open, 
  onOpenChange 
}: DeleteAccountDialogProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const handleDeleteAccount = async () => {
    if (!reason) {
      toast({
        title: "Selection required",
        description: "Please select a reason for leaving.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      
      // Send the delete request with feedback
      const response = await apiRequest("DELETE", "/api/user", { reason, feedback });
      
      if (response.ok) {
        // Clear any client-side state
        localStorage.clear();
        sessionStorage.clear();
        
        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted.",
        });
        
        // Force refresh to ensure complete state reset and redirect to auth page
        window.location.href = '/auth';
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const reasons = [
    "I found a better app",
    "Privacy concerns",
    "Not useful",
    "Too expensive",
    "Other"
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Why are you leaving?
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {reasons.map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <RadioGroupItem value={item} id={item} />
                <Label htmlFor={item} className="font-normal">{item}</Label>
              </div>
            ))}
          </RadioGroup>
          
          {reason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="feedback">Please tell us more</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Your feedback helps us improve"
                className="min-h-[100px]"
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
