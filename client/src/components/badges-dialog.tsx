import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Entry } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ACHIEVEMENTS, type Achievement } from "@/lib/achievements";

export function BadgesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all');
  const { data: entries = [] } = useQuery({ 
    queryKey: ['entries'],
    queryFn: () => [] as Entry[]
  });

  const filteredAchievements = ACHIEVEMENTS.filter(
    achievement => selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const tierCounts = ACHIEVEMENTS.reduce((acc, achievement) => {
    const isUnlocked = achievement.isUnlocked(entries);
    if (isUnlocked) {
      acc[achievement.tier] = (acc[achievement.tier] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-background/95 to-background/50 backdrop-blur-xl border-none">
        <div className="flex flex-col gap-6 p-1">
          {/* Filter buttons here */}

          <div className="grid grid-cols-1 gap-4">
            {filteredAchievements.map(achievement => {
              const isUnlocked = achievement.isUnlocked(entries);
              const progress = achievement.getProgress(entries);

              const tierStyles = {
                bronze: {
                  background: "from-amber-700/10 to-orange-600/10",
                  glow: "after:bg-gradient-to-r after:from-amber-700/20 after:to-orange-600/20",
                  border: "border-amber-700/30",
                  shine: "before:bg-gradient-to-r before:from-transparent before:via-amber-700/10 before:to-transparent",
                  badge: "bg-amber-700/20 text-amber-200",
                  text: "text-amber-200",
                  emoji: "bg-amber-700/10",
                  progressBar: "bg-amber-700"
                },
                silver: {
                  background: "from-slate-400/10 to-slate-300/10",
                  glow: "after:bg-gradient-to-r after:from-slate-400/20 after:to-slate-300/20",
                  border: "border-slate-400/30",
                  shine: "before:bg-gradient-to-r before:from-transparent before:via-slate-400/10 before:to-transparent",
                  badge: "bg-slate-400/20 text-slate-200",
                  text: "text-slate-200",
                  emoji: "bg-slate-400/10",
                  progressBar: "bg-slate-400"
                },
                gold: {
                  background: "from-yellow-500/10 to-amber-500/10",
                  glow: "after:bg-gradient-to-r after:from-yellow-500/20 after:to-amber-500/20",
                  border: "border-yellow-500/30",
                  shine: "before:bg-gradient-to-r before:from-transparent before:via-yellow-500/10 before:to-transparent",
                  badge: "bg-yellow-500/20 text-yellow-200",
                  text: "text-yellow-200",
                  emoji: "bg-yellow-500/10",
                  progressBar: "bg-yellow-500"
                },
                platinum: {
                  background: "from-blue-200/10 to-slate-200/10",
                  glow: "after:bg-gradient-to-r after:from-blue-200/20 after:to-slate-200/20",
                  border: "border-blue-200/30",
                  shine: "before:bg-gradient-to-r before:from-transparent before:via-blue-200/10 before:to-transparent",
                  badge: "bg-blue-200/20 text-blue-100",
                  text: "text-blue-100",
                  emoji: "bg-blue-200/10",
                  progressBar: "bg-blue-200"
                },
                diamond: {
                  background: "from-blue-600/10 to-purple-600/10",
                  glow: "after:bg-gradient-to-r after:from-blue-600/20 after:to-purple-600/20",
                  border: "border-blue-600/30",
                  shine: "before:bg-gradient-to-r before:from-transparent before:via-blue-600/10 before:to-transparent",
                  badge: "bg-blue-600/20 text-blue-200",
                  text: "text-blue-200",
                  emoji: "bg-blue-600/10",
                  progressBar: "bg-blue-600"
                }
              }[achievement.tier];

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  key={achievement.id}
                  className={cn(
                    "achievement-card p-6 rounded-2xl transition-all duration-500",
                    `bg-gradient-to-br ${tierStyles.background}`,
                    tierStyles.border,
                    "shadow-lg hover:shadow-xl",
                    "relative overflow-hidden",
                    "before:absolute before:inset-0 before:animate-shine before:duration-1000",
                    tierStyles.shine,
                    "after:absolute after:inset-0 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500",
                    tierStyles.glow,
                    isUnlocked && "animate-unlock"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={cn(
                      "text-3xl p-3 rounded-xl flex items-center justify-center transition-all duration-300",
                      tierStyles.emoji,
                      isUnlocked && "animate-pulse"
                    )}>
                      {achievement.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          "font-[Playfair Display] text-lg font-semibold",
                          tierStyles.text
                        )}>
                          {achievement.name}
                        </h3>
                        <Badge className={tierStyles.badge}>
                          {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      {!isUnlocked && (
                        <div className="w-full bg-muted/20 rounded-full h-1.5 mt-2">
                          <div 
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-500",
                              tierStyles.progressBar
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={cn(
                    "mt-2 text-xs pl-16",
                    !isUnlocked ? "text-muted-foreground" : tierStyles.text
                  )}>
                    {!isUnlocked
                      ? `Progress: ${Math.round(progress)}% complete`
                      : `Achieved! (${achievement.requirement})`}
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