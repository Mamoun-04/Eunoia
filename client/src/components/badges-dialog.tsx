import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BadgesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BadgesDialog({ open, onOpenChange }: BadgesDialogProps) {
  const isMobile = useIsMobile();
  const { data: entries = [] } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const totalWords = entries.reduce((acc, entry) => {
    return acc + entry.content.split(/\s+/).length;
  }, 0);

  type Badge = {
    id: string;
    name: string;
    description: string;
    emoji: string;
    requirement: string;
    checkUnlocked: (entries: Entry[]) => boolean;
    getProgress: (entries: Entry[]) => number;
  };

  const BADGES: Badge[] = [
    {
      id: "first_entry",
      name: "First Steps",
      description: "Write your first journal entry",
      emoji: "📝",
      requirement: "Write 1 entry",
      checkUnlocked: (entries) => entries.length > 0,
      getProgress: (entries) => Math.min(entries.length * 100, 100),
    },
    {
      id: "philosopher",
      name: "Philosopher",
      description: "Maintain a 5-day journaling streak",
      emoji: "🎯",
      requirement: "5-day streak",
      checkUnlocked: (entries) => {
        if (entries.length < 5) return false;
        const sortedDates = entries
          .map(e => new Date(e.createdAt).toISOString().split('T')[0])
          .sort()
          .reverse()
          .slice(0, 5);
        let streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const curr = new Date(sortedDates[i]);
          const prev = new Date(sortedDates[i - 1]);
          const diffDays = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) streak++;
        }
        return streak >= 5;
      },
      getProgress: (entries) => {
        if (entries.length < 5) return (entries.length / 5) * 100;
        const sortedDates = entries
          .map(e => new Date(e.createdAt).toISOString().split('T')[0])
          .sort()
          .reverse()
          .slice(0, 5);
        let streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const curr = new Date(sortedDates[i]);
          const prev = new Date(sortedDates[i - 1]);
          const diffDays = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) streak++;
        }
        return (streak / 5) * 100;
      },
    },
    {
      id: "wordsmith",
      name: "Wordsmith",
      description: "Write over 1000 words total",
      emoji: "✍️",
      requirement: "1000+ words",
      checkUnlocked: (entries) => {
        const totalWords = entries.reduce((sum, entry) =>
          sum + entry.content.split(/\s+/).length, 0);
        return totalWords >= 1000;
      },
      getProgress: (entries) => {
        const totalWords = entries.reduce((sum, entry) =>
          sum + entry.content.split(/\s+/).length, 0);
        return Math.min((totalWords / 1000) * 100, 100);
      },
    },
    {
      id: "dedicated_writer",
      name: "Dedicated Writer",
      description: "Write entries for 10 consecutive days",
      emoji: "📅",
      requirement: "10-day streak",
      checkUnlocked: (entries) => {
        if (entries.length < 10) return false;
        const sortedDates = entries
          .map(e => new Date(e.createdAt).toISOString().split('T')[0])
          .sort()
          .reverse()
          .slice(0, 10);
        let streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const curr = new Date(sortedDates[i]);
          const prev = new Date(sortedDates[i - 1]);
          const diffDays = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) streak++;
        }
        return streak >= 10;
      },
      getProgress: (entries) => {
        if (entries.length < 10) return (entries.length / 10) * 100;
        const sortedDates = entries
          .map(e => new Date(e.createdAt).toISOString().split('T')[0])
          .sort()
          .reverse()
          .slice(0, 10);
        let streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const curr = new Date(sortedDates[i]);
          const prev = new Date(sortedDates[i - 1]);
          const diffDays = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) streak++;
        }
        return (streak / 10) * 100;
      },
    },
    {
      id: "novelist",
      name: "Novelist",
      description: "Write over 5000 words total",
      emoji: "📚",
      requirement: "5000+ words",
      checkUnlocked: (entries) => {
        const totalWords = entries.reduce((sum, entry) =>
          sum + entry.content.split(/\s+/).length, 0);
        return totalWords >= 5000;
      },
      getProgress: (entries) => {
        const totalWords = entries.reduce((sum, entry) =>
          sum + entry.content.split(/\s+/).length, 0);
        return Math.min((totalWords / 5000) * 100, 100);
      },
    },
    {
      id: "night_owl",
      name: "Night Owl",
      description: "Write 5 entries between 10 PM and 4 AM",
      emoji: "🌙",
      requirement: "5 late-night entries",
      checkUnlocked: (entries) => {
        const nightEntries = entries.filter(entry => {
          const hour = new Date(entry.createdAt).getHours();
          return hour >= 22 || hour <= 4;
        });
        return nightEntries.length >= 5;
      },
      getProgress: (entries) => {
        const nightEntries = entries.filter(entry => {
          const hour = new Date(entry.createdAt).getHours();
          return hour >= 22 || hour <= 4;
        });
        return Math.min((nightEntries.length / 5) * 100, 100);
      },
    },
    {
      id: "early_bird",
      name: "Early Bird",
      description: "Write 5 entries between 5 AM and 9 AM",
      emoji: "🌅",
      requirement: "5 early-morning entries",
      checkUnlocked: (entries) => {
        const morningEntries = entries.filter(entry => {
          const hour = new Date(entry.createdAt).getHours();
          return hour >= 5 && hour <= 9;
        });
        return morningEntries.length >= 5;
      },
      getProgress: (entries) => {
        const morningEntries = entries.filter(entry => {
          const hour = new Date(entry.createdAt).getHours();
          return hour >= 5 && hour <= 9;
        });
        return Math.min((morningEntries.length / 5) * 100, 100);
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[425px] rounded-2xl backdrop-blur-sm bg-background/95 border-none shadow-xl",
          "transition-all duration-300 ease-in-out",
          "max-h-[80vh] overflow-y-auto",
          isMobile ? 'w-[95%] p-4' : ''
        )}
      >
        <DialogHeader className="mb-4 sticky top-0 bg-background/95 backdrop-blur-sm py-4">
          <DialogTitle className="text-2xl font-[Playfair Display] text-center">
            Achievements
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Track your journaling milestones and earn badges
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 mt-4 pb-4">
          {BADGES.map((badge) => {
            const isUnlocked = badge.checkUnlocked(entries);
            const progress = badge.getProgress(entries);

            return (
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
                  !isUnlocked && "opacity-60 hover:opacity-80 filter blur-[0.3px]"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "text-3xl p-3 rounded-full flex items-center justify-center",
                    isUnlocked && "animate-glow"
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
                    {!isUnlocked && (
                      <div className="w-full bg-muted/20 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground pl-16">
                  {!isUnlocked
                    ? `Progress: ${Math.round(progress)}% complete`
                    : `Achieved! (${badge.requirement})`}
                </div>
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}