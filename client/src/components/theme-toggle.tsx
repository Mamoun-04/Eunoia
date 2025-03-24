
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
import { Card } from "@/components/ui/card";

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
        className="transition-all duration-300"
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  // For premium users with access to premium themes and light/dark mode
  return (
    <div className="flex gap-2 items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="transition-all duration-300"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle dark mode</span>
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
                <ThemePreviewBadge theme={theme as keyof typeof premiumThemes} />
                <span>{premiumThemes[theme as keyof typeof premiumThemes].name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="relative">
          <SelectGroup>
            <SelectLabel>Standard</SelectLabel>
            <SelectItem value="light" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200">
                <Sun className="h-4 w-4 text-amber-500" />
              </div>
              <span>Light</span>
            </SelectItem>
            <SelectItem value="dark" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700">
                <Moon className="h-4 w-4 text-slate-200" />
              </div>
              <span>Dark</span>
            </SelectItem>
          </SelectGroup>
          
          <SelectGroup>
            <SelectLabel className="font-semibold text-primary pt-2">Premium Themes</SelectLabel>
            <div className="grid grid-cols-1 gap-2 py-2">
              {Object.entries(premiumThemes).map(([key, themeConfig]) => (
                <SelectItem key={key} value={key} className="p-0 m-0 focus:bg-transparent hover:bg-transparent data-[highlighted]:bg-transparent">
                  <ThemePreviewCard 
                    themeKey={key as keyof typeof premiumThemes} 
                    theme={themeConfig} 
                    isSelected={theme === key}
                  />
                </SelectItem>
              ))}
            </div>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

// Theme preview badge for the selected theme in the dropdown trigger
function ThemePreviewBadge({ theme }: { theme: keyof typeof premiumThemes }) {
  const themeConfig = premiumThemes[theme];
  
  return (
    <div 
      className="w-4 h-4 rounded-full ring-1 ring-inset ring-gray-200 shadow-sm" 
      style={{ 
        background: `linear-gradient(135deg, ${themeConfig.color} 0%, ${themeConfig.accentColor} 100%)` 
      }}
    />
  );
}

// Theme preview card for each theme in the dropdown
function ThemePreviewCard({ 
  themeKey, 
  theme, 
  isSelected 
}: { 
  themeKey: keyof typeof premiumThemes, 
  theme: typeof premiumThemes[keyof typeof premiumThemes],
  isSelected: boolean
}) {
  return (
    <div 
      className={`relative rounded-lg p-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Theme color preview */}
        <div 
          className="w-10 h-10 rounded-md shadow-sm overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.accentColor} 100%)` 
          }}
        >
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <span className="text-white text-xs font-bold opacity-90 drop-shadow-md">
              {theme.name.charAt(0)}
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <p className="font-medium text-sm">{theme.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{theme.description}</p>
        </div>
        
        {isSelected && (
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
        )}
      </div>
      
      {/* Mini preview of theme colors */}
      <div className="flex gap-1 mt-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.color }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentColor }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.cardColor }} />
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.borderColor }} />
      </div>
    </div>
  );
}
