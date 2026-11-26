"use client";

import React, { useEffect, useRef } from "react";
import { X, Sparkles, AlertTriangle } from "lucide-react";
import { FragranceType, FRAGRANCE_TYPE_LABELS } from "@/types/perfume";

interface FragranceTypeHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

interface FragranceTypeDetail {
  type: FragranceType;
  title: string;
  concentration: string;
  description: string;
  safetyNote?: string;
}

const FRAGRANCE_DETAILS: FragranceTypeDetail[] = [
  {
    type: "extrait_de_parfum",
    title: "Extrait de Parfum",
    concentration: "20% – 40% Oil Concentration",
    description:
      "The pinnacle of haute perfumery. Exceptionally rich and concentrated, it lingers on skin for 12+ hours with an intimate, luxurious aura.",
  },
  {
    type: "eau_de_parfum",
    title: "Eau de Parfum (EDP)",
    concentration: "15% – 20% Oil Concentration",
    description:
      "A harmonious balance of vibrant projection and lasting depth. Offers 6 to 8 hours of enduring sillage for day-to-evening presence.",
  },
  {
    type: "eau_de_toilette",
    title: "Eau de Toilette (EDT)",
    concentration: "5% – 15% Oil Concentration",
    description:
      "Lighter and brisk with prominent top notes. Ideal for daytime wear, warm weather, or casual daily refreshment lasting 3 to 5 hours.",
  },
  {
    type: "perfume_oil",
    title: "Perfume Oil (Attar)",
    concentration: "Pure Botanical / Amber Base (Alcohol-Free)",
    description:
      "Alcohol-free and applied directly to pulse points. Melts warmly into your skin for an intimate, deeply personal scent profile.",
  },
  {
    type: "bakhoor",
    title: "Bakhoor",
    concentration: "Incense & Fragrant Wood Chips",
    description:
      "Traditional wood chips infused with precious oils and natural resins, gently warmed on charcoal or electric burners to perfume living spaces and garments.",
    safetyNote: "Burn only on heat-resistant burners. Keep away from flammable materials and never leave unattended.",
  },
  {
    type: "body_splash",
    title: "Body Splash / Mist",
    concentration: "1% – 3% Fragrance Essence",
    description:
      "An ultra-sheer, refreshing body mist crafted for generous all-over spritzing after bathing or whenever you crave a subtle touch of fragrance.",
  },
];

export default function FragranceTypeHelpModal({
  isOpen,
  onClose,
  triggerRef,
}: FragranceTypeHelpModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous overflow style and lock body scroll
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus modal container on open
    modalRef.current?.focus();

    // Escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      // Restore focus to trigger element if available
      triggerRef?.current?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fragrance-types-title"
      className="fixed inset-0 z-50 bg-midnight/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-plum/95 border border-gold/30 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-glow my-auto focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gold/15 pb-4 mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-medium">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Aura Fragrance Guide</span>
            </div>
            <h2
              id="fragrance-types-title"
              className="font-serif text-2xl text-softwhite font-medium"
            >
              Fragrance Types Explained
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-muted hover:text-gold hover:bg-midnight/60 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {FRAGRANCE_DETAILS.map((item) => (
            <div
              key={item.type}
              className="p-3.5 rounded-xl bg-midnight/70 border border-gold/15 space-y-1.5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <h3 className="font-serif text-sm font-semibold text-softwhite">
                  {item.title}
                </h3>
                <span className="text-[10px] uppercase font-mono tracking-wider text-gold">
                  {item.concentration}
                </span>
              </div>
              <p className="text-xs text-stone-muted leading-relaxed">
                {item.description}
              </p>
              {item.safetyNote && (
                <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-clay/15 border border-clay/30 text-[11px] text-softwhite/90">
                  <AlertTriangle className="w-3.5 h-3.5 text-clay flex-shrink-0 mt-0.5" />
                  <span>{item.safetyNote}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-gold/15 flex items-center justify-between text-xs">
          <span className="text-stone-muted text-[11px]">
            Concentrations are approximate artisanal guidelines.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[36px] px-5 rounded-full bg-gold hover:bg-gold-light text-midnight font-medium text-xs uppercase tracking-wider shadow-glow transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
