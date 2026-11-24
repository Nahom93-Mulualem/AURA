"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Sparkles, Send } from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { Perfume } from "@/types/perfume";
import { BRAND_CONTACT } from "@/data/mockPerfumes";
import { formatPrice } from "@/lib/utils";
import ParticleField from "@/components/perfume/ParticleField";
import NotesReveal from "@/components/perfume/NotesReveal";

interface PerfumeCardProps {
  perfume: Perfume;
  priority?: boolean;
}

export default function PerfumeCard({ perfume, priority = false }: PerfumeCardProps) {
  const [viewMode, setViewMode] = useState<"bottle" | "notes">("bottle");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const fallbackImage = "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop";
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
    // Don't calculate 3D tilt on mobile/touch devices
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

  const isNotesView = viewMode === "notes";

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
      {/* 4:5 Aspect Ratio Image & Notes Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-midnight/80">
        {/* Top Badges: Status (Left) & Bottle/Notes Toggle (Right) */}
        <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto">{getStatusBadge()}</div>

          {/* Interactive Bottle / Notes Toggle Switch */}
          <div
            className="pointer-events-auto inline-flex items-center p-0.5 rounded-full bg-midnight/80 backdrop-blur-md border border-gold/30 shadow-md"
            role="group"
            aria-label="View toggle for bottle or scent notes"
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
              aria-pressed={viewMode === "notes"}
              onClick={() => setViewMode("notes")}
              className={`min-h-[28px] px-2.5 rounded-full text-[10px] uppercase tracking-wider font-medium transition-all duration-300 flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
                viewMode === "notes"
                  ? "bg-gold text-midnight font-semibold shadow-sm"
                  : "text-softwhite/70 hover:text-gold"
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Notes</span>
            </button>
          </div>
        </div>

        {/* Floating Particles (Mist/Petals/Sparkles) when Notes view is active */}
        <AnimatePresence>
          {isNotesView && <ParticleField />}
        </AnimatePresence>

        {/* Perfume Bottle Image (Gently lifts and fades on toggle) */}
        <motion.div
          animate={{
            y: isNotesView ? -20 : 0,
            opacity: isNotesView ? 0.12 : 1,
            scale: isNotesView ? 1.04 : 1,
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

          {/* Soft Bottom Shadow Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-plum via-plum/40 to-transparent pointer-events-none" />
        </motion.div>

        {/* Notes Reveal Overlay (Staggered Olfactory Structure) */}
        <AnimatePresence>
          {isNotesView && (
            <NotesReveal notes={perfume.notes} perfumeName={perfume.name} />
          )}
        </AnimatePresence>

        {/* Desktop Quick Link Pill on Bottle Hover */}
        {!isNotesView && (
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
        <div className="pt-2 mt-1 border-t border-gold/10 flex items-center justify-between text-[11px] text-stone-muted">
          <span className="capitalize">
            {perfume.category} • {String(perfume.sizeMl).includes("ml") ? perfume.sizeMl : `${perfume.sizeMl}ml`}
          </span>
          <div className="flex items-center gap-2">
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
