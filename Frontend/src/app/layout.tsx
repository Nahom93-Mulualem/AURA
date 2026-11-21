import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Aura by HANI | Luxury Fragrances & Perfume Boutique",
  description:
    "Choose your way. Artisanal perfumes and bespoke scents crafted by HANI. Browse exclusive fragrances and contact directly via Telegram, WhatsApp, or Instagram.",
  keywords: [
    "Aura by HANI",
    "luxury perfume",
    "oud perfume",
    "boutique fragrance",
    "bespoke scents Ethiopia",
    "Addis Ababa perfume",
  ],
  openGraph: {
    title: "Aura by HANI | Luxury Fragrances",
    description: "Choose your way. Scents that stay in memory.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC Theme Initialization Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("aura_theme")||(window.matchMedia("(prefers-color-scheme: light)").matches?"day":"night");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-midnight text-softwhite bg-aura-glow antialiased selection:bg-gold selection:text-midnight font-sans">
        <ThemeProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
