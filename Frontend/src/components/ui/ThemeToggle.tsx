"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const isDark = theme === "dark";

  // Prevent layout shift during hydration, matching target dimensions
  if (!mounted) {
    return (
      <div className={`w-11 h-11 flex items-center justify-center ${className}`}>
        <div className="w-[54px] h-[28px] rounded-full bg-plum/70 border border-gold/30 opacity-60" />
      </div>
    );
  }

  return (
    <button
      ref={toggleRef}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      onClick={toggleTheme}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggleTheme();
        }
      }}
      className={`group relative inline-flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-midnight ${className}`}
    >
      {/* Visual pill track: 54px wide x 28px high, border-box */}
      <span
        className={`relative inline-block w-[54px] h-[28px] rounded-full transition-colors duration-300 border ${
          isDark
            ? "bg-[#1A141F] border-gold/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
            : "bg-[#F3EDE4] border-[#8A6A32]/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
        }`}
      >
        {/* Sliding 22px Knob with 2px margins on all sides (x: 2px for Light, x: 26px for Dark inside 52px content width) */}
        <motion.span
          initial={false}
          animate={{
            x: isDark ? 26 : 2,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }
          }
          className={`absolute top-[2px] w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-md transition-colors duration-300 ${isDark
            ? "bg-[#0E0B10] text-gold border border-gold/40 shadow-[0_0_8px_rgba(201,166,107,0.4)]"
            : visualDark
              ? "bg-[#0E0B10] text-gold border border-gold/40 shadow-[0_0_8px_rgba(201,166,107,0.4)]"
              : "bg-[#FAF6F0] text-[#8A6A32] border border-[#8A6A32]/30 shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
            }`}
          aria-hidden="true"
        >
          {isDark ? (
            <Moon className="w-3 h-3 stroke-[2.2]" />
          ) : (
            <Sun className="w-3 h-3 stroke-[2.2]" />
          )}
        </motion.span>
      </span>
    </button>
  );
}
