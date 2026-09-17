"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Pure Black & White Shadcn Theme Toggle Icon Button
 * Uses the signature Shadcn rotating and scaling Sun/Moon icon transition.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "relative h-9 w-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white opacity-60 cursor-default",
          className
        )}
        aria-label="Toggle Theme"
      >
        <span className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all cursor-pointer shadow-xs active:scale-95 focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white",
        className
      )}
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle Theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0 text-black dark:text-white" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100 text-black dark:text-white" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

/**
 * Pure Black & White Shadcn Segmented Theme Switch
 * Perfect for settings, profile, or modal dialogs.
 */
export function ThemeToggleSegmented({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 p-1 text-xs",
          className
        )}
      >
        <div className="h-7 w-16" />
        <div className="h-7 w-16" />
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Select color theme"
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 p-1 text-xs font-medium",
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={theme === "light"}
        onClick={() => setTheme("light")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer select-none",
          theme === "light"
            ? "bg-white text-black font-semibold shadow-xs"
            : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
        )}
      >
        <Sun className="h-3.5 w-3.5" />
        <span>Light</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === "dark"}
        onClick={() => setTheme("dark")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer select-none",
          theme === "dark"
            ? "bg-black text-white font-semibold shadow-xs border border-neutral-800"
            : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
        )}
      >
        <Moon className="h-3.5 w-3.5" />
        <span>Dark</span>
      </button>
    </div>
  );
}

