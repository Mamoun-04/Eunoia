
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define all available themes/color schemes
export type ThemeType = "light" | "dark" | PremiumTheme;

// All theme names for premium users
export type PremiumTheme = 
  "sunset" | "ocean" | "forest" | "lavender" | "desert" | "midnight" | 
  "cherry" | "meadow" | "coffee" | "skyblue" | "autumn" | "winter" | 
  "spring" | "summer" | "coral" | "mint" | "amethyst" | "ruby" | 
  "citrus" | "twilight";

// Define all premium themes with their color values and descriptions
export const premiumThemes: Record<PremiumTheme, { 
  name: string, 
  color: string, 
  hoverColor: string,
  secondary?: string,
  description: string
}> = {
  sunset: { 
    name: "Sunset", 
    color: "#f97316", 
    hoverColor: "#ea580c",
    secondary: "#fb923c",
    description: "Warm orange tones of a beautiful sunset" 
  },
  ocean: { 
    name: "Ocean", 
    color: "#0ea5e9", 
    hoverColor: "#0284c7",
    secondary: "#38bdf8",
    description: "Deep blues of the open ocean" 
  },
  forest: { 
    name: "Forest", 
    color: "#16a34a", 
    hoverColor: "#15803d",
    secondary: "#4ade80",
    description: "Rich greens of a deep forest" 
  },
  lavender: { 
    name: "Lavender", 
    color: "#8b5cf6", 
    hoverColor: "#7c3aed",
    secondary: "#a78bfa",
    description: "Soft purple hues of lavender fields" 
  },
  desert: { 
    name: "Desert", 
    color: "#d97706", 
    hoverColor: "#b45309",
    secondary: "#fbbf24",
    description: "Sandy gold tones of the desert" 
  },
  midnight: { 
    name: "Midnight", 
    color: "#1e3a8a", 
    hoverColor: "#1e40af",
    secondary: "#3b82f6",
    description: "Deep blues of the night sky" 
  },
  cherry: { 
    name: "Cherry", 
    color: "#be123c", 
    hoverColor: "#9f1239",
    secondary: "#fb7185",
    description: "Rich reds of ripe cherries" 
  },
  meadow: { 
    name: "Meadow", 
    color: "#65a30d", 
    hoverColor: "#4d7c0f",
    secondary: "#a3e635",
    description: "Vibrant greens of a spring meadow" 
  },
  coffee: { 
    name: "Coffee", 
    color: "#78350f", 
    hoverColor: "#92400e",
    secondary: "#d6d3d1",
    description: "Warm browns of freshly brewed coffee" 
  },
  skyblue: { 
    name: "Sky Blue", 
    color: "#0284c7", 
    hoverColor: "#0369a1",
    secondary: "#7dd3fc",
    description: "Clear blues of a cloudless sky" 
  },
  autumn: { 
    name: "Autumn", 
    color: "#b45309", 
    hoverColor: "#92400e",
    secondary: "#f59e0b",
    description: "Golden tones of autumn leaves" 
  },
  winter: { 
    name: "Winter", 
    color: "#0f172a", 
    hoverColor: "#1e293b",
    secondary: "#94a3b8",
    description: "Cool blues of a winter landscape" 
  },
  spring: { 
    name: "Spring", 
    color: "#15803d", 
    hoverColor: "#166534",
    secondary: "#86efac",
    description: "Fresh greens of spring growth" 
  },
  summer: { 
    name: "Summer", 
    color: "#ea580c", 
    hoverColor: "#c2410c",
    secondary: "#fed7aa",
    description: "Bright, warm tones of summer" 
  },
  coral: { 
    name: "Coral", 
    color: "#f43f5e", 
    hoverColor: "#e11d48",
    secondary: "#fda4af",
    description: "Vibrant coral reef colors" 
  },
  mint: { 
    name: "Mint", 
    color: "#10b981", 
    hoverColor: "#059669",
    secondary: "#6ee7b7",
    description: "Cool, refreshing mint tones" 
  },
  amethyst: { 
    name: "Amethyst", 
    color: "#7e22ce", 
    hoverColor: "#6b21a8",
    secondary: "#c084fc",
    description: "Rich purple of the amethyst gemstone" 
  },
  ruby: { 
    name: "Ruby", 
    color: "#be123c", 
    hoverColor: "#9f1239",
    secondary: "#fda4af",
    description: "Deep red of the ruby gemstone" 
  },
  citrus: { 
    name: "Citrus", 
    color: "#ca8a04", 
    hoverColor: "#a16207",
    secondary: "#fde047",
    description: "Bright, zesty citrus colors" 
  },
  twilight: { 
    name: "Twilight", 
    color: "#4c1d95", 
    hoverColor: "#6d28d9",
    secondary: "#c4b5fd",
    description: "Purples and blues of the twilight hour" 
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
        
        // Toggle dark/light mode
        document.documentElement.classList.toggle("dark", theme === "dark");
        
        // Apply theme CSS custom properties
        if (theme !== "light" && theme !== "dark") {
          // This is a premium theme
          const themeConfig = premiumThemes[theme as PremiumTheme];
          
          // Add theme class
          document.documentElement.classList.add(`theme-${theme}`);
          
          // Set CSS variables for theme colors
          document.documentElement.style.setProperty("--primary", themeConfig.color);
          document.documentElement.style.setProperty("--primary-hover", themeConfig.hoverColor);
          
          if (themeConfig.secondary) {
            document.documentElement.style.setProperty("--primary-light", themeConfig.secondary);
          }
          
          // Set thematic CSS variables
          document.documentElement.style.setProperty("--theme-color", themeConfig.color);
          document.documentElement.style.setProperty("--theme-color-hover", themeConfig.hoverColor);
          document.documentElement.style.setProperty("--theme-color-light", themeConfig.secondary || themeConfig.color);
        } else {
          // Reset to default theme colors
          document.documentElement.style.removeProperty("--primary");
          document.documentElement.style.removeProperty("--primary-hover");
          document.documentElement.style.removeProperty("--primary-light");
          document.documentElement.style.removeProperty("--theme-color");
          document.documentElement.style.removeProperty("--theme-color-hover");
          document.documentElement.style.removeProperty("--theme-color-light");
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
