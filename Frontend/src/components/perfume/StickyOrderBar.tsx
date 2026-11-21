"use client";

import React from "react";
import { Send, Instagram, Phone } from "lucide-react";
import { Perfume } from "@/types/perfume";
import { BRAND_CONTACT } from "@/data/mockPerfumes";
import { formatPrice } from "@/lib/utils";

interface StickyOrderBarProps {
  perfume: Perfume;
}

export default function StickyOrderBar({ perfume }: StickyOrderBarProps) {
  const isAvailable = perfume.status !== "sold_out";

  // Prefilled message for social channels
  const message = encodeURIComponent(
    `Hi HANI! I am interested in ordering ${perfume.name} (${perfume.sizeMl}ml - ${formatPrice(perfume.price)}). Is this currently in stock?`
  );

  const telegramUrl = `${BRAND_CONTACT.telegram}?text=${message}`;
  const instagramUrl = `${BRAND_CONTACT.instagram}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-midnight/95 backdrop-blur-md border-t border-gold/30 p-3 sm:hidden shadow-glow">
      <div className="flex items-center justify-between gap-3 max-w-[375px] mx-auto">
        <div className="flex flex-col">
          <span className="font-serif text-sm font-medium text-softwhite truncate max-w-[130px]">
            {perfume.name}
          </span>
          <span className="font-mono text-xs text-gold font-semibold">
            {formatPrice(perfume.price)}
          </span>
        </div>

        {isAvailable ? (
          <div className="flex items-center gap-2">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 rounded-full bg-gold text-midnight font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-glow active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5 fill-midnight" />
              <span>Order on TG</span>
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Order on Instagram"
              className="min-h-[44px] min-w-[44px] rounded-full bg-plum border border-rose-dust/40 text-rose-dust flex items-center justify-center active:scale-95 transition-all"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="min-h-[44px] px-4 rounded-full bg-clay/20 border border-clay/40 text-clay text-xs uppercase tracking-wider font-semibold flex items-center justify-center">
            Sold Out
          </div>
        )}
      </div>
    </div>
  );
}
