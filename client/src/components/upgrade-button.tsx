import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { SubscriptionDialog } from "@/components/subscription-dialog";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles } from "lucide-react";

interface UpgradeButtonProps extends ButtonProps {
  showIcon?: boolean;
  buttonText?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "gradient";
}

export function UpgradeButton({
  showIcon = true,
  buttonText = "Upgrade to Premium",
  variant = "default",
  className,
  ...props
}: UpgradeButtonProps) {
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const { user } = useAuth();
  
  // Check if user already has premium
  const isPremium = user?.subscriptionStatus === "active";
  
  // If user is already premium, don't show the button
  if (isPremium) {
    return null;
  }
  
  // Determine the button styling based on variant
  const buttonStyle = variant === "gradient" 
    ? "bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90 text-white" 
    : "";
  
  return (
    <>
      <Button
        variant={variant === "gradient" ? "default" : variant}
        onClick={() => setShowSubscriptionDialog(true)}
        className={`${buttonStyle} ${className}`}
        {...props}
      >
        {showIcon && <Sparkles className="h-4 w-4 mr-2" />}
        {buttonText}
      </Button>
      
      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
      />
    </>
  );
}

export function PremiumBadge() {
  const { user } = useAuth();
  const isPremium = user?.subscriptionStatus === "active";
  
  if (!isPremium) return null;
  
  return (
    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary gap-1">
      <Sparkles className="h-3 w-3" />
      Premium
    </div>
  );
}