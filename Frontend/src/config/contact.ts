// Centralized Brand & Contact Configuration for AURA by HANI
// All public channels, handles, and phone numbers are managed here.

export interface BrandContactConfig {
  name: string;
  brandName: string;
  tagline: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappDisplay: string;
  whatsappHandle: string;
  telegram: string;
  telegramHandle: string;
  telegramChannel: string;
  instagram: string;
  instagramHandle: string;
  tiktok: string;
  tiktokHandle: string;
  location: string;
  mapsUrl: string;
  email: string;
}

export const BRAND_CONTACT: BrandContactConfig = {
  name: "HANI",
  brandName: "Aura by HANI",
  tagline: "Choose your way. Scents that stay in memory.",

  // Phone & WhatsApp (Verified: +251 93 635 6209)
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+251936356209",
  phoneDisplay: process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY || "+251 93 635 6209",
  whatsapp:
    process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ||
    "https://wa.me/251936356209?text=Hello%20HANI!%20I%20am%20inquiring%20about%20AURA%20perfumes.",
  whatsappDisplay: "+251 93 635 6209",
  whatsappHandle: "+251 93 635 6209",

  // Telegram Direct Chat
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/Niha027",
  telegramHandle: process.env.NEXT_PUBLIC_TELEGRAM_HANDLE || "@Niha027",

  // Telegram Channel (Channel link to be provided later by owner)
  telegramChannel: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || "https://t.me/Niha027", // [CHANNEL_PLACEHOLDER - to be updated with dedicated broadcast channel]

  // Social Media Handles
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/aura_by_hanii",
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "@aura_by_hanii",

  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://tiktok.com/@aura.by.hani",
  tiktokHandle: process.env.NEXT_PUBLIC_TIKTOK_HANDLE || "@aura.by.hani",

  // Physical Presence
  location: "Addis Ababa, Ethiopia",
  mapsUrl: "https://maps.google.com/?q=Addis+Ababa,+Ethiopia",

  // Optional Email (Removed from footer per user request)
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "aurabyhani@gmail.com",
};
