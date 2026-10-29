"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles, ChevronDown, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { soundEngine } from "./SoundAmbienceToggle";

interface CinematicHeroProps {
  activeDisciplineIndex: number;
  onSelectDiscipline: (index: number) => void;
}

const HERO_CURIOSITY_SPARKS = [
  { label: "Systems & Architecture", icon: "⚙️", discipline: "Engineering" },
  { label: "Human Experience & UX", icon: "🎨", discipline: "Design & Arts" },
  { label: "Capital, Margins & Strategy", icon: "📈", discipline: "Commerce" },
  { label: "Law & Public Policy", icon: "⚖️", discipline: "Policy & Law" },
  { label: "Science & Data", icon: "🔬", discipline: "Sciences" },
  { label: "Healthcare & Life", icon: "🧬", discipline: "Life Sciences" },
  { label: "Tech Journalism", icon: "📰", discipline: "Media" },
];

export function CinematicHero({ activeDisciplineIndex, onSelectDiscipline }: CinematicHeroProps) {
  const handleSparkClick = (idx: number) => {
    onSelectDiscipline(idx);
    soundEngine?.playChime(idx);
    const el = document.getElementById("constellations");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between pt-8 pb-12 px-4 sm:px-6 max-w-6xl mx-auto z-10">
      {/* Top Editorial Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono tracking-widest text-text-muted/80 uppercase border-b border-border-subtle/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <span>[ AAROH // SYSTEM v1.0.4 ]</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>[ 7 DISCIPLINES MAPPED ]</span>
          <span>•</span>
          <span>[ 100% LOCAL-FIRST PRIVACY ]</span>
        </div>
        <div className="flex items-center gap-1.5 text-mint-brand font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>EVIDENCE-GROUNDED</span>
        </div>
      </div>

      {/* Main Dramatic Editorial Core */}
      <div className="my-auto py-8 text-center space-y-6 max-w-4xl mx-auto">
        {/* Category Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-secondary/80 border border-border-subtle backdrop-blur-md text-xs font-semibold text-text-secondary shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
          <span>Question-First • Open-Ended AI • Zero Guesswork</span>
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-text-primary leading-[1.08]">
          Your future isn&apos;t a guess.{" "}
          <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-indigo-400 to-mint-brand animate-fade-in">
            It&apos;s a path you can build.
          </span>
        </h1>

        {/* Editorial Subtitle */}
        <p className="text-base sm:text-xl text-text-muted leading-relaxed max-w-2xl mx-auto font-sans font-normal">
          Discover hypotheses tailored to your real starting point, test day-to-day realities in 12-minute micro-trials, and build verifiable skill evidence.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-sm px-7 py-3.5 font-bold shadow-lg shadow-brand-glow hover:shadow-brand-primary/40 group"
            >
              <span>Begin Career Discovery</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="#constellation" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-sm px-6 py-3.5 bg-surface-card/60 backdrop-blur-md hover:bg-surface-interactive/80"
            >
              <Compass className="w-4 h-4 mr-2 text-brand-primary" />
              <span>Explore 7 Disciplines</span>
            </Button>
          </a>
        </div>

        {/* Curiosity Sparks: Interactive 3D Nodes Switcher */}
        <div className="pt-8 space-y-2.5">
          <p className="text-xs font-mono uppercase tracking-widest text-text-muted">
            Choose a curiosity spark to orbit the constellation:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {HERO_CURIOSITY_SPARKS.map((spark, idx) => {
              const isSelected = activeDisciplineIndex === idx;
              return (
                <button
                  key={spark.label}
                  onClick={() => handleSparkClick(idx)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-brand-primary text-brand-text border-brand-primary shadow-md shadow-brand-glow scale-105"
                      : "bg-surface-secondary/70 backdrop-blur-sm text-text-muted hover:text-text-primary border-border-subtle hover:border-border-medium hover:bg-surface-interactive/80"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span>{spark.icon}</span>
                  <span>{spark.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="flex flex-col items-center justify-center gap-1 text-[11px] font-mono tracking-widest text-text-muted/70 pt-4">
        <a
          href="#constellation"
          className="flex flex-col items-center gap-1.5 hover:text-text-primary transition-colors group"
        >
          <span className="uppercase text-[10px] tracking-widest">Scroll to Enter Journey</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-brand-primary group-hover:scale-125 transition-transform" />
        </a>
      </div>
    </section>
  );
}
