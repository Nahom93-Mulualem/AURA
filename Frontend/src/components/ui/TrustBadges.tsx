import React from "react";
import { Truck, CreditCard, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

interface TrustBadgesProps {
  variant?: "full" | "compact";
  className?: string;
}

export default function TrustBadges({
  variant = "full",
  className = "",
}: TrustBadgesProps) {
  if (variant === "compact") {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-plum/40 border border-gold/20 text-xs ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-gold flex-shrink-0" />
          <div>
            <span className="font-semibold text-softwhite block">Fast Delivery</span>
            <span className="text-[11px] text-stone-muted">Same-day Addis Ababa</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <CreditCard className="w-4 h-4 text-gold flex-shrink-0" />
          <div>
            <span className="font-semibold text-softwhite block">Local Payments</span>
            <span className="text-[11px] text-stone-muted">Telebirr, CBE & Cash on Delivery</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
          <div>
            <span className="font-semibold text-softwhite block">Verified Authentic</span>
            <span className="text-[11px] text-stone-muted">Original batch codes</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium inline-block">
          Confidence & Excellence
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl text-softwhite">
          Our Boutique Guarantees
        </h2>
        <p className="text-xs sm:text-sm text-stone-muted">
          Transparent shopping designed around genuine fragrances, flexible Ethiopian payments, and swift delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Authenticity Guarantee */}
        <div className="p-6 rounded-2xl bg-plum/50 border border-gold/20 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-midnight border border-gold/30 flex items-center justify-center text-gold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-softwhite">100% Genuine Authenticity</h3>
            <p className="text-xs text-stone-muted leading-relaxed">
              Every bottle in the Aura collection is sourced from licensed European and Arabian fragrance houses. We never deal in dilutions, copies, or questionable testers.
            </p>
          </div>
          <ul className="space-y-1.5 pt-3 border-t border-gold/10 text-xs text-softwhite/90">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage flex-shrink-0" />
              <span>Verifiable batch codes on every bottle</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage flex-shrink-0" />
              <span>Climate-controlled dark storage</span>
            </li>
          </ul>
        </div>

        {/* 2. Delivery Information */}
        <div className="p-6 rounded-2xl bg-plum/50 border border-gold/20 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-midnight border border-gold/30 flex items-center justify-center text-gold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-softwhite">Express Reliable Delivery</h3>
            <p className="text-xs text-stone-muted leading-relaxed">
              Carefully packaged in discreet luxury boxes to prevent breakage or heat exposure during transit across Addis Ababa and throughout Ethiopia.
            </p>
          </div>
          <ul className="space-y-1.5 pt-3 border-t border-gold/10 text-xs text-softwhite/90">
            <li className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              <span><strong>Addis Ababa:</strong> Same-day (within 24 hrs)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage flex-shrink-0" />
              <span><strong>Regional Ethiopia:</strong> 2–3 business days</span>
            </li>
          </ul>
        </div>

        {/* 3. Payment Methods */}
        <div className="p-6 rounded-2xl bg-plum/50 border border-gold/20 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-midnight border border-gold/30 flex items-center justify-center text-gold">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-softwhite">Flexible Ethiopian Payments</h3>
            <p className="text-xs text-stone-muted leading-relaxed">
              Convenient, transparent payment in Ethiopian Birr (ETB). No hidden currency conversion fees or overseas card hassles.
            </p>
          </div>
          <div className="space-y-2 pt-3 border-t border-gold/10 text-xs text-softwhite/90">
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-md bg-midnight/80 border border-gold/20 text-gold font-mono font-medium">
                Telebirr
              </span>
              <span className="px-2.5 py-1 rounded-md bg-midnight/80 border border-gold/20 text-softwhite font-mono font-medium">
                CBE Birr
              </span>
              <span className="px-2.5 py-1 rounded-md bg-midnight/80 border border-gold/20 text-softwhite font-mono font-medium">
                Awash / BOA
              </span>
            </div>
            <p className="text-[11px] text-stone-muted">
              Cash on delivery available upon physical inspection in Addis Ababa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
