
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define all available themes/color schemes
export type ThemeType = "light" | "dark" | PremiumTheme;

// All theme colors for premium users
export type PremiumTheme = 
  "blue" | "green" | "red" | "purple" | "orange" | "pink" | "teal" | 
  "indigo" | "amber" | "yellow" | "lime" | "emerald" | "cyan" | 
  "sky" | "violet" | "fuchsia" | "rose" | "slate" | "gray" | "zinc";

// Define all premium themes with their color values
export const premiumThemes: Record<PremiumTheme, { name: string, color: string, hoverColor: string }> = {
  blue: { name: "Blue", color: "#3b82f6", hoverColor: "#2563eb" },
  green: { name: "Green", color: "#22c55e", hoverColor: "#16a34a" },
  red: { name: "Red", color: "#ef4444", hoverColor: "#dc2626" },
  purple: { name: "Purple", color: "#a855f7", hoverColor: "#9333ea" },
  orange: { name: "Orange", color: "#f97316", hoverColor: "#ea580c" },
  pink: { name: "Pink", color: "#ec4899", hoverColor: "#db2777" },
  teal: { name: "Teal", color: "#14b8a6", hoverColor: "#0d9488" },
  indigo: { name: "Indigo", color: "#6366f1", hoverColor: "#4f46e5" },
  amber: { name: "Amber", color: "#f59e0b", hoverColor: "#d97706" },
  yellow: { name: "Yellow", color: "#eab308", hoverColor: "#ca8a04" },
  lime: { name: "Lime", color: "#84cc16", hoverColor: "#65a30d" },
  emerald: { name: "Emerald", color: "#10b981", hoverColor: "#059669" },
  cyan: { name: "Cyan", color: "#06b6d4", hoverColor: "#0891b2" },
  sky: { name: "Sky", color: "#0ea5e9", hoverColor: "#0284c7" },
  violet: { name: "Violet", color: "#8b5cf6", hoverColor: "#7c3aed" },
  fuchsia: { name: "Fuchsia", color: "#d946ef", hoverColor: "#c026d3" },
  rose: { name: "Rose", color: "#f43f5e", hoverColor: "#e11d48" },
  slate: { name: "Slate", color: "#64748b", hoverColor: "#475569" },
  gray: { name: "Gray", color: "#6b7280", hoverColor: "#4b5563" },
  zinc: { name: "Zinc", color: "#71717a", hoverColor: "#52525b" }
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
        // Toggle dark/light mode
        document.documentElement.classList.toggle("dark", theme === "dark");
        
        // Apply theme CSS custom properties
        if (theme !== "light" && theme !== "dark") {
          // This is a premium theme
          const themeColor = premiumThemes[theme as PremiumTheme].color;
          const hoverColor = premiumThemes[theme as PremiumTheme].hoverColor;
          
          // Set CSS variables for theme colors
          document.documentElement.style.setProperty("--primary", themeColor);
          document.documentElement.style.setProperty("--primary-hover", hoverColor);
        } else {
          // Reset to default theme colors
          document.documentElement.style.removeProperty("--primary");
          document.documentElement.style.removeProperty("--primary-hover");
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
