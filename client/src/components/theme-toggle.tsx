
import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, ThemeType, themeCategories } from "@/hooks/use-theme";
import { SubscriptionDialog } from "@/components/subscription-dialog";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Theme icon mapping
const themeIcons: Record<ThemeType, React.ReactNode> = {
  light: <Sun className="h-5 w-5" />,
  dark: <Moon className="h-5 w-5" />,
  serenity: <Palette className="h-5 w-5 text-blue-400" />,
  sage: <Palette className="h-5 w-5 text-green-600" />,
  lavender: <Palette className="h-5 w-5 text-purple-400" />,
  rose: <Palette className="h-5 w-5 text-pink-400" />,
  amber: <Palette className="h-5 w-5 text-amber-500" />
};

export function ThemeToggle() {
  const { currentTheme, setTheme, isPremiumTheme, isPremium, availableThemes } = useTheme();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  // Handle theme selection
  const handleThemeSelect = (theme: ThemeType) => {
    setTheme(theme);
  };

  // Get formatted theme name
  const formatThemeName = (theme: ThemeType): string => {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            {themeIcons[currentTheme] || <Palette className="h-5 w-5" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          
          {/* Free Themes */}
          {themeCategories.free.map((theme) => (
            <DropdownMenuItem
              key={theme}
              onClick={() => handleThemeSelect(theme)}
              className={currentTheme === theme ? "bg-muted" : ""}
            >
              <div className="flex items-center gap-2">
                {themeIcons[theme]}
                <span>{formatThemeName(theme)}</span>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Premium Themes</span>
            {!isPremium && (
              <Badge variant="outline" className="ml-2 text-xs">
                Upgrade
              </Badge>
            )}
          </DropdownMenuLabel>
          
          {/* Premium Themes */}
          {themeCategories.premium.map((theme) => (
            <DropdownMenuItem
              key={theme}
              onClick={() => handleThemeSelect(theme)}
              className={`${currentTheme === theme ? "bg-muted" : ""} ${
                !isPremium ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {themeIcons[theme]}
                <span>{formatThemeName(theme)}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Subscription Dialog */}
      <SubscriptionDialog 
        open={showSubscriptionDialog} 
        onOpenChange={setShowSubscriptionDialog} 
      />
    </>
  );
}
