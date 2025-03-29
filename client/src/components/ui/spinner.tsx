import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "sm" | "lg";
  variant?: "default" | "primary" | "secondary";
};

/**
 * A simple spinner component to indicate loading states
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "default", variant = "default", ...props }, ref) => {
    // Map size string to actual pixel value
    const sizeMap = {
      sm: "h-4 w-4",
      default: "h-5 w-5",
      lg: "h-8 w-8",
    };
    
    // Map variant to color
    const variantMap = {
      default: "text-primary",
      primary: "text-primary",
      secondary: "text-secondary",
    };
    
    return (
      <div
        ref={ref}
        className={cn("animate-spin", sizeMap[size], variantMap[variant], className)}
        {...props}
      >
        <Loader2 className="h-full w-full" />
      </div>
    );
  }
);

Spinner.displayName = "Spinner";