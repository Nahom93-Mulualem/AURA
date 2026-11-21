"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export function SparkleStar({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Four-pointed sparkle star with precision concave curved edges */}
      <path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, toggleTheme, ripple } = useTheme();
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

  const isDay = theme === "day";

  if (!mounted) {
    return (
      <div className="w-[58px] h-[30px] rounded-full bg-plum/70 border border-gold/30 opacity-60" />
    );
  }

  return (
    <>
      {/* Soft Radial Light Ripple spreading outward from toggle across page */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 85, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1] as const,
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
                ? "radial-gradient(circle, rgba(250, 246, 240, 0.95) 0%, rgba(201, 166, 107, 0.35) 40%, transparent 70%)"
                : "radial-gradient(circle, rgba(14, 11, 16, 0.95) 0%, rgba(26, 20, 31, 0.5) 40%, transparent 70%)",
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
        onClick={(e) => toggleTheme(e)}
        className={`relative inline-flex items-center w-[58px] h-[30px] rounded-full p-1 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
          isDay
            ? "bg-[#EFE8DD] border border-[#B38947]/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
            : "bg-[#1A141F] border border-gold/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
        }`}
        title={`Switch to ${isDay ? "Night" : "Day"} mode`}
      >
        {/* Subtle pill background cues */}
        <span
          className={`absolute left-2 text-[9px] font-serif uppercase tracking-widest transition-opacity duration-300 select-none ${
            isDay ? "opacity-0" : "text-gold/70 opacity-100"
          }`}
        >
          PM
        </span>
        <span
          className={`absolute right-2 text-[9px] font-serif uppercase tracking-widest transition-opacity duration-300 select-none ${
            isDay ? "text-[#B38947] opacity-100" : "opacity-0"
          }`}
        >
          AM
        </span>

        {/* Knob: Four-pointed sparkle star with concave edges */}
        <motion.div
          animate={{
            x: isDay ? 28 : 0,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                }
          }
          className="relative z-10 w-5 h-5 rounded-full flex items-center justify-center"
        >
          <motion.div
            animate={{
              rotate: isDay ? 180 : 0,
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 280,
                    damping: 20,
                  }
            }
            className={`w-full h-full rounded-full flex items-center justify-center transition-colors duration-500 ${
              isDay
                ? "bg-[#FAF6F0] text-[#B38947] shadow-[0_0_12px_rgba(179,137,71,0.7)]"
                : "bg-[#0E0B10] text-gold shadow-[0_0_12px_rgba(201,166,107,0.6)]"
            }`}
          >
            <SparkleStar className="w-3.5 h-3.5 drop-shadow-[0_0_4px_currentColor]" />
          </motion.div>
        </motion.div>
      </button>
    </>
  );
}
