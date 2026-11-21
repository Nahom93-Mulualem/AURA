import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Heart, ShieldCheck, Send, ArrowRight } from "lucide-react";
import { BRAND_CONTACT } from "@/data/mockPerfumes";

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum border border-gold/30 text-gold text-xs tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Soul Behind the Scents</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-softwhite">
          About HANI
        </h1>
        <p className="text-base sm:text-lg text-stone-muted font-light leading-relaxed">
          &ldquo;I believe that the scent you leave behind is the most intimate impression you give the world.&rdquo;
        </p>
      </div>

      {/* Story & Image Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
        {/* Left: Atmospheric Portrait / Boutique Image */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden bg-plum border border-gold/30 shadow-glow">
            <Image
              src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop"
              alt="HANI Fragrance Atelier"
              fill
              priority
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-5 inset-x-5 p-4 rounded-lg bg-midnight/80 backdrop-blur-sm border border-gold/20">
              <p className="font-serif text-sm text-softwhite">HANI</p>
              <p className="text-[11px] text-gold tracking-widest uppercase">
                Founder & Fragrance Curator
              </p>
            </div>
          </div>
        </div>

        {/* Right: Narrative */}
        <div className="lg:col-span-7 space-y-6 text-softwhite/90">
          <h2 className="font-serif text-2xl sm:text-4xl text-softwhite leading-tight">
            Curating luxury without cold corporate mass-production.
          </h2>
          <p className="text-stone-muted text-sm sm:text-base leading-relaxed">
            Aura was born from a deep reverence for the craft of niche perfumery. While modern fragrance counters are flooded with diluted formulas designed to please everyone and last twenty minutes, HANI sought out masterfully composed, concentrated perfumes that speak with quiet authority.
          </p>
          <p className="text-stone-muted text-sm sm:text-base leading-relaxed">
            Each fragrance featured in the Aura collection is personally tested, authenticated, and loved. Whether it is the smoldering depth of aged agarwood, the luminous warmth of sun-kissed amber, or delicate dawn-picked petals, every scent is selected to become your signature presence.
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-plum/40 border border-gold/15 space-y-1.5">
              <span className="text-xs text-gold uppercase tracking-wider font-semibold block">
                Boutique Attention
              </span>
              <p className="text-xs text-stone-muted">
                Direct one-on-one communication with HANI for fragrance matching.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-plum/40 border border-gold/15 space-y-1.5">
              <span className="text-xs text-gold uppercase tracking-wider font-semibold block">
                Purity & Longevity
              </span>
              <p className="text-xs text-stone-muted">
                Only formulas with high natural oil concentrations that linger for hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Contact Banner */}
      <div className="rounded-2xl bg-plum/50 border border-gold/20 p-8 sm:p-12 text-center space-y-6">
        <h3 className="font-serif text-2xl sm:text-3xl text-softwhite">
          Have questions or want a personal recommendation?
        </h3>
        <p className="text-xs sm:text-sm text-stone-muted max-w-md mx-auto">
          Send a quick message on Telegram or Instagram. HANI will be delighted to guide your selection.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={BRAND_CONTACT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[44px] px-8 rounded-full bg-gold text-midnight font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow hover:bg-gold-light transition-all"
          >
            <Send className="w-4 h-4 fill-midnight" />
            <span>Message on Telegram</span>
          </a>
          <Link
            href="/collection"
            className="w-full sm:w-auto min-h-[44px] px-8 rounded-full border border-gold/30 text-softwhite hover:border-gold hover:text-gold font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
