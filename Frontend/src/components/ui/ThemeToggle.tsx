"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SparkleStar({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Precision 4-pointed luxury star / astroid */}
      <path d="M12 1.5C12 7.2 7.2 12 1.5 12C7.2 12 12 16.8 12 22.5C12 16.8 16.8 12 22.5 12C16.8 12 12 7.2 12 1.5Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"night" | "day">("night");
  const [mounted, setMounted] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(
    null
  );
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check reduced motion
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
    localStorage.setItem("aura_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);

    // Trigger radial ripple from the button position
    if (toggleRef.current && !prefersReducedMotion) {
      const rect = toggleRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setRipple({ x, y, id: Date.now() });
      setTimeout(() => setRipple(null), 850);
    }
  };

  const isDay = theme === "day";

  if (!mounted) {
    return (
      <div className="w-14 h-7 rounded-full bg-plum/70 border border-gold/30 opacity-60" />
    );
  }

  return (
    <>
      {/* Light Radial Ripple expanding across screen on toggle */}
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
              width: "48px",
              height: "48px",
              marginLeft: "-24px",
              marginTop: "-24px",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 9999,
              background: isDay
                ? "radial-gradient(circle, rgba(250, 246, 240, 0.9) 0%, rgba(201, 166, 107, 0.35) 45%, transparent 70%)"
                : "radial-gradient(circle, rgba(14, 11, 16, 0.9) 0%, rgba(26, 20, 31, 0.45) 45%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Pill-shaped luxury theme switch */}
      <button
        ref={toggleRef}
        type="button"
        role="switch"
        aria-checked={isDay}
        aria-label={`Switch to ${isDay ? "Night" : "Day"} mode`}
        onClick={handleToggle}
        className={`relative inline-flex items-center w-14 h-7 rounded-full transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
          isDay
            ? "bg-[#EFE8DD] border border-[#B38947]/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
            : "bg-[#1A141F] border border-gold/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
        }`}
      >
        {/* Subtle background track labels */}
        <span
          className={`absolute left-1.5 text-[8px] font-serif uppercase tracking-widest transition-opacity duration-300 select-none ${
            isDay ? "opacity-0" : "text-gold/70 opacity-100"
          }`}
        >
          PM
        </span>
        <span
          className={`absolute right-1.5 text-[8px] font-serif uppercase tracking-widest transition-opacity duration-300 select-none ${
            isDay ? "text-[#B38947] opacity-100" : "opacity-0"
          }`}
        >
          AM
        </span>

        {/* Knob: Four-pointed sparkle star with Framer Motion 180° rotation and glowing aura */}
        <motion.div
          animate={{
            x: isDay ? 30 : 3,
            rotate: isDay ? 180 : 0,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }
          }
          className={`relative w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-500 ${
            isDay
              ? "bg-[#FAF6F0] text-[#B38947] shadow-[0_0_12px_rgba(179,137,71,0.6)]"
              : "bg-[#0E0B10] text-gold shadow-[0_0_10px_rgba(201,166,107,0.5)]"
          }`}
        >
          <SparkleStar className="w-3.5 h-3.5 drop-shadow-[0_0_3px_currentColor]" />
        </motion.div>
      </button>
    </>
  );
}
