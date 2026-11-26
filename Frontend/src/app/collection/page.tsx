"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Sparkles, Filter, X, Loader2, RefreshCw, HelpCircle } from "lucide-react";
import {
  Perfume,
  PerfumeCategory,
  FragranceType,
  CATEGORY_LABELS,
  FRAGRANCE_TYPE_LABELS,
} from "@/types/perfume";
import PerfumeCard from "@/components/perfume/PerfumeCard";
import FragranceTypeHelpModal from "@/components/perfume/FragranceTypeHelpModal";
import { fetchPerfumes } from "@/lib/api";

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "unisex", label: "Unisex" },
];

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "extrait_de_parfum", label: "Extrait de Parfum" },
  { value: "eau_de_parfum", label: "Eau de Parfum" },
  { value: "eau_de_toilette", label: "Eau de Toilette" },
  { value: "perfume_oil", label: "Perfume Oil" },
  { value: "bakhoor", label: "Bakhoor" },
  { value: "body_splash", label: "Body Splash" },
];

function CollectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [selectedType, setSelectedType] = useState<string>(
    searchParams.get("type") || "all"
  );
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const helpButtonRef = useRef<HTMLButtonElement>(null);

  // Sync state if URL query params change
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat.toLowerCase());
    const typ = searchParams.get("type");
    if (typ) setSelectedType(typ.toLowerCase());
  }, [searchParams]);

  const loadPerfumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPerfumes();
      setPerfumes(data);
    } catch (err: any) {
      setError(err.message || "Failed to load collection from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerfumes();
  }, []);

  const filteredPerfumes = useMemo(() => {
    return (Array.isArray(perfumes) ? perfumes : []).filter((perfume) => {
      if (!perfume) return false;

      // Category filter (normalizes women/feminine and men/masculine)
      if (selectedCategory !== "all") {
        const cat = (perfume.category || "").toLowerCase();
        if (selectedCategory === "women" && cat !== "women" && cat !== "feminine") {
          return false;
        } else if (selectedCategory === "men" && cat !== "men" && cat !== "masculine") {
          return false;
        } else if (selectedCategory === "unisex" && cat !== "unisex") {
          return false;
        } else if (
          selectedCategory !== "women" &&
          selectedCategory !== "men" &&
          selectedCategory !== "unisex" &&
          cat !== selectedCategory
        ) {
          return false;
        }
      }

      // Fragrance Type filter
      if (selectedType !== "all") {
        const pType = (perfume.fragranceType || "").toLowerCase();
        if (pType !== selectedType) {
          return false;
        }
      }

      // Availability filter
      if (onlyAvailable && perfume.status === "sold_out") {
        return false;
      }

      // Search query filter (matches name, notes, subtitle, description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (perfume.name || "").toLowerCase().includes(query);
        const matchesSubtitle = (perfume.subtitle || "").toLowerCase().includes(query);
        const matchesDesc = (perfume.description || "").toLowerCase().includes(query);
        const allNotes = [
          ...(perfume.notes?.top || []),
          ...(perfume.notes?.heart || []),
          ...(perfume.notes?.base || []),
        ];
        const matchesNotes = allNotes.some((note) => (note || "").toLowerCase().includes(query));

        if (!matchesName && !matchesSubtitle && !matchesNotes && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [perfumes, searchQuery, selectedCategory, selectedType, onlyAvailable]);

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
          Explore our complete catalogue of hand-curated extrait, eau de parfum, and artisanal essences. Managed in real-time.
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

        {/* Category Pills & Availability Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gold/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs text-stone-muted uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`min-h-[36px] px-3.5 py-1 text-xs uppercase tracking-wider rounded-full transition-all ${
                  selectedCategory === cat.value
                    ? "bg-gold text-midnight font-semibold shadow-glow"
                    : "bg-midnight/60 border border-gold/20 text-softwhite hover:border-gold/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-softwhite/90 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 rounded accent-gold cursor-pointer"
            />
            <span>Show In Stock Only</span>
          </label>
        </div>

        {/* Fragrance Type Filter & Help Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gold/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs text-stone-muted uppercase tracking-wider flex items-center gap-1 mr-1">
              Type:
            </span>
            {TYPE_OPTIONS.map((typeOption) => (
              <button
                key={typeOption.value}
                type="button"
                onClick={() => setSelectedType(typeOption.value)}
                className={`min-h-[32px] px-3 py-1 text-[11px] tracking-wider rounded-full transition-all whitespace-nowrap ${
                  selectedType === typeOption.value
                    ? "bg-gold text-midnight font-semibold shadow-glow"
                    : "bg-midnight/60 border border-gold/20 text-softwhite/80 hover:border-gold/50"
                }`}
              >
                {typeOption.label}
              </button>
            ))}
          </div>

          <button
            ref={helpButtonRef}
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light underline-offset-4 hover:underline py-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>What do these mean?</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-8 rounded-2xl bg-clay/20 border border-clay/40 text-center space-y-3 mb-10">
          <p className="text-sm font-semibold text-clay">{error}</p>
          <button
            onClick={loadPerfumes}
            className="px-5 py-2 rounded-full bg-midnight border border-gold/40 text-gold text-xs flex items-center gap-2 mx-auto hover:bg-gold/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" />
          <p className="text-xs text-stone-muted">Loading boutique collection...</p>
        </div>
      ) : filteredPerfumes.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-plum/30 border border-gold/15 space-y-4">
          <Sparkles className="w-8 h-8 text-gold/40 mx-auto" />
          <h3 className="font-serif text-xl text-softwhite">No fragrances match your criteria</h3>
          <p className="text-xs text-stone-muted max-w-sm mx-auto">
            Try adjusting your search terms or clearing active filters to view more creations.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedType("all");
              setOnlyAvailable(false);
            }}
            className="text-xs uppercase tracking-wider text-gold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPerfumes.map((perfume, idx) => (
            <PerfumeCard key={perfume.id} perfume={perfume} priority={idx < 3} />
          ))}
        </div>
      )}

      {/* Fragrance Type Help Modal */}
      <FragranceTypeHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        triggerRef={helpButtonRef}
      />
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-28 pb-20 max-w-[1200px] mx-auto px-4 text-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" />
          <p className="text-xs text-stone-muted">Loading collection...</p>
        </div>
      }
    >
      <CollectionContent />
    </Suspense>
  );
}
