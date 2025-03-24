
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define all available themes/color schemes
export type ThemeType = "light" | "dark" | PremiumTheme;

// Reduced to 5 premium themes
export type PremiumTheme = "midnight" | "sunset" | "forest" | "ocean" | "nordic";

// Define premium themes with comprehensive color values
export const premiumThemes: Record<PremiumTheme, { 
  name: string, 
  color: string, 
  hoverColor: string,
  bgColor: string,
  bgColorDark: string,
  textColor: string,
  textColorDark: string,
  borderColor: string,
  mutedColor: string,
  accentColor: string,
  cardColor: string,
  description: string
}> = {
  midnight: { 
    name: "Midnight", 
    color: "#8b5cf6", 
    hoverColor: "#7c3aed",
    bgColor: "#1e1b4b", 
    bgColorDark: "#0f0d2c",
    textColor: "#e0e7ff",
    textColorDark: "#818cf8",
    borderColor: "#4338ca",
    mutedColor: "#312e81",
    accentColor: "#c4b5fd",
    cardColor: "#312e81",
    description: "Deep indigo and purple tones with a starry night feel" 
  },
  sunset: { 
    name: "Sunset", 
    color: "#f97316", 
    hoverColor: "#ea580c",
    bgColor: "#fef2f2", 
    bgColorDark: "#450a0a",
    textColor: "#7f1d1d",
    textColorDark: "#fca5a5",
    borderColor: "#f97316",
    mutedColor: "#fee2e2",
    accentColor: "#fb923c",
    cardColor: "#fff7ed",
    description: "Warm gradient of sunset colors from orange to deep red" 
  },
  forest: { 
    name: "Forest", 
    color: "#16a34a", 
    hoverColor: "#15803d",
    bgColor: "#f0fdf4", 
    bgColorDark: "#052e16",
    textColor: "#166534",
    textColorDark: "#86efac",
    borderColor: "#16a34a",
    mutedColor: "#dcfce7",
    accentColor: "#4ade80",
    cardColor: "#ecfdf5",
    description: "Lush greens and earthy tones of a deep forest" 
  },
  ocean: { 
    name: "Ocean", 
    color: "#0ea5e9", 
    hoverColor: "#0284c7",
    bgColor: "#f0f9ff", 
    bgColorDark: "#082f49",
    textColor: "#0c4a6e",
    textColorDark: "#7dd3fc",
    borderColor: "#0ea5e9",
    mutedColor: "#e0f2fe",
    accentColor: "#38bdf8",
    cardColor: "#ecfeff",
    description: "Tranquil blues of the deep ocean" 
  },
  nordic: { 
    name: "Nordic", 
    color: "#64748b", 
    hoverColor: "#475569",
    bgColor: "#f8fafc", 
    bgColorDark: "#1e293b",
    textColor: "#334155",
    textColorDark: "#cbd5e1",
    borderColor: "#94a3b8",
    mutedColor: "#e2e8f0",
    accentColor: "#94a3b8",
    cardColor: "#ffffff",
    description: "Minimalist Scandinavian design with cool neutral tones" 
  }
};

type ThemeStore = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isPremiumTheme: (theme: ThemeType) => boolean;
  getThemeColor: () => string;
};

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => {
        // Reset any existing theme-related classes
        document.documentElement.classList.remove(
          ...Object.keys(premiumThemes).map(t => `theme-${t}`)
        );
        
        // Toggle dark/light mode and set HTML class attribute
        document.documentElement.classList.toggle("dark", theme === "dark");
        
        // Apply theme CSS custom properties
        if (theme !== "light" && theme !== "dark") {
          // This is a premium theme
          const themeConfig = premiumThemes[theme as PremiumTheme];
          
          // Add theme class
          document.documentElement.classList.add(`theme-${theme}`);
          
          // Set all theme CSS variables
          // Core theme colors
          document.documentElement.style.setProperty("--primary", themeConfig.color);
          document.documentElement.style.setProperty("--primary-hover", themeConfig.hoverColor);
          
          // Global element colors
          document.documentElement.style.setProperty("--background", themeConfig.bgColor);
          document.documentElement.style.setProperty("--foreground", themeConfig.textColor);
          
          // Card and accent colors
          document.documentElement.style.setProperty("--card", themeConfig.cardColor);
          document.documentElement.style.setProperty("--card-foreground", themeConfig.textColor);
          document.documentElement.style.setProperty("--accent", themeConfig.accentColor);
          
          // UI element colors
          document.documentElement.style.setProperty("--muted", themeConfig.mutedColor);
          document.documentElement.style.setProperty("--muted-foreground", themeConfig.textColor + "99");
          document.documentElement.style.setProperty("--border", themeConfig.borderColor + "40");
          
          // Handle dark mode with the theme
          if (document.documentElement.classList.contains("dark")) {
            document.documentElement.style.setProperty("--background", themeConfig.bgColorDark);
            document.documentElement.style.setProperty("--foreground", themeConfig.textColorDark);
            document.documentElement.style.setProperty("--card-foreground", themeConfig.textColorDark);
            document.documentElement.style.setProperty("--muted-foreground", themeConfig.textColorDark + "99");
          }
        } else {
          // Reset to default theme colors for light/dark mode
          document.documentElement.style.removeProperty("--primary");
          document.documentElement.style.removeProperty("--primary-hover");
          document.documentElement.style.removeProperty("--background");
          document.documentElement.style.removeProperty("--foreground");
          document.documentElement.style.removeProperty("--card");
          document.documentElement.style.removeProperty("--card-foreground");
          document.documentElement.style.removeProperty("--accent");
          document.documentElement.style.removeProperty("--muted");
          document.documentElement.style.removeProperty("--muted-foreground");
          document.documentElement.style.removeProperty("--border");
        }
        
        set({ theme });
      },
      isPremiumTheme: (theme) => {
        return theme !== "light" && theme !== "dark";
      },
      getThemeColor: () => {
        const { theme } = get();
        if (theme !== "light" && theme !== "dark") {
          return premiumThemes[theme as PremiumTheme].color;
        }
        return ""; // Default theme color
      }
    }),
    {
      name: "theme-storage",
    }
  )
);
