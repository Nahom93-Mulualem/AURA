import React from "react";
import { ScentNotes } from "@/types/perfume";
import { Sparkles, Heart, Flame } from "lucide-react";

interface NotesPyramidProps {
  notes: ScentNotes;
}

export default function NotesPyramid({ notes }: NotesPyramidProps) {
  const hasTop = notes.top && notes.top.length > 0;
  const hasHeart = notes.heart && notes.heart.length > 0;
  const hasBase = notes.base && notes.base.length > 0;

  if (!hasTop && !hasHeart && !hasBase) return null;

  return (
    <div className="rounded-xl bg-plum/40 border border-gold/15 p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-gold/10 pb-2.5 mb-1">
        <h3 className="font-serif text-base sm:text-lg text-softwhite">
          Fragrance Notes
        </h3>
        <span className="text-[11px] uppercase tracking-widest text-gold/80 font-medium">
          Scent notes
        </span>
      </div>

      <div className="divide-y divide-gold/10">
        {/* Top Notes */}
        {hasTop && (
          <div className="py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:w-28 text-[11px] uppercase tracking-wider text-stone-muted font-medium flex-shrink-0">
              <Sparkles className="w-3 h-3 text-gold/80 flex-shrink-0" />
              <span>Top Notes</span>
            </div>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {notes.top.map((note) => (
                <span
                  key={note}
                  className="px-2.5 py-0.5 text-xs rounded-full bg-midnight/60 border border-gold/15 text-softwhite/90"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Heart Notes */}
        {hasHeart && (
          <div className="py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:w-28 text-[11px] uppercase tracking-wider text-stone-muted font-medium flex-shrink-0">
              <Heart className="w-3 h-3 text-rose-dust/80 flex-shrink-0" />
              <span>Heart Notes</span>
            </div>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {notes.heart.map((note) => (
                <span
                  key={note}
                  className="px-2.5 py-0.5 text-xs rounded-full bg-midnight/60 border border-gold/15 text-softwhite/90"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Base Notes */}
        {hasBase && (
          <div className="py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:w-28 text-[11px] uppercase tracking-wider text-stone-muted font-medium flex-shrink-0">
              <Flame className="w-3 h-3 text-gold-light/80 flex-shrink-0" />
              <span>Base Notes</span>
            </div>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {notes.base.map((note) => (
                <span
                  key={note}
                  className="px-2.5 py-0.5 text-xs rounded-full bg-midnight/60 border border-gold/15 text-softwhite/90"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
