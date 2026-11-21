"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Perfume } from "@/types/perfume";
import { formatPrice } from "@/lib/utils";

interface PerfumeCardProps {
  perfume: Perfume;
  priority?: boolean;
}

export default function PerfumeCard({ perfume, priority = false }: PerfumeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasSecondaryImage = perfume.images.length > 1;

  const getStatusBadge = () => {
    switch (perfume.status) {
      case "new":
        return (
          <span className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-widest rounded-full bg-gold/20 text-gold border border-gold/40 backdrop-blur-sm shadow-sm">
            New Arrival
          </span>
        );
      case "sold_out":
        return (
          <span className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-widest rounded-full bg-clay/20 text-clay border border-clay/40 backdrop-blur-sm shadow-sm">
            Sold Out
          </span>
        );
      case "available":
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-widest rounded-full bg-sage/20 text-sage border border-sage/40 backdrop-blur-sm shadow-sm">
            Available
          </span>
        );
    }
  };

  return (
    <Link
      href={`/perfumes/${perfume.slug}`}
      className="group block rounded-card bg-plum/70 hover:bg-plum border border-gold/15 hover:border-gold/40 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-glow focus:outline-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`View ${perfume.name}`}
    >
      {/* 4:5 Aspect Ratio Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-midnight/80">
        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-20">{getStatusBadge()}</div>

        {/* Size Badge */}
        <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-full bg-midnight/70 border border-softwhite/10 text-[10px] text-stone-muted font-mono">
          {perfume.sizeMl}ml
        </div>

        {/* Primary Image */}
        <Image
          src={perfume.images[0]}
          alt={perfume.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className={`object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
            isHovered && hasSecondaryImage ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Secondary Cross-fade Image for Desktop Hover */}
        {hasSecondaryImage && (
          <Image
            src={perfume.images[1]}
            alt={`${perfume.name} secondary preview`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Soft Dark Gradient on bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-plum via-plum/40 to-transparent pointer-events-none" />

        {/* Desktop Slide-up View Pill */}
        <div className="hidden md:flex absolute bottom-4 inset-x-4 items-center justify-center gap-1 py-2 rounded-full bg-midnight/90 border border-gold/50 text-gold text-xs uppercase tracking-widest opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-glow">
          <span>View Notes</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Perfume Info */}
      <div className="p-4 sm:p-5 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg sm:text-xl text-softwhite group-hover:text-gold transition-colors font-medium">
            {perfume.name}
          </h3>
          <span className="font-mono text-sm sm:text-base text-gold font-medium whitespace-nowrap">
            {formatPrice(perfume.price)}
          </span>
        </div>

        <p className="text-xs text-stone-muted line-clamp-1">
          {perfume.subtitle}
        </p>

        <div className="pt-2 mt-2 border-t border-gold/10 flex items-center justify-between text-[11px] text-stone-muted">
          <span className="capitalize">{perfume.category}</span>
          <span className="text-softwhite/60">
            {perfume.notes.top.slice(0, 2).join(", ")}
          </span>
        </div>
      </div>
    </Link>
  );
}
