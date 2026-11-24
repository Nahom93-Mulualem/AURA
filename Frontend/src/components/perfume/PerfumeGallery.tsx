"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";

interface PerfumeGalleryProps {
  images: string[];
  perfumeName: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop";

export default function PerfumeGallery({ images, perfumeName }: PerfumeGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const safeImages = Array.isArray(images) && images.filter((img) => img && typeof img === "string" && img.trim() !== "").length > 0
    ? images.filter((img) => img && typeof img === "string" && img.trim() !== "").map((s) => s.trim())
    : [FALLBACK_IMAGE];

  const validIndex = selectedIndex >= safeImages.length ? 0 : selectedIndex;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Large Display with 4:5 Aspect Ratio */}
      <div
        onClick={() => setLightboxOpen(true)}
        className="group relative aspect-[4/5] w-full rounded-card overflow-hidden bg-plum border border-gold/20 cursor-zoom-in shadow-glow"
      >
        <Image
          src={safeImages[validIndex]}
          alt={`${perfumeName} - image ${validIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Zoom cue button */}
        <div className="absolute bottom-4 right-4 p-2.5 rounded-full bg-midnight/80 backdrop-blur-sm border border-gold/30 text-gold shadow-md">
          <ZoomIn className="w-4 h-4" />
        </div>

        {/* Navigation Arrows if multiple photos */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-midnight/70 backdrop-blur-sm border border-gold/30 flex items-center justify-center text-softwhite hover:text-gold hover:border-gold transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-midnight/70 backdrop-blur-sm border border-gold/30 flex items-center justify-center text-softwhite hover:text-gold hover:border-gold transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {safeImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                validIndex === idx
                  ? "border-gold shadow-glow scale-102"
                  : "border-plum/80 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${perfumeName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-midnight/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close fullscreen view"
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-plum border border-gold/40 text-softwhite hover:text-gold flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-3xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={safeImages[validIndex]}
              alt={`${perfumeName} full resolution`}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
