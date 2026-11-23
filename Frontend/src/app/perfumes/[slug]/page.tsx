import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Send,
  Instagram,
  Clock,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { BRAND_CONTACT } from "@/data/mockPerfumes";
import { formatPrice } from "@/lib/utils";
import { fetchPerfumeBySlug, fetchPerfumes } from "@/lib/api";
import PerfumeGallery from "@/components/perfume/PerfumeGallery";
import NotesPyramid from "@/components/perfume/NotesPyramid";
import StickyOrderBar from "@/components/perfume/StickyOrderBar";
import PerfumeCard from "@/components/perfume/PerfumeCard";
import TrustBadges from "@/components/ui/TrustBadges";

// Force dynamic server rendering so any newly created perfume in PostgreSQL loads immediately
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PerfumeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const perfume = await fetchPerfumeBySlug(slug);

  if (!perfume) {
    notFound();
  }

  // Fetch related perfumes dynamically
  let relatedPerfumes: typeof perfume[] = [];
  try {
    const all = await fetchPerfumes();
    relatedPerfumes = all.filter((p) => p.slug !== perfume.slug).slice(0, 3);
  } catch {
    // Graceful fallback
  }

  const orderMessage = encodeURIComponent(
    `Hello HANI! I would like to inquire about ${perfume.name} (${perfume.sizeMl} - ${formatPrice(perfume.price)}). Is this available to order?`
  );

  const telegramUrl = `${BRAND_CONTACT.telegram}?text=${orderMessage}`;
  const whatsappUrl = `${BRAND_CONTACT.whatsapp}?text=${orderMessage}`;
  const isAvailable = perfume.status !== "sold_out";

  return (
    <div className="pt-24 pb-20 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Breadcrumb / Back button */}
      <div className="mb-6">
        <Link
          href="/collection"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Collection</span>
        </Link>
      </div>

      {/* Main Product Layout (Gallery on left, Details on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Interactive Gallery with Lightbox */}
        <div className="lg:col-span-6">
          <PerfumeGallery
            images={perfume.images && perfume.images.length > 0 ? perfume.images : ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop"]}
            perfumeName={perfume.name}
          />
        </div>

        {/* Right: Perfume Details */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium capitalize">
                {perfume.category} Extrait
              </span>
              <span className="w-1 h-1 rounded-full bg-gold/40" />
              <span className="text-xs text-stone-muted">{perfume.sizeMl}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-softwhite font-normal mb-2">
              {perfume.name}
            </h1>
            <p className="text-sm sm:text-base text-rose-dust font-light italic">
              &ldquo;{perfume.tagline || "Scents that stay in memory."}&rdquo;
            </p>
          </div>

          {/* Price & Availability */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-plum/50 border border-gold/15">
            <div>
              <span className="text-[11px] text-stone-muted uppercase tracking-wider block">
                Estimated Price (ETB)
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-medium text-gold">
                {formatPrice(perfume.price)}
              </span>
            </div>
            <div>
              {isAvailable ? (
                <span className="px-3 py-1 rounded-full bg-sage/20 border border-sage/40 text-sage text-xs uppercase font-medium tracking-wider">
                  Available in stock
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-clay/20 border border-clay/40 text-clay text-xs uppercase font-medium tracking-wider">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-stone-muted text-sm sm:text-base leading-relaxed">
            {perfume.description}
          </p>

          {/* Scent Notes Pyramid */}
          {perfume.notes && <NotesPyramid notes={perfume.notes} />}

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {perfume.longevity && (
              <div className="p-3 rounded-lg bg-plum/30 border border-gold/10 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-gold" />
                <div>
                  <span className="text-stone-muted block text-[10px] uppercase">
                    Longevity
                  </span>
                  <span className="text-softwhite font-medium">
                    {perfume.longevity}
                  </span>
                </div>
              </div>
            )}
            {perfume.bestSeason && (
              <div className="p-3 rounded-lg bg-plum/30 border border-gold/10 flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-gold" />
                <div>
                  <span className="text-stone-muted block text-[10px] uppercase">
                    Best Season
                  </span>
                  <span className="text-softwhite font-medium">
                    {perfume.bestSeason}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Order Action Buttons (Desktop and Tablet) */}
          <div className="space-y-3 pt-2">
            <span className="text-xs uppercase tracking-widest text-gold font-medium block">
              Contact HANI to Order
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-4 rounded-full bg-gold hover:bg-gold-light text-midnight font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-glow transition-all"
              >
                <Send className="w-4 h-4 fill-midnight" />
                <span>Telegram</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-4 rounded-full bg-plum border border-sage/40 hover:border-sage text-softwhite hover:text-sage font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4 text-sage" />
                <span>WhatsApp</span>
              </a>

              <a
                href={BRAND_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-4 rounded-full bg-plum border border-rose-dust/40 hover:border-rose-dust text-softwhite hover:text-rose-dust font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all"
              >
                <Instagram className="w-4 h-4 text-rose-dust" />
                <span>Instagram</span>
              </a>
            </div>

            <p className="text-[11px] text-stone-muted text-center pt-1">
              Direct personal consultation & local courier delivery coordinated in Addis Ababa.
            </p>
          </div>

          {/* Boutique Trust Guarantees */}
          <TrustBadges variant="compact" className="mt-4" />
        </div>
      </div>

      {/* You May Also Like Section */}
      {relatedPerfumes.length > 0 && (
        <section className="mt-20 pt-12 border-t border-gold/15">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-gold font-medium block mb-1">
                Complementary Scents
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-softwhite">
                You May Also Adore
              </h2>
            </div>
            <Link
              href="/collection"
              className="text-xs uppercase tracking-widest text-gold hover:text-gold-light"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPerfumes.map((rel) => (
              <PerfumeCard key={rel.id} perfume={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Order Bar at bottom */}
      <StickyOrderBar perfume={perfume} />
    </div>
  );
}
