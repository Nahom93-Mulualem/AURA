import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aura by HANI | Handcrafted Perfumery",
  description:
    "An ethereal fragrance house by Hani. Bespoke, evocative scents born from passion and the finest raw materials in Addis Ababa.",
  keywords: [
    "perfume",
    "fragrance",
    "artisan perfume",
    "Addis Ababa",
    "luxury fragrance",
    "scent",
    "Aura by HANI",
  ],
  authors: [{ name: "Hani" }],
};

export const viewport: Viewport = {
  themeColor: "#0E0B10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        {/* Anti-FOUC Theme Initialization Script */}
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("aura-theme")||localStorage.getItem("aura_theme");var t=s==="light"||s==="day"?"light":(s==="dark"||s==="night"?"dark":(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"));document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute("content",t==="dark"?"#0E0B10":"#FAF6F0");}}catch(e){}})();`,
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
