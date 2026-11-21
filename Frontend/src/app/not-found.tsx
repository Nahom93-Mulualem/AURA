import React from "react";
import Link from "next/link";
import AuraLogo from "@/components/ui/AuraLogo";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <AuraLogo size="xl" showGlow className="mx-auto" />
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium block">
          404 • Scent Not Found
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-softwhite">
          A Moment Dispersed in the Air
        </h1>
        <p className="text-xs sm:text-sm text-stone-muted leading-relaxed">
          The page or fragrance you were searching for does not linger here. It may have been retired or moved.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-8 rounded-full bg-gold text-midnight font-semibold text-xs uppercase tracking-wider shadow-glow hover:bg-gold-light transition-all"
          >
            Return to Boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
