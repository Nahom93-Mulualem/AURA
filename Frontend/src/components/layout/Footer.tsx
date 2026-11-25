"use client";

import React from "react";
import Link from "next/link";
import {
  Send,
  Instagram,
  MapPin,
  Sparkles,
  ArrowUp,
  Heart,
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import TikTokIcon from "@/components/ui/TikTokIcon";
import AuraLogo from "@/components/ui/AuraLogo";
import { BRAND_CONTACT } from "@/config/contact";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-plum border-t border-gold/20 pt-16 pb-8 text-softwhite">
      {/* Decorative top soft glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AuraLogo size="md" showGlow />
              <span className="font-serif text-xl tracking-wider text-softwhite">
                AURA <span className="text-gold text-xs font-sans tracking-widest uppercase">by HANI</span>
              </span>
            </div>
            <p className="text-stone-muted text-sm leading-relaxed max-w-sm">
              Artisanal, luxury boutique fragrances crafted to awaken emotion and leave an unforgettable personal presence. Based in Addis Ababa, Ethiopia.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold font-medium">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-softwhite/80">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home Experience
                </Link>
              </li>
              <li>
                <Link href="/collection" className="hover:text-gold transition-colors">
                  Perfume Collection
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  About HANI
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Contact Channels & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold font-medium">
              Contact
            </h4>
            <ul className="space-y-1 text-sm text-softwhite/80">
              <li>
                <a
                  href={BRAND_CONTACT.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 min-h-[44px] hover:text-gold transition-colors text-softwhite/90"
                >
                  <Send className="w-4 h-4 text-gold flex-shrink-0" />
                  <span className="text-xs">Telegram Chat</span>
                </a>
              </li>
              <li>
                <a
                  href={BRAND_CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 min-h-[44px] hover:text-sage transition-colors text-softwhite/90"
                >
                  <WhatsAppIcon className="w-4 h-4 text-sage flex-shrink-0" />
                  <span className="text-xs">WhatsApp Chat</span>
                </a>
              </li>
              <li>
                <a
                  href={BRAND_CONTACT.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 min-h-[44px] text-stone-muted hover:text-softwhite transition-colors text-xs"
                >
                  <MapPin className="w-4 h-4 text-gold/70 flex-shrink-0" />
                  <span>{BRAND_CONTACT.location}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Channels & Telegram Channel */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold font-medium">
              Follow HANI
            </h4>
            <div className="flex items-center gap-3">
              <a
                href={BRAND_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow HANI on Instagram"
                title="Follow HANI on Instagram"
                className="w-11 h-11 rounded-full bg-midnight border border-rose-dust/30 flex items-center justify-center text-softwhite hover:border-rose-dust hover:text-rose-dust hover:scale-105 transition-all shadow-glow"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={BRAND_CONTACT.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow HANI on TikTok"
                title="Follow HANI on TikTok"
                className="w-11 h-11 rounded-full bg-midnight border border-gold/30 flex items-center justify-center text-softwhite hover:border-gold hover:text-gold hover:scale-105 transition-all shadow-glow"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href={BRAND_CONTACT.telegramChannel || BRAND_CONTACT.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join HANI on Telegram"
                title="Join HANI on Telegram"
                className="w-11 h-11 rounded-full bg-midnight border border-gold/30 flex items-center justify-center text-softwhite hover:border-gold hover:text-gold hover:scale-105 transition-all shadow-glow"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>

            <div className="p-4 rounded-xl bg-midnight/90 border border-gold/25 space-y-2.5">
              <p className="text-xs font-serif text-softwhite font-medium">
                New arrivals on Telegram
              </p>
              <p className="text-[11px] text-stone-muted leading-relaxed">
                Join the channel for new arrivals, restocks and offers.
              </p>
              <a
                href={BRAND_CONTACT.telegramChannel || BRAND_CONTACT.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join Telegram channel for new arrivals and offers"
                title="Join Telegram Channel"
                className="w-full min-h-[44px] px-4 rounded-full bg-gold hover:bg-gold-light text-midnight font-medium text-xs tracking-wider uppercase flex items-center justify-center shadow-glow transition-all"
              >
                Join Channel
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar with back-to-top */}
        <div className="pt-8 mt-8 border-t border-midnight flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-muted">
          <p>© {new Date().getFullYear()} Aura by HANI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-rose-dust fill-rose-dust inline" /> for perfume lovers
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/25 text-softwhite hover:border-gold hover:text-gold transition-colors focus:outline-none"
              aria-label="Back to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
