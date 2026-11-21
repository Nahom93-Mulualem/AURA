"use client";

import React, { useState } from "react";
import {
  Send,
  Instagram,
  Mail,
  Phone,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import TikTokIcon from "@/components/ui/TikTokIcon";
import { BRAND_CONTACT } from "@/data/mockPerfumes";

const FAQ_ITEMS = [
  {
    q: "How do I place an order in Ethiopia?",
    a: "Ordering is personal and direct! Simply click on any perfume and press 'Order on Telegram', 'WhatsApp', or 'Inquire on Instagram'. This connects you directly with HANI to confirm availability, packaging, and delivery in Addis Ababa or regional destinations.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept local Ethiopian mobile banking and bank transfers (such as Telebirr, CBE Birr, Awash, or Bank of Abyssinia) as well as cash on boutique delivery within Addis Ababa.",
  },
  {
    q: "Are all perfumes 100% original?",
    a: "Yes, without exception. Every single bottle in the Aura collection is sourced from authenticated distributors and verified niche perfume houses. We pride ourselves on boutique authenticity.",
  },
  {
    q: "How long does delivery take?",
    a: "Within Addis Ababa, delivery is completed within 24 hours. For regional cities in Ethiopia, packages are sent via reliable express logistics within 2–3 business days.",
  },
  {
    q: "Can I receive scent advice before deciding?",
    a: "Absolutely. HANI offers complimentary fragrance consultation. Tell her what notes you love (oud, vanilla, floral, or leather) and your budget, and she will recommend your ideal match.",
  },
];

export default function ContactPage() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  return (
    <div className="pt-28 pb-20 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium inline-block">
          Direct Boutique Access
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-softwhite">
          Contact HANI
        </h1>
        <p className="text-sm text-stone-muted leading-relaxed">
          We maintain a close, personal relationship with every fragrance lover. Connect with HANI through your preferred channel below.
        </p>
      </div>

      {/* Contact Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
        {/* Telegram */}
        <div className="p-6 rounded-card bg-plum/60 border border-gold/30 shadow-glow flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-midnight border border-gold/40 flex items-center justify-center text-gold">
              <Send className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] tracking-wider uppercase font-semibold">
              Most Popular
            </span>
          </div>
          <div>
            <h3 className="font-serif text-xl text-softwhite">Telegram</h3>
            <p className="text-xs text-stone-muted mt-1">
              Direct chat for quick consultations, photos, and orders.
            </p>
            <p className="text-sm text-gold font-mono mt-2">
              {BRAND_CONTACT.telegramHandle}
            </p>
          </div>
          <a
            href={BRAND_CONTACT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] rounded-full bg-gold hover:bg-gold-light text-midnight text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors shadow-glow"
          >
            <span>Open Telegram</span>
            <Send className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* WhatsApp */}
        <div className="p-6 rounded-card bg-plum/60 border border-sage/40 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-midnight border border-sage/40 flex items-center justify-center text-sage">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-sage/15 text-sage text-[10px] tracking-wider uppercase font-semibold">
              Direct WhatsApp
            </span>
          </div>
          <div>
            <h3 className="font-serif text-xl text-softwhite">WhatsApp</h3>
            <p className="text-xs text-stone-muted mt-1">
              Chat directly or request voice notes and bottle videos.
            </p>
            <p className="text-sm text-sage font-mono mt-2">
              {BRAND_CONTACT.whatsappHandle}
            </p>
          </div>
          <a
            href={BRAND_CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] rounded-full bg-plum border border-sage/40 hover:border-sage text-softwhite hover:text-sage text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Chat on WhatsApp</span>
            <WhatsAppIcon className="w-4 h-4 text-sage" />
          </a>
        </div>

        {/* Instagram */}
        <div className="p-6 rounded-card bg-plum/60 border border-rose-dust/30 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-midnight border border-rose-dust/40 flex items-center justify-center text-rose-dust">
              <Instagram className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-dust/15 text-rose-dust text-[10px] tracking-wider uppercase font-semibold">
              Aesthetic Stories
            </span>
          </div>
          <div>
            <h3 className="font-serif text-xl text-softwhite">Instagram</h3>
            <p className="text-xs text-stone-muted mt-1">
              Follow bottle photography, new releases, and DM inquiries.
            </p>
            <p className="text-sm text-rose-dust font-mono mt-2">
              {BRAND_CONTACT.instagramHandle}
            </p>
          </div>
          <a
            href={BRAND_CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] rounded-full bg-plum border border-rose-dust/40 hover:border-rose-dust text-softwhite text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Open Instagram</span>
            <Instagram className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* TikTok */}
        <div className="p-6 rounded-card bg-plum/60 border border-gold/20 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-midnight border border-gold/40 flex items-center justify-center text-gold">
              <TikTokIcon className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] tracking-wider uppercase font-semibold">
              Fragrance Videos
            </span>
          </div>
          <div>
            <h3 className="font-serif text-xl text-softwhite">TikTok</h3>
            <p className="text-xs text-stone-muted mt-1">
              Unboxing, scent reviews, and application tips.
            </p>
            <p className="text-sm text-gold font-mono mt-2">
              {BRAND_CONTACT.tiktokHandle}
            </p>
          </div>
          <a
            href={BRAND_CONTACT.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] rounded-full bg-midnight border border-gold/30 hover:border-gold text-softwhite hover:text-gold text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Open TikTok</span>
            <TikTokIcon className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Phone / Call */}
        <div className="p-6 rounded-card bg-plum/60 border border-gold/20 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-midnight border border-gold/30 flex items-center justify-center text-gold">
              <Phone className="w-5 h-5" />
            </div>
            <button
              onClick={() => handleCopy(BRAND_CONTACT.phone, "phone")}
              className="p-2 rounded-full hover:bg-midnight/80 text-stone-muted hover:text-gold transition-colors"
              aria-label="Copy phone number"
            >
              {copiedItem === "phone" ? (
                <Check className="w-4 h-4 text-sage" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div>
            <h3 className="font-serif text-xl text-softwhite">Phone Call</h3>
            <p className="text-xs text-stone-muted mt-1">
              Call HANI directly for urgent inquiries or orders.
            </p>
            <p className="text-sm text-softwhite font-mono mt-2">
              {BRAND_CONTACT.phoneDisplay}
            </p>
          </div>
          <a
            href={`tel:${BRAND_CONTACT.phone}`}
            className="w-full min-h-[44px] rounded-full bg-midnight border border-gold/30 hover:border-gold text-softwhite hover:text-gold text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Call Now</span>
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Email */}
        <div className="p-6 rounded-card bg-plum/60 border border-gold/20 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-midnight border border-gold/30 flex items-center justify-center text-gold">
              <Mail className="w-5 h-5" />
            </div>
            <button
              onClick={() => handleCopy(BRAND_CONTACT.email, "email")}
              className="p-2 rounded-full hover:bg-midnight/80 text-stone-muted hover:text-gold transition-colors"
              aria-label="Copy email"
            >
              {copiedItem === "email" ? (
                <Check className="w-4 h-4 text-sage" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div>
            <h3 className="font-serif text-xl text-softwhite">Email Inquiries</h3>
            <p className="text-xs text-stone-muted mt-1">
              For corporate gifting, bulk orders, or inquiries.
            </p>
            <p className="text-sm text-softwhite font-mono mt-2 truncate">
              {BRAND_CONTACT.email}
            </p>
          </div>
          <a
            href={`mailto:${BRAND_CONTACT.email}`}
            className="w-full min-h-[44px] rounded-full bg-midnight border border-gold/30 hover:border-gold text-softwhite hover:text-gold text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Send Email</span>
            <Mail className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium block mb-1">
            Common Questions
          </span>
          <h2 className="font-serif text-3xl text-softwhite">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-plum/40 border border-gold/15 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-sm sm:text-base font-serif text-softwhite hover:text-gold transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gold transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-stone-muted leading-relaxed border-t border-gold/10 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
