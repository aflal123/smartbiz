"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-xl border border-slate-700/60 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 transition-all cursor-pointer"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-blue-400 transition-transform duration-300 hover:-rotate-12" />
      )}
    </Button>
  );
}
