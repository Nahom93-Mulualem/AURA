"use client";

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface ParticleFieldProps {
  className?: string;
}

export default function ParticleField({ className = "" }: { className?: string }) {
  const { theme } = useTheme();
  const isDay = theme === "day";
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);

    return () => {
      window.removeEventListener("resize", checkMobile);
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  // Limit particle count on mobile (8 particles) vs desktop (18 particles) for GPU efficiency
  const particleCount = isMobile ? 8 : 18;

  // Generate deterministic randomized particle paths
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const size = 3 + (i % 4) * 2; // 3px to 9px
      const startX = 10 + ((i * 37) % 80); // 10% to 90%
      const startY = 15 + ((i * 43) % 75); // 15% to 90%
      const driftX = ((i % 2 === 0 ? 1 : -1) * (15 + (i * 7) % 35));
      const driftY = - (25 + (i * 9) % 45);
      const duration = 2.4 + (i % 5) * 0.7; // 2.4s to 5.2s
      const delay = (i * 0.18) % 1.6;
      return { id: i, size, startX, startY, driftX, driftY, duration, delay };
    });
  }, []);

  const activeParticles = particles.slice(0, particleCount);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-20 ${className}`}
      aria-hidden="true"
    >
      {/* Ambient mist glow backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDay
            ? "bg-gradient-to-t from-gold/15 via-gold/5 to-transparent opacity-80"
            : "bg-gradient-to-t from-white/10 via-plum/30 to-transparent opacity-60"
        }`}
      />

      {activeParticles.map((p) => {
        if (prefersReducedMotion) {
          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.startX}%`,
                top: `${p.startY}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: "50%",
                background: isDay
                  ? "radial-gradient(circle, #DFBF8B 0%, #C9A66B 60%, transparent 100%)"
                  : "radial-gradient(circle, #FFFFFF 0%, #C0D0E5 60%, transparent 100%)",
                opacity: 0.4,
              }}
            />
          );
        }

        return (
          <motion.div
            key={p.id}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0.6,
              rotate: 0,
            }}
            animate={{
              x: [0, p.driftX * 0.5, p.driftX],
              y: [0, p.driftY * 0.5, p.driftY],
              opacity: [0, 0.85, 0.8, 0],
              scale: [0.6, 1.25, 0.9, 0.4],
              rotate: [0, 90, 180],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              left: `${p.startX}%`,
              top: `${p.startY}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              willChange: "transform, opacity",
            }}
          >
            {/* Day: Golden mist / pollen petal. Night: Silver sparkle star droplet */}
            {isDay ? (
              <div
                className="w-full h-full rounded-full shadow-[0_0_8px_rgba(201,166,107,0.8)]"
                style={{
                  background:
                    "radial-gradient(circle, #F8E7C8 0%, #C9A66B 70%, transparent 100%)",
                }}
              />
            ) : (
              <div
                className="w-full h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                style={{
                  background:
                    "radial-gradient(circle, #FFFFFF 0%, #B8D0EB 60%, transparent 100%)",
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
