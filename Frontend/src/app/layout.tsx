import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Aura by HANI | Luxury Fragrances & Perfume Boutique",
  description:
    "Wear your aura. Artisanal perfumes and bespoke scents crafted by HANI. Browse exclusive fragrances and contact directly via Telegram or Instagram.",
  keywords: [
    "Aura by HANI",
    "luxury perfume",
    "oud perfume",
    "boutique fragrance",
    "bespoke scents",
  ],
  openGraph: {
    title: "Aura by HANI | Luxury Fragrances",
    description: "Wear your aura. Scents that stay in memory.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0E0B10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-midnight text-softwhite bg-aura-glow antialiased selection:bg-gold selection:text-midnight font-sans">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
