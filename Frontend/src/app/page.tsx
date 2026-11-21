import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Send,
  ShieldCheck,
  Flame,
  Clock,
  Heart,
  ChevronDown,
} from "lucide-react";
import AuraLogo from "@/components/ui/AuraLogo";
import { MOCK_PERFUMES, BRAND_CONTACT } from "@/data/mockPerfumes";
import PerfumeCard from "@/components/perfume/PerfumeCard";

export default function HomePage() {
  const featuredPerfumes = MOCK_PERFUMES.filter((p) => p.featured);
  const heroPerfume = MOCK_PERFUMES[0];

  return (
    <div className="flex flex-col gap-20 sm:gap-28 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] sm:min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-rose-dust/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headlines & CTA (mobile-first stacked) */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 z-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-plum/80 border border-gold/40 text-gold text-xs tracking-[0.2em] uppercase shadow-glow">
              <AuraLogo size="sm" showGlow={false} className="w-5 h-5" />
              <span className="font-medium">Aura by HANI</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-softwhite leading-[1.1]">
              Choose Your <br className="hidden sm:inline" />
              <span className="text-gold-gradient italic font-normal">Way.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-muted max-w-md font-light leading-relaxed">
              Scents that stay in memory. Artisanal boutique fragrances bottled with passion, designed to captivate wherever you walk.
            </p>

            {/* Action Buttons: Min 44px height for mobile touch targets */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-2">
              <Link
                href="/collection"
                className="w-full sm:w-auto min-h-[48px] px-8 rounded-full bg-gold hover:bg-gold-light text-midnight font-medium text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-lg transition-all duration-300"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={BRAND_CONTACT.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[48px] px-8 rounded-full border border-gold/40 hover:border-gold hover:bg-gold/10 text-softwhite hover:text-gold font-medium text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Send className="w-4 h-4 text-gold" />
                <span>Contact HANI</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Floating Bottle Card */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-[280px] sm:w-[340px] aspect-[4/5] rounded-card overflow-hidden bg-plum border border-gold/30 shadow-glow-lg animate-float">
              {/* Bottle Photo */}
              <Image
                src={heroPerfume.images[0]}
                alt={heroPerfume.name}
                fill
                priority
                sizes="(max-width: 640px) 280px, 340px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent opacity-80" />

              {/* Float Card Tag */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-lg bg-midnight/80 backdrop-blur-md border border-gold/25">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gold tracking-widest uppercase block">
                      Signature Release
                    </span>
                    <h3 className="font-serif text-base text-softwhite">
                      {heroPerfume.name}
                    </h3>
                  </div>
                  <Link
                    href={`/perfumes/${heroPerfume.slug}`}
                    className="p-2 rounded-full bg-gold/20 hover:bg-gold text-gold hover:text-midnight transition-colors"
                    aria-label={`View ${heroPerfume.name}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[11px] uppercase tracking-widest text-stone-muted opacity-60">
          <span>Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* 2. FEATURED PERFUMES */}
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
            <span>View All ({MOCK_PERFUMES.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid: 1 col on 375px mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPerfumes.map((perfume, idx) => (
            <PerfumeCard key={perfume.id} perfume={perfume} priority={idx < 2} />
          ))}
        </div>
      </section>

      {/* 3. BRAND STORY TEASER */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="rounded-2xl bg-plum/50 border border-gold/20 p-8 sm:p-14 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gold/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-2xl space-y-6">
            <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium">
              The Philosophy of HANI
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-softwhite leading-tight">
              A perfume is not an accessory. <br />
              It is an invisible intimacy.
            </h2>
            <p className="text-stone-muted text-base leading-relaxed">
              Every bottle curated by HANI is selected for depth, longevity, and emotion. We believe personal fragrances should never smell synthetic or rushed — they should unfold gracefully over hours, evolving with your skin chemistry.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-light border-b border-gold pb-1 transition-colors"
              >
                <span>Read HANI&apos;s Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE AURA */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="text-center max-w-lg mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium block mb-2">
            The Aura Promise
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-softwhite">
            Why Our Clients Trust Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-card bg-plum/40 border border-gold/15 space-y-3">
            <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold mb-4">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-softwhite">Pure Rare Extractions</h3>
            <p className="text-xs sm:text-sm text-stone-muted leading-relaxed">
              High concentration perfumes blended with pure Cambodian oud, Grasse florals, and rich amber resins that linger 12+ hours.
            </p>
          </div>

          <div className="p-6 rounded-card bg-plum/40 border border-gold/15 space-y-3">
            <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-softwhite">Direct Authentic Stock</h3>
            <p className="text-xs sm:text-sm text-stone-muted leading-relaxed">
              No middle-men or questionable batches. Every bottle is physically examined, authenticated, and preserved at optimal temperature.
            </p>
          </div>

          <div className="p-6 rounded-card bg-plum/40 border border-gold/15 space-y-3">
            <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-softwhite">Personal Consultation</h3>
            <p className="text-xs sm:text-sm text-stone-muted leading-relaxed">
              Message HANI directly on Telegram or Instagram for bespoke recommendations matched to your taste, season, and occasion.
            </p>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="p-8 sm:p-12 rounded-2xl bg-midnight border border-gold/20 shadow-glow">
          <div className="text-center max-w-md mx-auto mb-10">
            <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium block mb-1">
              Client Memories
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-softwhite">
              Words From Fragrance Lovers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg bg-plum/50 border border-gold/10 flex flex-col justify-between">
              <p className="text-xs sm:text-sm italic text-softwhite/90 leading-relaxed mb-4">
                &ldquo;Oud Royale is hands down the best perfume I have ever purchased. I receive compliments every single day at work.&rdquo;
              </p>
              <div>
                <span className="text-xs font-medium text-gold block">Sarah K.</span>
                <span className="text-[10px] text-stone-muted">Verified Telegram Buyer</span>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-plum/50 border border-gold/10 flex flex-col justify-between">
              <p className="text-xs sm:text-sm italic text-softwhite/90 leading-relaxed mb-4">
                &ldquo;HANI spent 20 minutes helping me choose a gift for my fiancé on Instagram. Her recommendation of Nuit Dorée was perfection.&rdquo;
              </p>
              <div>
                <span className="text-xs font-medium text-gold block">David M.</span>
                <span className="text-[10px] text-stone-muted">Instagram Client</span>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-plum/50 border border-gold/10 flex flex-col justify-between">
              <p className="text-xs sm:text-sm italic text-softwhite/90 leading-relaxed mb-4">
                &ldquo;The longevity is unreal. Even after washing my coat, the scent of Rose Éthérée still carried a soft glowing warmth.&rdquo;
              </p>
              <div>
                <span className="text-xs font-medium text-gold block">Elena R.</span>
                <span className="text-[10px] text-stone-muted">Repeat Customer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="rounded-2xl bg-gradient-to-r from-plum via-midnight to-plum border border-gold/30 p-8 sm:p-12 text-center space-y-6">
          <Sparkles className="w-8 h-8 text-gold mx-auto" />
          <h2 className="font-serif text-3xl sm:text-4xl text-softwhite max-w-xl mx-auto">
            Ready to find your signature fragrance?
          </h2>
          <p className="text-stone-muted text-sm max-w-md mx-auto">
            Reach out directly on Telegram or Instagram for advice, availability, and immediate ordering.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={BRAND_CONTACT.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[44px] px-8 rounded-full bg-gold text-midnight font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow hover:bg-gold-light transition-all"
            >
              <Send className="w-4 h-4 fill-midnight" />
              <span>Chat on Telegram</span>
            </a>
            <Link
              href="/collection"
              className="w-full sm:w-auto min-h-[44px] px-8 rounded-full border border-gold/30 text-softwhite hover:border-gold hover:text-gold font-medium text-xs uppercase tracking-wider flex items-center justify-center transition-all"
            >
              Browse Full Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
