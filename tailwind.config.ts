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
          primary: "#6D8DFF",
          hover: "#89A3FF",
          glow: "rgba(109, 141, 255, 0.18)",
          soft: "rgba(109, 141, 255, 0.10)",
        },
        mint: {
          brand: "#5EEAD4",
          hover: "#2DD4BF",
          surface: "#123B3A",
          glow: "rgba(94, 234, 212, 0.18)",
          soft: "rgba(94, 234, 212, 0.10)",
        },
        // Forward compatibility / alias mapping for previous color names
        amber: {
          brand: "#6D8DFF",
          glow: "rgba(109, 141, 255, 0.18)",
          hover: "#89A3FF",
          dark: "#4B6EE6",
        },
        emerald: {
          brand: "#5EEAD4",
          glow: "rgba(94, 234, 212, 0.18)",
          hover: "#2DD4BF",
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
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        "brand-glow": "0 0 25px -4px rgba(109, 141, 255, 0.25)",
        "mint-glow": "0 0 25px -4px rgba(94, 234, 212, 0.25)",
        "amber-subtle": "0 0 25px -5px rgba(109, 141, 255, 0.2)",
        "emerald-subtle": "0 0 25px -5px rgba(94, 234, 212, 0.2)",
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
