"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateThemeState = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateThemeState();

    window.addEventListener("aaroh_theme_change", updateThemeState);
    return () => {
      window.removeEventListener("aaroh_theme_change", updateThemeState);
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("aaroh_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("aaroh_theme", "light");
    }
    setIsDark(nextDark);
    window.dispatchEvent(new Event("aaroh_theme_change"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-surface-interactive hover:bg-border-subtle text-text-muted hover:text-text-primary border border-border-subtle transition-colors flex items-center justify-center cursor-pointer shadow-sm"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-brand" /> : <Moon className="w-4 h-4 text-brand-primary" />}
    </button>
  );
}
