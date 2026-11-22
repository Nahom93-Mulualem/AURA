"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MOCK_PERFUMES } from "@/data/mockPerfumes";
import { usePerfumesCatalog } from "@/lib/perfumeStore";
import PerfumeCard from "@/components/perfume/PerfumeCard";

export default function FeaturedFragrances() {
  const perfumes = usePerfumesCatalog(MOCK_PERFUMES);
  const featured = perfumes.filter((p) => p.featured);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((perfume, idx) => (
          <PerfumeCard key={perfume.id} perfume={perfume} priority={idx < 2} />
        ))}
      </div>
    </section>
  );
}
