"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "night" | "day";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: React.MouseEvent) => void;
  ripple: { x: number; y: number; id: number } | null;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "night",
  toggleTheme: () => {},
  ripple: null,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("night");
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(
    null
  );

  useEffect(() => {
    // Check localStorage first, then fallback to system preference
    const saved = localStorage.getItem("aura_theme") as Theme | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      const initial = prefersLight ? "day" : "night";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    }
  }, []);

  const toggleTheme = (e?: React.MouseEvent) => {
    const nextTheme: Theme = theme === "night" ? "day" : "night";
    setTheme(nextTheme);
    localStorage.setItem("aura_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);

    // If an event is provided and reduced motion is false, compute ripple origin
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!prefersReducedMotion) {
      let x = window.innerWidth / 2;
      let y = 60;
      if (e?.currentTarget) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
      setRipple({ x, y, id: Date.now() });
      setTimeout(() => setRipple(null), 850);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, ripple }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
