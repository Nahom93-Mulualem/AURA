"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, Send, Instagram, Shield } from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { BRAND_CONTACT } from "@/data/mockPerfumes";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Collection", href: "/collection" },
  { name: "About HANI", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-midnight/90 backdrop-blur-md border-b border-gold/15 py-3 shadow-glow"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 text-left"
            aria-label="Aura by HANI Home"
          >
            <Sparkles className="w-5 h-5 text-gold transition-transform group-hover:rotate-12 duration-300" />
            <div>
              <span className="block font-serif text-lg sm:text-xl tracking-wider text-softwhite group-hover:text-gold transition-colors">
                AURA
              </span>
              <span className="block text-[10px] tracking-[0.25em] text-gold uppercase -mt-1">
                by HANI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-sm tracking-wide transition-colors py-1 ${
                    isActive
                      ? "text-gold font-medium"
                      : "text-softwhite/80 hover:text-gold"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full transition-all" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Direct Contact CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={BRAND_CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="w-9 h-9 rounded-full border border-sage/40 flex items-center justify-center text-sage hover:bg-sage/10 transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
            <a
              href={BRAND_CONTACT.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold/40 text-xs uppercase tracking-wider text-softwhite hover:border-gold hover:bg-gold/10 hover:text-gold transition-all duration-300 shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-gold" />
              <span>Contact HANI</span>
            </a>
          </div>

          {/* Mobile Hamburger Toggle Button (min 44x44px target) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-full text-softwhite hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-in Overlay Navigation */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 bg-midnight/98 backdrop-blur-xl flex flex-col justify-between pt-24 pb-8 px-6 md:hidden animate-in fade-in duration-200"
        >
          <div className="flex flex-col gap-6 mt-4">
            <span className="text-[11px] tracking-[0.2em] text-gold uppercase font-medium">
              Navigation
            </span>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-2xl font-serif tracking-wide py-2 border-b border-plum/80 flex items-center justify-between ${
                    isActive ? "text-gold font-medium" : "text-softwhite"
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-gold" />}
                </Link>
              );
            })}

            <Link
              href="/admin"
              className="text-sm font-serif tracking-wide text-stone-muted hover:text-gold flex items-center gap-2 pt-2"
            >
              <Shield className="w-4 h-4 text-gold/60" />
              <span>Admin Studio Portal</span>
            </Link>
          </div>

          {/* Mobile Social & Direct Actions */}
          <div className="space-y-4 pt-6 border-t border-plum">
            <p className="text-xs text-stone-muted tracking-wider uppercase">
              Direct Inquiries & Orders
            </p>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={BRAND_CONTACT.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-full bg-plum border border-gold/30 text-xs font-medium text-softwhite active:bg-gold/20"
              >
                <Send className="w-3.5 h-3.5 text-gold" />
                <span>Telegram</span>
              </a>
              <a
                href={BRAND_CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-full bg-plum border border-sage/40 text-xs font-medium text-softwhite active:bg-sage/20"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-sage" />
                <span>WhatsApp</span>
              </a>
              <a
                href={BRAND_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-full bg-plum border border-rose-dust/30 text-xs font-medium text-softwhite active:bg-rose-dust/20"
              >
                <Instagram className="w-3.5 h-3.5 text-rose-dust" />
                <span>Insta</span>
              </a>
            </div>
            <p className="text-center text-xs text-stone-muted pt-2">
              Boutique Perfumery by {BRAND_CONTACT.name} • Addis Ababa
            </p>
          </div>
        </div>
      )}
    </>
  );
}
