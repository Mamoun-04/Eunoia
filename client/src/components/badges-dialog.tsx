import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Entry } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useQuery } from "@tanstack/react-query";

interface BadgesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BadgesDialog({ open, onOpenChange }: BadgesDialogProps) {
  const isMobile = useIsMobile();
  const { data: entries = [] } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const BADGES = [
    {
      id: "wordsmith",
      name: "Wordsmith",
      description: "Write over 1000 words total",
      emoji: "✍️",
      requirement: "1000+ words",
      checkUnlocked: (entries: Entry[]) => {
        const totalWords = entries.reduce((sum, entry) =>
          sum + entry.content.split(/\s+/).length, 0);
        return totalWords >= 1000;
      },
      getProgress: (entries: Entry[]) => {
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
      checkUnlocked: (entries: Entry[]) => {
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
      getProgress: (entries: Entry[]) => {
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
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[425px] rounded-2xl bg-background/95 border-none shadow-xl flex flex-col",
          "max-h-[80vh]",
          isMobile ? 'w-[95%] p-4' : ''
        )}
      >
        <DialogHeader className="bg-background/95 backdrop-blur-sm py-4 border-b">
          <DialogTitle className="text-2xl font-[Playfair Display] text-center">
            Achievements
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Track your journaling milestones and earn badges
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pt-4">
          <div className="grid grid-cols-1 gap-4 px-4 pb-4">
            {BADGES.map((badge) => {
              const isUnlocked = badge.checkUnlocked(entries);
              const progress = badge.getProgress(entries);

              return (
                <motion.div
                  key={badge.id}
                  className="relative p-4 rounded-xl bg-muted/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{badge.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                      {!isUnlocked && (
                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}