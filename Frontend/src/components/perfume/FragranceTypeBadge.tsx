"use client";

import React, { useState, useRef } from "react";
import { HelpCircle } from "lucide-react";
import {
  FragranceType,
  CATEGORY_LABELS,
  FRAGRANCE_TYPE_LABELS,
} from "@/types/perfume";
import FragranceTypeHelpModal from "./FragranceTypeHelpModal";

interface FragranceTypeBadgeProps {
  category: string;
  fragranceType?: string;
  sizeMl: string | number;
}

export default function FragranceTypeBadge({
  category,
  fragranceType,
  sizeMl,
}: FragranceTypeBadgeProps) {
  const [showModal, setShowModal] = useState(false);
  const helpTriggerRef = useRef<HTMLButtonElement>(null);

  const categoryLabel = CATEGORY_LABELS[category] || category;
  const typeLabel = fragranceType
    ? FRAGRANCE_TYPE_LABELS[fragranceType as FragranceType] || fragranceType
    : "";
  const sizeFormatted = String(sizeMl).includes("ml") ? sizeMl : `${sizeMl}ml`;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
      {typeLabel && (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-semibold bg-gold/15 text-gold border border-gold/30">
          {typeLabel}
        </span>
      )}

      <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium capitalize">
        {categoryLabel}
      </span>

      <span className="w-1 h-1 rounded-full bg-gold/40" />
      <span className="text-xs text-stone-muted">{sizeFormatted}</span>

      {typeLabel && (
        <button
          ref={helpTriggerRef}
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1 text-[11px] text-stone-muted hover:text-gold transition-colors ml-1 focus:outline-none focus-visible:underline"
          title="What does this fragrance type mean?"
        >
          <HelpCircle className="w-3 h-3 text-gold/80" />
          <span className="hidden sm:inline">Guide</span>
        </button>
      )}

      <FragranceTypeHelpModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        triggerRef={helpTriggerRef}
      />
    </div>
  );
}
