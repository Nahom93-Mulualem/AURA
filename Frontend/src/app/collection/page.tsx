"use client";

import React, { useState, useMemo } from "react";
import { Search, Sparkles, Filter, X } from "lucide-react";
import { MOCK_PERFUMES } from "@/data/mockPerfumes";
import { PerfumeCategory } from "@/types/perfume";
import PerfumeCard from "@/components/perfume/PerfumeCard";

export default function CollectionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PerfumeCategory | "all">("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filteredPerfumes = useMemo(() => {
    return MOCK_PERFUMES.filter((perfume) => {
      // Category filter
      if (selectedCategory !== "all" && perfume.category !== selectedCategory) {
        return false;
      }
      // Availability filter
      if (onlyAvailable && perfume.status === "sold_out") {
        return false;
      }
      // Search query filter (matches name, notes, or subtitle)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = perfume.name.toLowerCase().includes(query);
        const matchesSubtitle = perfume.subtitle.toLowerCase().includes(query);
        const matchesNotes = [
          ...perfume.notes.top,
          ...perfume.notes.heart,
          ...perfume.notes.base,
        ].some((note) => note.toLowerCase().includes(query));

        if (!matchesName && !matchesSubtitle && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedCategory, onlyAvailable]);

  return (
    <div className="pt-28 pb-20 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium inline-block">
          The Full Showcase
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-softwhite">
          Fragrance Collection
        </h1>
        <p className="text-sm text-stone-muted leading-relaxed">
          Explore our complete catalogue of hand-curated extrait and eau de parfum. Filter by scent character or search for specific aromatic notes.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-xl bg-plum/60 border border-gold/20 p-4 mb-10 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, oud, vanilla, rose, amber..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-midnight/80 border border-gold/20 text-softwhite placeholder:text-stone-muted text-sm focus:border-gold focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-muted hover:text-gold"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Badges and Availability Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gold/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs text-stone-muted uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {(["all", "unisex", "feminine", "masculine"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[36px] px-3.5 py-1 text-xs uppercase tracking-wider rounded-full transition-all ${
                  selectedCategory === cat
                    ? "bg-gold text-midnight font-semibold shadow-glow"
                    : "bg-midnight/60 border border-gold/20 text-softwhite hover:border-gold/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-softwhite/90 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded accent-gold w-4 h-4 cursor-pointer"
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Fragrance Grid: 1 col on small phones (375px), 2 on larger, 3 on tablets, 4 on desktop */}
      {filteredPerfumes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPerfumes.map((perfume, idx) => (
            <PerfumeCard key={perfume.id} perfume={perfume} priority={idx < 4} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 rounded-xl bg-plum/30 border border-gold/15 p-8 max-w-md mx-auto space-y-4">
          <Sparkles className="w-8 h-8 text-gold/60 mx-auto" />
          <h3 className="font-serif text-2xl text-softwhite">No Fragrances Found</h3>
          <p className="text-xs text-stone-muted leading-relaxed">
            We couldn&apos;t find any perfume matching &ldquo;{searchQuery}&rdquo;. Try searching for different scent notes or reset your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setOnlyAvailable(false);
            }}
            className="px-5 py-2 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs uppercase tracking-wider hover:bg-gold hover:text-midnight transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
