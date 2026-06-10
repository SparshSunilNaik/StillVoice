"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group inline-flex size-10 items-center justify-center rounded-full border border-neutral-200/80 bg-white/55 text-neutral-500 shadow-sm shadow-neutral-950/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-400 dark:shadow-black/20 dark:hover:border-white/18 dark:hover:bg-white/[0.08] dark:hover:text-stone-100 dark:focus-visible:ring-white/20"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="size-4" strokeWidth={1.7} /> : <Moon className="size-4" strokeWidth={1.7} />}
    </button>
  );
}
