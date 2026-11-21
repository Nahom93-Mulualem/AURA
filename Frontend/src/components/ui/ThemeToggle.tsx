"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"night" | "day">("night");
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(
    null
  );
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", motionListener);

    // Persisted theme in localStorage
    const savedTheme = localStorage.getItem("aura_theme") as "night" | "day" | null;
    const initialTheme = savedTheme || "night";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    return () => mediaQuery.removeEventListener("change", motionListener);
  }, []);

  const handleToggle = () => {
    const nextTheme = theme === "night" ? "day" : "night";
    setTheme(nextTheme);
    setIsAnimating(true);
    localStorage.setItem("aura_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);

    // Trigger radial ripple across the page from button center
    if (toggleRef.current && !prefersReducedMotion) {
      const rect = toggleRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setRipple({ x, y, id: Date.now() });
      setTimeout(() => setRipple(null), 850);
    }

    setTimeout(() => setIsAnimating(false), 700);
  };

  const isDay = theme === "day";

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full border border-white/20 bg-black/60 opacity-60" />
    );
  }

  return (
    <>
      {/* Light Radial Ripple spreading across screen */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.65 }}
            animate={{ scale: 80, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: "fixed",
              top: ripple.y,
              left: ripple.x,
              width: "44px",
              height: "44px",
              marginLeft: "-22px",
              marginTop: "-22px",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 9999,
              background: isDay
                ? "radial-gradient(circle, rgba(250, 246, 240, 0.95) 0%, rgba(201, 166, 107, 0.3) 45%, transparent 70%)"
                : "radial-gradient(circle, rgba(14, 11, 16, 0.95) 0%, rgba(26, 20, 31, 0.45) 45%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Yin-Yang Circular Emblem Switch */}
      <button
        ref={toggleRef}
        type="button"
        role="switch"
        aria-checked={isDay}
        aria-label={`Toggle theme (currently ${isDay ? "Day" : "Night"} mode)`}
        onClick={handleToggle}
        className="group relative w-10 h-10 rounded-full flex items-center justify-center p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all duration-300 hover:scale-105"
        title={`Switch to ${isDay ? "Night" : "Day"} mode`}
      >
        {/* Subtle monochrome halo ring */}
        <div
          className={`absolute -inset-1 rounded-full transition-all duration-500 blur-sm pointer-events-none ${
            isDay
              ? "bg-black/15 group-hover:bg-black/25"
              : "bg-white/20 group-hover:bg-white/35 shadow-[0_0_12px_rgba(255,255,255,0.4)]"
          }`}
        />

        {/* Circular Emblem Track */}
        <div
          className={`relative w-full h-full rounded-full overflow-hidden border transition-colors duration-700 flex items-center justify-center ${
            isDay
              ? "bg-[#FAF6F0] border-black/30 shadow-md"
              : "bg-black border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          }`}
        >
          {/* Rotating and Morphing Crescents (Yin-Yang Style) */}
          <motion.div
            animate={{
              rotate: isDay ? 180 : 0,
              scale: isAnimating && !prefersReducedMotion ? [1, 0.9, 1.06, 1] : 1,
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 180,
                    damping: 14,
                    mass: 0.9,
                  }
            }
            className="w-full h-full flex items-center justify-center"
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Crescent 1: Upper Swirling Wing */}
              <motion.path
                d="M 50 6 A 44 44 0 0 0 10 50 A 44 44 0 0 0 32 87 C 18 70 18 46 32 32 C 42 22 48 14 50 6 Z"
                fill={isDay ? "#1D1A1F" : "#FFFFFF"}
                animate={{
                  opacity: isAnimating ? [1, 0.8, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Crescent 2: Lower Swirling Wing */}
              <motion.path
                d="M 50 94 A 44 44 0 0 0 90 50 A 44 44 0 0 0 68 13 C 82 30 82 54 68 68 C 58 78 52 86 50 94 Z"
                fill={isDay ? "#1D1A1F" : "#FFFFFF"}
                animate={{
                  opacity: isAnimating ? [1, 0.8, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Flowing Inner Arcs embracing the center */}
              <path
                d="M 32 32 C 45 42 55 42 68 68"
                stroke={isDay ? "#1D1A1F" : "#FFFFFF"}
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
            </svg>
          </motion.div>

          {/* Sparkle Star at the Center that Pulses Once on Click */}
          <motion.div
            key={`star-${theme}`}
            animate={
              prefersReducedMotion
                ? { scale: 1 }
                : {
                    scale: isAnimating ? [1, 1.7, 1] : 1,
                    rotate: isDay ? 90 : 0,
                  }
            }
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 m-auto w-4 h-4 flex items-center justify-center pointer-events-none"
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-3.5 h-3.5 ${
                isDay
                  ? "text-[#1D1A1F] drop-shadow-[0_0_4px_rgba(29,26,31,0.5)]"
                  : "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
              }`}
              fill="currentColor"
            >
              {/* Precision 4-pointed luxury star */}
              <path d="M12 1.5C12 7.2 7.2 12 1.5 12C7.2 12 12 16.8 12 22.5C12 16.8 16.8 12 22.5 12C16.8 12 12 7.2 12 1.5Z" />
            </svg>
          </motion.div>
        </div>
      </button>
    </>
  );
}
