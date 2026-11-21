"use client";

import React, { useState } from "react";
import {
  Send,
  Instagram,
  Mail,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { BRAND_CONTACT } from "@/data/mockPerfumes";

const FAQ_ITEMS = [
  {
    q: "How do I place an order?",
    a: "Ordering is personal and direct! Simply click on any perfume and press 'Order on Telegram' or 'Inquire on Instagram'. This will open a prefilled chat directly with HANI to confirm availability, packaging, and delivery options.",
  },
  {
    q: "Are all perfumes 100% original?",
    a: "Yes, without exception. Every single bottle in the Aura collection is sourced from authenticated distributors and verified perfume houses. We pride ourselves on boutique authenticity.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders are prepared and securely packaged within 24 hours. Local courier delivery typically arrives within 1–2 business days. Regional and international shipping times are confirmed during your chat with HANI.",
  },
  {
    q: "Can I receive scent advice before deciding?",
    a: "Absolutely. HANI offers complimentary fragrance consultation. Tell her what scents you currently enjoy or the vibe you are seeking, and she will provide tailored recommendations.",
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
          We maintain a close, personal relationship with every customer. Connect with HANI through your preferred channel below.
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
              Fastest Reply
            </span>
          </div>
          <div>
            <h3 className="font-serif text-xl text-softwhite">Telegram</h3>
            <p className="text-xs text-stone-muted mt-1">
              Direct chat for questions, photos, and orders.
            </p>
            <p className="text-sm text-gold font-mono mt-2">
              {BRAND_CONTACT.telegramHandle}
            </p>
          </div>
          <a
            href={BRAND_CONTACT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] rounded-full bg-gold hover:bg-gold-light text-midnight text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Open Telegram</span>
            <Send className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Instagram */}
        <div className="p-6 rounded-card bg-plum/60 border border-rose-dust/30 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-midnight border border-rose-dust/40 flex items-center justify-center text-rose-dust">
              <Instagram className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-dust/15 text-rose-dust text-[10px] tracking-wider uppercase font-semibold">
              Visual Stories
            </span>
          </div>
          <div>
            <h3 className="font-serif text-xl text-softwhite">Instagram</h3>
            <p className="text-xs text-stone-muted mt-1">
              Stories, aesthetic bottle showcases, and DM inquiries.
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

        {/* Phone / WhatsApp */}
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
            <h3 className="font-serif text-xl text-softwhite">Direct Call</h3>
            <p className="text-xs text-stone-muted mt-1">
              Speak with HANI directly during studio hours.
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
              For custom orders, collaborations, and formal inquiries.
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
