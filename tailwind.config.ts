import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        "surface-secondary": "var(--surface-secondary)",
        "surface-card": "var(--surface-card)",
        "surface-interactive": "var(--surface-interactive)",
        "border-subtle": "var(--border-subtle)",
        "border-medium": "var(--border-medium)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        brand: {
          primary: "rgb(var(--brand-primary-rgb) / <alpha-value>)",
          hover: "rgb(var(--brand-hover-rgb) / <alpha-value>)",
          text: "var(--brand-text)",
          surface: "var(--brand-surface)",
          glow: "rgb(var(--brand-primary-rgb) / 0.18)",
          soft: "rgb(var(--brand-primary-rgb) / 0.10)",
        },
        mint: {
          brand: "rgb(var(--mint-brand-rgb) / <alpha-value>)",
          hover: "rgb(var(--mint-hover-rgb) / <alpha-value>)",
          text: "var(--mint-text)",
          surface: "var(--mint-surface)",
          glow: "rgb(var(--mint-brand-rgb) / 0.18)",
          soft: "rgb(var(--mint-brand-rgb) / 0.10)",
        },
        // Forward compatibility / alias mapping for previous color names
        amber: {
          brand: "rgb(var(--brand-primary-rgb) / <alpha-value>)",
          glow: "rgb(var(--brand-primary-rgb) / 0.18)",
          hover: "rgb(var(--brand-hover-rgb) / <alpha-value>)",
          dark: "rgb(var(--brand-hover-rgb) / <alpha-value>)",
          text: "var(--brand-text)",
        },
        emerald: {
          brand: "rgb(var(--mint-brand-rgb) / <alpha-value>)",
          glow: "rgb(var(--mint-brand-rgb) / 0.18)",
          hover: "rgb(var(--mint-hover-rgb) / <alpha-value>)",
          text: "var(--mint-text)",
        },
        rose: {
          brand: "#F43F5E",
          glow: "rgba(244, 63, 94, 0.15)",
          hover: "#E11D48",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["var(--font-manrope)", "Manrope", "Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "brand-glow": "0 0 25px -4px rgb(var(--brand-primary-rgb) / 0.25)",
        "mint-glow": "0 0 25px -4px rgb(var(--mint-brand-rgb) / 0.25)",
        "amber-subtle": "0 0 25px -5px rgb(var(--brand-primary-rgb) / 0.2)",
        "emerald-subtle": "0 0 25px -5px rgb(var(--mint-brand-rgb) / 0.2)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
