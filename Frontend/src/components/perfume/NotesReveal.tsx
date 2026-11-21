"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { ScentNotes } from "@/types/perfume";
import { Sparkles, Heart, Flame } from "lucide-react";

interface NotesRevealProps {
  notes: ScentNotes;
  perfumeName: string;
}

export default function NotesReveal({ notes, perfumeName }: NotesRevealProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0.2 }
        : {
            staggerChildren: 0.12,
            delayChildren: 0.05,
          },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-0 z-30 flex flex-col justify-between p-5 bg-midnight/90 backdrop-blur-md rounded-t-card overflow-hidden"
    >
      {/* Header Label */}
      <motion.div variants={itemVariants} className="border-b border-gold/20 pb-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium block">
          Olfactory Structure
        </span>
        <h4 className="font-serif text-base text-softwhite font-medium truncate">
          {perfumeName} Notes
        </h4>
      </motion.div>

      {/* Staggered Scent Pyramid Tiers */}
      <div className="space-y-3.5 my-auto py-1">
        {/* Top Notes Tier */}
        <motion.div variants={itemVariants} className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold font-semibold">
            <Sparkles className="w-3 h-3 text-gold" />
            <span>Top Notes (First Impression)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {notes.top.map((note) => (
              <span
                key={note}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-plum/90 border border-gold/30 text-softwhite shadow-sm"
              >
                {note}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Heart Notes Tier */}
        <motion.div variants={itemVariants} className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-rose-dust font-semibold">
            <Heart className="w-3 h-3 text-rose-dust" />
            <span>Heart Notes (Core Character)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {notes.heart.map((note) => (
              <span
                key={note}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-plum/90 border border-rose-dust/30 text-softwhite shadow-sm"
              >
                {note}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Base Notes Tier */}
        <motion.div variants={itemVariants} className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold-light font-semibold">
            <Flame className="w-3 h-3 text-gold-light" />
            <span>Base Notes (Lingering Aura)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {notes.base.map((note) => (
              <span
                key={note}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-plum/90 border border-gold/30 text-softwhite shadow-sm"
              >
                {note}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer prompt */}
      <motion.div
        variants={itemVariants}
        className="pt-2 border-t border-gold/15 flex items-center justify-between text-[10px] text-stone-muted"
      >
        <span>Toggle back to view bottle</span>
        <span className="text-gold uppercase tracking-wider">Aura Atelier</span>
      </motion.div>
    </motion.div>
  );
}
