"use client";

import React from "react";
import Link from "next/link";
import {
  Send,
  Instagram,
  Mail,
  Phone,
  Sparkles,
  ArrowUp,
  Heart,
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import TikTokIcon from "@/components/ui/TikTokIcon";
import AuraLogo from "@/components/ui/AuraLogo";
import { BRAND_CONTACT } from "@/data/mockPerfumes";

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
              Contact Channels
            </h4>
            <ul className="space-y-2 text-sm text-softwhite/80">
              <li>
                <a
                  href={`tel:${BRAND_CONTACT.phone}`}
                  className="flex items-center gap-2 hover:text-gold transition-colors"
                >
                  <Phone className="w-4 h-4 text-gold" />
                  <span>{BRAND_CONTACT.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={BRAND_CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-sage transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 text-sage" />
                  <span>WhatsApp Chat</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BRAND_CONTACT.email}`}
                  className="flex items-center gap-2 hover:text-gold transition-colors"
                >
                  <Mail className="w-4 h-4 text-gold" />
                  <span>{BRAND_CONTACT.email}</span>
                </a>
              </li>
              <li className="text-xs text-stone-muted pt-1">
                Location: {BRAND_CONTACT.location}
              </li>
            </ul>
          </div>

          {/* Column 4: Social Channels & Telegram Channel */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold font-medium">
              Connect Directly
            </h4>
            <div className="flex items-center gap-2.5">
              <a
                href={BRAND_CONTACT.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-10 h-10 rounded-full bg-midnight border border-gold/30 flex items-center justify-center text-softwhite hover:border-gold hover:text-gold hover:scale-105 transition-all shadow-glow"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href={BRAND_CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-midnight border border-sage/40 flex items-center justify-center text-sage hover:border-sage hover:scale-105 transition-all shadow-glow"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a
                href={BRAND_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-midnight border border-rose-dust/40 flex items-center justify-center text-softwhite hover:border-rose-dust hover:text-rose-dust hover:scale-105 transition-all shadow-glow"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={BRAND_CONTACT.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-10 h-10 rounded-full bg-midnight border border-gold/30 flex items-center justify-center text-softwhite hover:border-gold hover:text-gold hover:scale-105 transition-all shadow-glow"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${BRAND_CONTACT.email}`}
                aria-label="Email"
                className="w-10 h-10 rounded-full bg-midnight border border-gold/30 flex items-center justify-center text-softwhite hover:border-gold hover:text-gold hover:scale-105 transition-all shadow-glow"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <div className="p-3 rounded-lg bg-midnight/80 border border-gold/15">
              <p className="text-xs text-softwhite font-medium mb-1">
                New Arrivals on Telegram
              </p>
              <p className="text-[11px] text-stone-muted mb-2">
                Join our private VIP channel for exclusive releases & prices.
              </p>
              <a
                href={BRAND_CONTACT.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs py-1.5 px-3 rounded-full bg-gold/15 border border-gold/40 text-gold hover:bg-gold hover:text-midnight transition-colors"
              >
                Join VIP Channel
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
