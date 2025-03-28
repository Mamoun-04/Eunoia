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
  | "midnight"
  | "olive"
  | "rose"
  | "ocean";

// Categorize themes as free or premium
export const themeCategories = {
  free: ["light", "dark"] as ThemeType[],
  premium: [
    "serenity", 
    "midnight", 
    "olive", 
    "rose", 
    "ocean"
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
  midnight: {
    primary: "#7E57C2",
    background: "#1A1A2E",
    text: "#E0E0E0",
  },
  olive: {
    primary: "#7CB342",
    background: "#333C33",
    text: "#E8F5E9",
  },
  rose: {
    primary: "#EC407A",
    background: "#FFF1F2",
    text: "#4A2932",
  },
  ocean: {
    primary: "#26A69A",
    background: "#0A2E36",
    text: "#E0F2F1",
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
      "theme-midnight",
      "theme-olive",
      "theme-rose",
      "theme-ocean"
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
