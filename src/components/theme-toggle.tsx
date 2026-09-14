"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-white transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-black transition-transform duration-300 hover:-rotate-12" />
      )}
    </Button>
  );
}

