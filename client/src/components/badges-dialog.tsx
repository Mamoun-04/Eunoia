import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";

type Badge = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: string;
  isUnlocked: boolean;
};

const BADGES: Badge[] = [
  {
    id: "first_entry",
    name: "First Steps",
    description: "Write your first journal entry",
    emoji: "📝",
    requirement: "Write 1 entry",
    isUnlocked: true,
  },
  {
    id: "philosopher",
    name: "Philosopher",
    description: "Maintain a 5-day journaling streak",
    emoji: "🎯",
    requirement: "5-day streak",
    isUnlocked: false,
  },
  {
    id: "sage",
    name: "Sage",
    description: "Maintain a 10-day journaling streak",
    emoji: "🏆",
    requirement: "10-day streak",
    isUnlocked: false,
  },
  {
    id: "enlightened",
    name: "Enlightened",
    description: "Maintain a 30-day journaling streak",
    emoji: "👑",
    requirement: "30-day streak",
    isUnlocked: false,
  },
  {
    id: "wordsmith",
    name: "Wordsmith",
    description: "Write over 1000 words total",
    emoji: "✍️",
    requirement: "1000+ words",
    isUnlocked: false,
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
      <DialogContent className={`sm:max-w-[425px] ${isMobile ? 'w-[95%] p-4' : ''}`}>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl">Achievements</DialogTitle>
          <DialogDescription>
            Track your journaling milestones and earn badges
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {BADGES.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border ${
                badge.isUnlocked ? "bg-primary/10" : "bg-muted/50 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{badge.emoji}</span>
                <div>
                  <h3 className="font-semibold">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {badge.description}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Requirement: {badge.requirement}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}