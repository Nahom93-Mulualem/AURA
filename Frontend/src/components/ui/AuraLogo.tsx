import React from "react";
import Image from "next/image";

interface AuraLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
}

const SIZE_MAP = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

export default function AuraLogo({
  size = "md",
  className = "",
  showGlow = true,
}: AuraLogoProps) {
  const dimension = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className={`relative rounded-full flex-shrink-0 group ${dimension} ${className}`}
    >
      {/* Outer ambient golden glow ring */}
      {showGlow && (
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gold/40 via-rose-dust/30 to-gold/40 blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
      )}

      {/* Luxury emblem frame */}
      <div className="relative w-full h-full rounded-full overflow-hidden border border-gold/40 shadow-[0_0_15px_rgba(201,166,107,0.35)] bg-black flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/aura-logo.jpg"
          alt="Aura by HANI Logo Emblem"
          fill
          sizes="80px"
          priority
          className="object-cover scale-105"
        />

        {/* Soft golden light reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-softwhite/15 pointer-events-none" />
      </div>
    </div>
  );
}
