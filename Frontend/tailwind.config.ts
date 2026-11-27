import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "rgba(var(--theme-bg-midnight), <alpha-value>)",
        plum: "rgba(var(--theme-bg-plum), <alpha-value>)",
        ivory: "#FAF6F0",
        gold: {
          DEFAULT: "rgba(var(--theme-gold), <alpha-value>)",
          light: "rgba(var(--theme-gold-light), <alpha-value>)",
          dark: "rgba(var(--theme-gold-dark), <alpha-value>)",
        },
        rose: {
          dust: "rgba(var(--theme-rose-dust), <alpha-value>)",
        },
        softwhite: "rgba(var(--theme-text-softwhite), <alpha-value>)",
        charcoal: "#1D1A1F",
        stone: {
          muted: "rgba(var(--theme-text-muted), <alpha-value>)",
        },
        sage: "rgba(var(--theme-sage), <alpha-value>)",
        clay: "rgba(var(--theme-clay), <alpha-value>)",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "'Playfair Display'", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 40px rgba(201, 166, 107, 0.15)",
        "glow-lg": "0 15px 50px rgba(201, 166, 107, 0.25)",
      },
      borderRadius: {
        card: "12px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
