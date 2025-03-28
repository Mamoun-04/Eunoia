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
  | "serenity"
  | "sage"
  | "lavender"
  | "rose"
  | "amber"
  | "midnight"
  | "forest"
  | "nebula";

// Categorize themes as free or premium
export const themeCategories = {
  free: ["light", "dark"] as ThemeType[],
  premium: [
    "serenity", 
    "sage", 
    "lavender", 
    "rose", 
    "amber",
    "midnight",
    "forest",
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
  serenity: {
    primary: "#64B5F6",
    background: "#ECEFF1",
    text: "#37474F",
  },
  sage: {
    primary: "#6B9080",
    background: "#EAF4F4",
    text: "#344E41",
  },
  lavender: {
    primary: "#9C80D7",
    background: "#F7F4FC",
    text: "#4A3D68",
  },
  rose: {
    primary: "#EC407A",
    background: "#FFF1F2",
    text: "#4A2932",
  },
  amber: {
    primary: "#F59E0B",
    background: "#FFFBEB",
    text: "#713F12",
  },
  midnight: {
    primary: "#3B82F6",
    background: "#0F172A",
    text: "#E2E8F0",
  },
  forest: {
    primary: "#059669",
    background: "#14261D",
    text: "#D1FAE5",
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
      "theme-serenity",
      "theme-sage",
      "theme-lavender",
      "theme-rose",
      "theme-amber",
      "theme-midnight",
      "theme-forest",
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
