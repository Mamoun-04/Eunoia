import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { SubscriptionDialog } from "@/components/subscription-dialog";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles } from "lucide-react";

interface UpgradeButtonProps extends Omit<ButtonProps, 'variant'> {
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
  // All users now have premium features, so this component is obsolete
  // Return null to not render anything
  return null;
}

export function PremiumBadge() {
  // All users are premium by default now
  return (
    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary gap-1">
      <Sparkles className="h-3 w-3" />
      Premium
    </div>
  );
}