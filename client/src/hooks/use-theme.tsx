import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./use-auth";

// Define all available themes
export type ThemeType =
  | "light"
  | "dark"
  | "sunset"
  | "forest"
  | "ocean"
  | "beach"
  | "midnight"
  | "aurora"
  | "cosmic"
  | "lagoon"
  | "ember"
  | "nebula";

// Categorize themes as free or premium
export const themeCategories = {
  free: ["light", "dark"] as ThemeType[],
  premium: [
    "sunset", 
    "forest", 
    "ocean", 
    "beach", 
    "midnight",
    "aurora",
    "cosmic",
    "lagoon",
    "ember",
    "nebula"
  ] as ThemeType[],
};

// Theme colors configuration
export const themeColors = {
  light: {
    primary: "#0000CC",
    background: "#ffffff",
    text: "#000000",
  },
  dark: {
    primary: "#6666FF",
    background: "#121212",
    text: "#ffffff",
  },
  sunset: {
    primary: "#FF5733",
    background: "#1F1A38",
    text: "#F8C471",
  },
  forest: {
    primary: "#2ECC71",
    background: "#1E3D2F",
    text: "#A9DFBF",
  },
  ocean: {
    primary: "#3498DB",
    background: "#1A2930",
    text: "#85C1E9",
  },
  beach: {
    primary: "#F4D03F",
    background: "#F5F5DC",
    text: "#6E7F80",
  },
  midnight: {
    primary: "#9B59B6",
    background: "#0A0A2A",
    text: "#D2B4DE",
  },
  aurora: {
    primary: "#4CAF50",
    background: "#0D1117",
    text: "#AAFFAA",
  },
  cosmic: {
    primary: "#EC407A",
    background: "#050520",
    text: "#FDA7DF",
  },
  lagoon: {
    primary: "#00BCD4",
    background: "#0F3443",
    text: "#AEECEF",
  },
  ember: {
    primary: "#FF5722",
    background: "#1C0B09",
    text: "#FFAB91",
  },
  nebula: {
    primary: "#673AB7",
    background: "#13111C",
    text: "#D1C4E9",
  },
};

// Zustand store for base theme persistence
type ThemeStoreType = {
  currentTheme: ThemeType;
  setCurrentTheme: (theme: ThemeType) => void;
};

// Create the base theme store
const useThemeStore = create<ThemeStoreType>()(
  persist(
    (set) => ({
      currentTheme: "light",
      setCurrentTheme: (theme) => set({ currentTheme: theme }),
    }),
    {
      name: "theme-storage",
    },
  ),
);

// Context type for the theme provider
type ThemeContextType = {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  availableThemes: ThemeType[];
  isPremiumTheme: (theme: ThemeType) => boolean;
  isPremium: boolean;
  showUpgradeDialog: boolean;
  setShowUpgradeDialog: (show: boolean) => void;
};

// Create the context
const ThemeContext = createContext<ThemeContextType | null>(null);

// Theme provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { currentTheme, setCurrentTheme } = useThemeStore();
  const { user } = useAuth();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Determine if user is premium based on subscription status
  const isPremium = user?.subscriptionStatus === "active";

  // Available themes based on subscription status
  const availableThemes: ThemeType[] = [
    ...themeCategories.free,
    ...(isPremium ? themeCategories.premium : []),
  ];

  // Check if a theme is premium
  const isPremiumTheme = (theme: ThemeType): boolean => {
    return themeCategories.premium.includes(theme);
  };

  // Handle theme change
  const setTheme = (newTheme: ThemeType) => {
    // If trying to set a premium theme but user is not premium
    if (isPremiumTheme(newTheme) && !isPremium) {
      setShowUpgradeDialog(true);
      return;
    }

    setCurrentTheme(newTheme);
  };

  // Apply the theme when the component mounts or theme changes
  useEffect(() => {
    // If user has a premium theme but is no longer premium, reset to light theme
    if (isPremiumTheme(currentTheme) && !isPremium) {
      setCurrentTheme("light");
      return;
    }

    // Apply the CSS classes for theming
    document.documentElement.classList.remove(
      "dark",
      "theme-sunset",
      "theme-forest",
      "theme-ocean",
      "theme-beach",
      "theme-midnight",
      "theme-aurora",
      "theme-cosmic",
      "theme-lagoon",
      "theme-ember",
      "theme-nebula"
    );

    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (currentTheme !== "light") {
      document.documentElement.classList.add(`theme-${currentTheme}`);
    }
  }, [currentTheme, isPremium, setCurrentTheme]);

  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes,
    isPremiumTheme,
    isPremium,
    showUpgradeDialog,
    setShowUpgradeDialog,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
