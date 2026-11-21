import React from "react";
import { ScentNotes } from "@/types/perfume";
import { Sparkles, Heart, Flame } from "lucide-react";

interface NotesPyramidProps {
  notes: ScentNotes;
}

export default function NotesPyramid({ notes }: NotesPyramidProps) {
  return (
    <div className="space-y-4 rounded-card bg-midnight/60 border border-gold/20 p-5 sm:p-6">
      <div className="flex items-center justify-between border-b border-gold/15 pb-3">
        <h3 className="font-serif text-lg text-softwhite flex items-center gap-2">
          <span>Scent Pyramid</span>
        </h3>
        <span className="text-[11px] uppercase tracking-widest text-gold">
          Olfactory Structure
        </span>
      </div>

      <div className="space-y-4">
        {/* Top Notes */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-plum/40 border border-gold/10">
          <div className="flex items-center gap-2 sm:w-28 text-xs font-semibold text-gold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top Notes</span>
          </div>
          <div className="flex flex-wrap gap-1.5 flex-1">
            {notes.top.map((note) => (
              <span
                key={note}
                className="px-2.5 py-1 text-xs rounded-full bg-midnight/80 border border-gold/20 text-softwhite font-medium"
              >
                {note}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-stone-muted sm:text-right hidden sm:block">
            First 15 mins
          </span>
        </div>

        {/* Heart Notes */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-plum/60 border border-rose-dust/20">
          <div className="flex items-center gap-2 sm:w-28 text-xs font-semibold text-rose-dust uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5" />
            <span>Heart Notes</span>
          </div>
          <div className="flex flex-wrap gap-1.5 flex-1">
            {notes.heart.map((note) => (
              <span
                key={note}
                className="px-2.5 py-1 text-xs rounded-full bg-midnight/80 border border-rose-dust/30 text-softwhite font-medium"
              >
                {note}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-stone-muted sm:text-right hidden sm:block">
            2 to 6 hours
          </span>
        </div>

        {/* Base Notes */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-plum/80 border border-gold/20">
          <div className="flex items-center gap-2 sm:w-28 text-xs font-semibold text-gold-light uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>Base Notes</span>
          </div>
          <div className="flex flex-wrap gap-1.5 flex-1">
            {notes.base.map((note) => (
              <span
                key={note}
                className="px-2.5 py-1 text-xs rounded-full bg-midnight/80 border border-gold/30 text-softwhite font-medium"
              >
                {note}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-stone-muted sm:text-right hidden sm:block">
            Lingers 8-12+ hrs
          </span>
        </div>
      </div>
    </div>
  );
}
