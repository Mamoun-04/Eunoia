import React from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakIndicatorProps {
  streak: number;
  className?: string;
}

export function StreakIndicator({ streak, className }: StreakIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        {/* Animated flame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flame-animation h-6 w-6 -mt-1"></div>
        </div>
        <Flame className="h-5 w-5 text-amber-500 relative z-10" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{streak} day streak</span>
        <span className="text-xs text-muted-foreground">Keep it going!</span>
      </div>
    </div>
  );
}