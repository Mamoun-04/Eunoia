// /hooks/use-theme.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "sunset" | "beach" | "forest" | "ocean" | "midnight";

type ThemeStore = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => {
        const themes: Theme[] = ["light", "dark", "sunset", "beach", "forest", "ocean", "midnight"];
        // Remove all theme classes from the root element.
        themes.forEach((t) => document.documentElement.classList.remove(t));
        // Add the new theme class.
        document.documentElement.classList.add(theme);
        set({ theme });
      },
    }),
    {
      name: "theme-storage",
    }
  )
);
