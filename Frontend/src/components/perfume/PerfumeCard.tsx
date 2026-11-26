"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight, AlignLeft, Send } from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import {
  Perfume,
  CATEGORY_LABELS,
  FRAGRANCE_TYPE_LABELS,
  FragranceType,
} from "@/types/perfume";
import { BRAND_CONTACT } from "@/data/mockPerfumes";
import { formatPrice } from "@/lib/utils";
import ParticleField from "@/components/perfume/ParticleField";

interface PerfumeCardProps {
  perfume: Perfume;
  priority?: boolean;
}

export default function PerfumeCard({ perfume, priority = false }: PerfumeCardProps) {
  const [viewMode, setViewMode] = useState<"bottle" | "description">("bottle");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const fallbackImage =
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop";
  const primaryImage =
    perfume?.images && perfume.images.length > 0 && perfume.images[0]?.trim()
      ? perfume.images[0].trim()
      : fallbackImage;

  // 3D Tilt Values for Desktop Hover
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 260 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;
    if (window.innerWidth < 1024) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const isDescriptionView = viewMode === "description";

  const getStatusBadge = () => {
    switch (perfume.status) {
      case "new":
        return (
          <span className="px-2.5 py-1 text-[10px] uppercase font-semibold tracking-widest rounded-full bg-gold/20 text-gold border border-gold/40 backdrop-blur-sm shadow-sm">
            New
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
            In Stock
          </span>
        );
    }
  };

  const orderMsg = encodeURIComponent(
    `Hi HANI! I am inquiring about ${perfume.name} (${perfume.sizeMl} - ${formatPrice(perfume.price)}).`
  );
  const telegramUrl = `${BRAND_CONTACT.telegram}?text=${orderMsg}`;
  const whatsappUrl = `${BRAND_CONTACT.whatsapp}?text=${orderMsg}`;

  // Build specifications string: [fragrance_type, category, size]
  const typeLabel = perfume.fragranceType
    ? FRAGRANCE_TYPE_LABELS[perfume.fragranceType as FragranceType] || perfume.fragranceType
    : "";
  const categoryLabel = CATEGORY_LABELS[perfume.category] || perfume.category;
  const sizeFormatted = String(perfume.sizeMl).includes("ml")
    ? perfume.sizeMl
    : `${perfume.sizeMl}ml`;
  const specsText = [typeLabel, categoryLabel, sizeFormatted].filter(Boolean).join(" • ");

  const cardDescription =
    perfume.shortDescription?.trim() ||
    perfume.description?.trim() ||
    "An artisanal formulation crafted with rare botanical essences.";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX: prefersReducedMotion ? 0 : rotateX,
        rotateY: prefersReducedMotion ? 0 : rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative rounded-card bg-plum/70 hover:bg-plum border border-gold/15 hover:border-gold/40 transition-colors duration-300 overflow-hidden shadow-sm hover:shadow-glow flex flex-col justify-between"
    >
      {/* 4:5 Aspect Ratio Image & Description Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-midnight/80">
        {/* Top Badges: Status (Left) & Bottle/Description Toggle (Right) */}
        <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto">{getStatusBadge()}</div>

          {/* Interactive Bottle / Description Toggle Switch */}
          <div
            className="pointer-events-auto inline-flex items-center p-0.5 rounded-full bg-midnight/80 backdrop-blur-md border border-gold/30 shadow-md"
            role="group"
            aria-label="View toggle for bottle or description"
          >
            <button
              type="button"
              aria-pressed={viewMode === "bottle"}
              onClick={() => setViewMode("bottle")}
              className={`min-h-[28px] px-2.5 rounded-full text-[10px] uppercase tracking-wider font-medium transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                viewMode === "bottle"
                  ? "bg-gold text-midnight font-semibold shadow-sm"
                  : "text-softwhite/70 hover:text-gold"
              }`}
            >
              Bottle
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "description"}
              onClick={() => setViewMode("description")}
              className={`min-h-[28px] px-2.5 rounded-full text-[10px] uppercase tracking-wider font-medium transition-all duration-300 flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                viewMode === "description"
                  ? "bg-gold text-midnight font-semibold shadow-sm"
                  : "text-softwhite/70 hover:text-gold"
              }`}
            >
              <AlignLeft className="w-2.5 h-2.5" />
              <span>Description</span>
            </button>
          </div>
        </div>

        {/* Floating Particles when Description view is active */}
        <AnimatePresence>
          {isDescriptionView && <ParticleField />}
        </AnimatePresence>

        {/* Perfume Bottle Image */}
        <motion.div
          animate={{
            y: isDescriptionView ? -20 : 0,
            opacity: isDescriptionView ? 0.12 : 1,
            scale: isDescriptionView ? 1.04 : 1,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0.25 }
              : {
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1] as const,
                }
          }
          className="relative w-full h-full pointer-events-none"
        >
          <Image
            src={primaryImage}
            alt={perfume.name || "Aura Fragrance"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-plum via-plum/40 to-transparent pointer-events-none" />
        </motion.div>

        {/* Description Reveal Overlay */}
        <AnimatePresence>
          {isDescriptionView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-30 flex flex-col justify-between p-5 bg-midnight/90 backdrop-blur-md rounded-t-card overflow-hidden"
            >
              <div className="border-b border-gold/20 pb-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium block">
                  Fragrance Story
                </span>
                <h4 className="font-serif text-base text-softwhite font-medium truncate">
                  {perfume.name}
                </h4>
              </div>

              <div className="my-auto py-2">
                <p className="font-serif text-xs sm:text-sm text-softwhite/95 leading-relaxed italic line-clamp-3 sm:line-clamp-4">
                  &ldquo;{cardDescription}&rdquo;
                </p>
                <Link
                  href={`/perfumes/${perfume.slug}`}
                  className="inline-flex items-center gap-1 mt-3 text-[10px] uppercase tracking-wider text-gold hover:text-gold-light transition-colors"
                >
                  <span>Explore full notes</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="pt-2 border-t border-gold/15 flex items-center justify-between text-[10px] text-stone-muted">
                <span>Toggle back to view bottle</span>
                <span className="text-gold uppercase tracking-wider">Aura Atelier</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Quick Link Pill on Bottle Hover */}
        {!isDescriptionView && (
          <Link
            href={`/perfumes/${perfume.slug}`}
            className="hidden md:flex absolute bottom-3 inset-x-3 items-center justify-center gap-1 py-2 rounded-full bg-midnight/90 border border-gold/40 text-gold text-xs uppercase tracking-widest opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-glow focus:opacity-100 focus:translate-y-0"
            aria-label={`View full details of ${perfume.name}`}
          >
            <span>Explore Fragrance</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Perfume Details & Price */}
      <div className="p-4 sm:p-5 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/perfumes/${perfume.slug}`}
            className="focus:outline-none focus-visible:underline"
          >
            <h3 className="font-serif text-lg sm:text-xl text-softwhite group-hover:text-gold transition-colors font-medium">
              {perfume.name}
            </h3>
          </Link>
          <span className="font-mono text-sm sm:text-base text-gold font-medium whitespace-nowrap">
            {formatPrice(perfume.price)}
          </span>
        </div>

        <p className="text-xs text-stone-muted line-clamp-1">
          {perfume.subtitle}
        </p>

        {/* Specs & Quick Action Buttons */}
        <div className="pt-2 mt-1 border-t border-gold/10 flex items-center justify-between gap-2 text-[11px] text-stone-muted">
          <span className="capitalize truncate min-w-0" title={specsText}>
            {specsText}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Order ${perfume.name} on Telegram`}
              className="p-1 rounded-full text-stone-muted hover:text-gold transition-colors"
              title="Order on Telegram"
            >
              <Send className="w-3.5 h-3.5" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Order ${perfume.name} on WhatsApp`}
              className="p-1 rounded-full text-stone-muted hover:text-sage transition-colors"
              title="Order on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
