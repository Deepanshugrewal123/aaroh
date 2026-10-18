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
        "text-muted": "var(--text-muted)",
        amber: {
          brand: "#F59E0B",
          glow: "rgba(245, 158, 11, 0.15)",
          hover: "#D97706",
          dark: "#B45309",
        },
        emerald: {
          brand: "#34D399",
          glow: "rgba(52, 211, 153, 0.15)",
          hover: "#10B981",
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
        "amber-subtle": "0 0 25px -5px rgba(245, 158, 11, 0.2)",
        "emerald-subtle": "0 0 25px -5px rgba(52, 211, 153, 0.2)",
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
