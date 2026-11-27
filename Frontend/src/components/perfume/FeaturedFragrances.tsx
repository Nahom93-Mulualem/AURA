"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Perfume } from "@/types/perfume";
import { fetchPerfumes } from "@/lib/api";
import PerfumeCard from "@/components/perfume/PerfumeCard";

import { MOCK_PERFUMES } from "@/data/mockPerfumes";

export default function FeaturedFragrances() {
  const [perfumes, setPerfumes] = useState<Perfume[]>(MOCK_PERFUMES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPerfumes()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPerfumes(data);
        }
      })
      .catch(() => {
        // Fall back gracefully to mock catalog
      });
  }, []);

  const featured = perfumes.filter((p) => p.featured);
  const displayPerfumes = featured.length > 0 ? featured : perfumes.slice(0, 4);

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-gold/15">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium block mb-1">
            Curated Selections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-softwhite">
            Featured Fragrances
          </h2>
        </div>
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
        >
          <span>View All ({perfumes.length})</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid: 1 col on 375px mobile, 2 on tablet, 4 on desktop */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
          <p className="text-xs text-stone-muted">Loading featured extraits...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayPerfumes.map((perfume, idx) => (
            <PerfumeCard key={perfume.id} perfume={perfume} priority={idx < 2} />
          ))}
        </div>
      )}
    </section>
  );
}
