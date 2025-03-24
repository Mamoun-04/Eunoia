
import { useEffect, useState } from "react";
import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, premiumThemes, ThemeType } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  // Check if the user has premium access
  useEffect(() => {
    if (user) {
      setIsPremium(user.subscriptionStatus === 'active');
    }
  }, [user]);

  // For free users who just have light/dark mode
  if (!isPremium) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>
    );
  }

  // For premium users with access to all themes
  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Light/Dark Mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Select
        value={theme}
        onValueChange={(value) => setTheme(value as ThemeType)}
      >
        <SelectTrigger className="w-[180px] flex items-center gap-2">
          <SelectValue placeholder="Select theme">
            {theme !== "light" && theme !== "dark" && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: premiumThemes[theme as keyof typeof premiumThemes].color }}
                ></div>
                <span>{premiumThemes[theme as keyof typeof premiumThemes].name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          <SelectGroup>
            <SelectLabel>Standard</SelectLabel>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel className="font-medium text-primary">Premium Themes</SelectLabel>
            {Object.entries(premiumThemes).map(([key, theme]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <div className="theme-preview-container">
                    <div 
                      className="w-4 h-4 rounded-full ring-1 ring-inset ring-gray-200 shadow-sm" 
                      style={{ backgroundColor: theme.color }}
                    ></div>
                  </div>
                  <div>
                    <span className="font-medium">{theme.name}</span>
                    <p className="text-xs text-muted-foreground line-clamp-1">{theme.description}</p>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
