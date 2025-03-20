
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Badge = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: string;
  isUnlocked: boolean;
  progress?: number;
};

const BADGES: Badge[] = [
  {
    id: "first_entry",
    name: "First Steps",
    description: "Write your first journal entry",
    emoji: "📝",
    requirement: "Write 1 entry",
    isUnlocked: true,
    progress: 100,
  },
  {
    id: "philosopher",
    name: "Philosopher",
    description: "Maintain a 5-day journaling streak",
    emoji: "🎯",
    requirement: "5-day streak",
    isUnlocked: false,
    progress: 60,
  },
  {
    id: "sage",
    name: "Sage",
    description: "Maintain a 10-day journaling streak",
    emoji: "🏆",
    requirement: "10-day streak",
    isUnlocked: false,
    progress: 30,
  },
  {
    id: "enlightened",
    name: "Enlightened",
    description: "Maintain a 30-day journaling streak",
    emoji: "👑",
    requirement: "30-day streak",
    isUnlocked: false,
    progress: 10,
  },
  {
    id: "wordsmith",
    name: "Wordsmith",
    description: "Write over 1000 words total",
    emoji: "✍️",
    requirement: "1000+ words",
    isUnlocked: false,
    progress: 45,
  }
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BadgesDialog({ open, onOpenChange }: Props) {
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "sm:max-w-[425px] rounded-2xl backdrop-blur-sm bg-background/95 border-none shadow-xl",
          "transition-all duration-300 ease-in-out",
          isMobile ? 'w-[95%] p-4' : ''
        )}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-[Playfair Display] text-center">
            Achievements
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Track your journaling milestones and earn badges
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 mt-4">
          {BADGES.map((badge) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key={badge.id}
              className={cn(
                "p-6 rounded-2xl transition-all duration-300",
                "bg-gradient-to-br from-background/80 to-background/40",
                "border border-muted/20 shadow-lg hover:shadow-xl",
                "backdrop-blur-sm",
                !badge.isUnlocked && "opacity-60 hover:opacity-80 filter blur-[0.3px]"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "text-3xl p-3 rounded-full bg-primary/10",
                  "flex items-center justify-center",
                  badge.isUnlocked && "animate-glow"
                )}>
                  {badge.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-[Playfair Display] text-lg font-semibold mb-1">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {badge.description}
                  </p>
                  {badge.progress !== undefined && badge.progress < 100 && (
                    <div className="w-full bg-muted/20 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground pl-16">
                {badge.progress && badge.progress < 100
                  ? `Progress: ${badge.progress}% complete`
                  : `Requirement: ${badge.requirement}`}
              </div>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
