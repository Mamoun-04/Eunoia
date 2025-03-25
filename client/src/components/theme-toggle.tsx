// /components/theme-toggle.tsx
import { useTheme, Theme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  premium: boolean; // true if the user is premium
}

export function ThemeToggle({ premium }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  // All themes available.
  const allThemes: Theme[] = ["light", "dark", "sunset", "beach", "forest", "ocean", "midnight"];

  // For free users, only light and dark are enabled.
  const enabledForFree: Theme[] = ["light", "dark"];

  return (
    <div className="flex flex-col items-end">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="rounded border border-gray-300 p-2 bg-background text-foreground"
      >
        {allThemes.map((t) => (
          <option
            key={t}
            value={t}
            disabled={!premium && !enabledForFree.includes(t)}
            className={!premium && !enabledForFree.includes(t) ? "text-gray-400" : ""}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
      {!premium && (
        <span className="mt-1 text-xs text-gray-500">
          Upgrade to Premium for more themes
        </span>
      )}
    </div>
  );
}
