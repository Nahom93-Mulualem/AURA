"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

const STORAGE_KEY = "aura-theme";
const LEGACY_STORAGE_KEY = "aura_theme";

function applyThemeToDOM(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", theme === "dark" ? "#0E0B10" : "#FAF6F0");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // 1. Check saved theme (primary key 'aura-theme', fallback 'aura_theme')
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    if (saved === "dark" || saved === "night") {
      setThemeState("dark");
      applyThemeToDOM("dark");
    } else if (saved === "light" || saved === "day") {
      setThemeState("light");
      applyThemeToDOM("light");
    } else {
      // 2. No saved preference: follow system preference
      const systemTheme: Theme = mediaQuery.matches ? "dark" : "light";
      setThemeState(systemTheme);
      applyThemeToDOM(systemTheme);
    }

    // 3. Live system preference change listener when nothing is saved
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const currentSaved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!currentSaved) {
        const nextTheme: Theme = e.matches ? "dark" : "light";
        setThemeState(nextTheme);
        applyThemeToDOM(nextTheme);
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    // 4. Cross-tab storage listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === LEGACY_STORAGE_KEY) {
        const val = e.newValue;
        if (val === "dark" || val === "night") {
          setThemeState("dark");
          applyThemeToDOM("dark");
        } else if (val === "light" || val === "day") {
          setThemeState("light");
          applyThemeToDOM("light");
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    // Trigger transition class on user action
    const html = document.documentElement;
    html.classList.add("theme-transition");
    setThemeState(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyThemeToDOM(nextTheme);

    window.setTimeout(() => {
      html.classList.remove("theme-transition");
    }, 300);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
