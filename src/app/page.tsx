"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { CareerConstellationCanvas } from "@/components/landing/CareerConstellationCanvas";
import { SoundAmbienceToggle } from "@/components/landing/SoundAmbienceToggle";
import { CinematicHero } from "@/components/landing/CinematicHero";
import { ConstellationExplorer } from "@/components/landing/ConstellationExplorer";
import { FrameworkTimeline } from "@/components/landing/FrameworkTimeline";
import { ComparisonMatrix } from "@/components/landing/ComparisonMatrix";
import { LiveTrialPreview } from "@/components/landing/LiveTrialPreview";
import { TrustSection } from "@/components/landing/TrustSection";
import { CinematicCta } from "@/components/landing/CinematicCta";

const HUD_SECTIONS = [
  { id: "hero", label: "01 // ORIGIN" },
  { id: "constellations", label: "02 // CONSTELLATIONS" },
  { id: "journey", label: "03 // FRAMEWORK" },
  { id: "difference", label: "04 // CONTRAST" },
  { id: "simulation", label: "05 // SIMULATION" },
  { id: "trust", label: "06 // SOVEREIGNTY" },
  { id: "launch", label: "07 // LAUNCHPAD" },
];

export default function LandingPage() {
  const [activeDisciplineIndex, setActiveDisciplineIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [activeHudIndex, setActiveHudIndex] = useState(0);

  // Sync dark theme mode with document element
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    window.addEventListener("aaroh_theme_change", checkTheme);

    const observer = new MutationObserver(() => {
      checkTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("aaroh_theme_change", checkTheme);
      observer.disconnect();
    };
  }, []);

  // Throttled scroll progress listener
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const maxScroll = Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight
          );
          const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
          setScrollProgress(progress);

          // Update active HUD section index based on current scroll position
          const hudIdx = Math.min(
            HUD_SECTIONS.length - 1,
            Math.floor(progress * HUD_SECTIONS.length)
          );
          setActiveHudIndex(hudIdx);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-canvas text-text-primary selection:bg-brand-primary/25 selection:text-brand-primary flex flex-col justify-between overflow-x-hidden">
      {/* Three.js Cinematic WebGL Constellation Canvas */}
      <CareerConstellationCanvas
        activeDisciplineIndex={activeDisciplineIndex}
        scrollProgress={scrollProgress}
        isDark={isDark}
      />

      {/* Global Cinematic Top Navigation */}
      <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-border-subtle/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-primary to-brand-hover flex items-center justify-center font-bold text-brand-text font-display shadow-sm shadow-brand-glow group-hover:scale-105 transition-transform">
              आ
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg tracking-tight text-text-primary leading-none">
                Aaroh
              </span>
              <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">
                Career Intelligence
              </span>
            </div>
          </Link>

          {/* Navigation Anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-text-muted">
            <button
              onClick={() => scrollToSection("constellations")}
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              Constellations
            </button>
            <button
              onClick={() => scrollToSection("journey")}
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <Link
              href="/explore"
              className="hover:text-text-primary transition-colors"
            >
              Explore 7 Roles
            </Link>
            <button
              onClick={() => scrollToSection("simulation")}
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              Live Micro-Trial
            </button>
            <Link
              href="/mentor"
              className="hover:text-text-primary transition-colors"
            >
              AI Guide
            </Link>
            <button
              onClick={() => scrollToSection("trust")}
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              Privacy & Trust
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            <SoundAmbienceToggle />
            <ThemeToggle />
            <Link href="/dashboard" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button variant="primary" size="sm" className="shadow-brand-glow">
                <span>Discover Path</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Floating Side Editorial HUD Tracker (Desktop XL only) */}
      <aside
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3 pointer-events-none"
        aria-hidden="true"
      >
        <div className="p-3 rounded-2xl bg-surface-card/60 backdrop-blur-md border border-border-subtle/80 flex flex-col gap-2 pointer-events-auto shadow-lg">
          <div className="text-[9px] font-mono text-text-muted/60 tracking-widest uppercase border-b border-border-subtle/60 pb-1 px-1">
            TELEMETRY HUD
          </div>
          {HUD_SECTIONS.map((sec, idx) => {
            const isActive = idx === activeHudIndex;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`flex items-center gap-2 text-left px-1.5 py-1 rounded transition-all text-[10px] font-mono tracking-wider ${
                  isActive
                    ? "text-brand-primary font-bold bg-brand-primary/10"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-transform ${
                    isActive ? "bg-brand-primary scale-125" : "bg-border-subtle"
                  }`}
                />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Cinematic Sections */}
      <main className="relative z-10 flex-1">
        {/* 01. Cinematic Hero Section */}
        <div id="hero">
          <CinematicHero
            activeDisciplineIndex={activeDisciplineIndex}
            onSelectDiscipline={setActiveDisciplineIndex}
          />
        </div>

        {/* 02. Multidisciplinary Constellation Explorer */}
        <div id="constellations">
          <ConstellationExplorer
            activeDisciplineIndex={activeDisciplineIndex}
            onSelectDiscipline={setActiveDisciplineIndex}
          />
        </div>

        {/* 03. 4-Step Editorial Framework Timeline */}
        <div id="journey">
          <FrameworkTimeline />
        </div>

        {/* 04. Practical Difference Comparison Matrix */}
        <div id="difference">
          <ComparisonMatrix />
        </div>

        {/* 05. Live Interactive Micro-Trial Simulation Preview */}
        <div id="simulation">
          <LiveTrialPreview />
        </div>

        {/* 06. Trust & Privacy Sovereignty */}
        <div id="trust">
          <TrustSection />
        </div>

        {/* 07. Grand Launchpad Finale */}
        <div id="launch">
          <CinematicCta />
        </div>
      </main>

      {/* Global Footer */}
      <footer className="relative z-10 py-10 border-t border-border-subtle bg-surface-card/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-text-muted">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-brand-primary/20 text-brand-primary font-bold flex items-center justify-center text-[10px]">
                आ
              </span>
              <span className="font-display font-bold text-text-primary">
                Aaroh
              </span>
            </div>
            <span className="hidden sm:inline text-border-subtle">•</span>
            <span>Local-First Personal Career Intelligence for Students</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium">
            <Link
              href="/explore"
              className="hover:text-text-primary transition-colors"
            >
              Explore Disciplines
            </Link>
            <Link
              href="/trials"
              className="hover:text-text-primary transition-colors"
            >
              Micro-Trials
            </Link>
            <Link
              href="/roadmap"
              className="hover:text-text-primary transition-colors"
            >
              Roadmap
            </Link>
            <Link
              href="/projects"
              className="hover:text-text-primary transition-colors"
            >
              Project Studio
            </Link>
            <Link
              href="/mentor"
              className="hover:text-text-primary transition-colors"
            >
              AI Guide
            </Link>
            <Link
              href="/onboarding"
              className="hover:text-text-primary transition-colors text-brand-primary font-semibold"
            >
              Begin Discovery
            </Link>
          </div>

          <div className="text-center md:text-right font-mono text-[11px] text-text-muted/80">
            © {new Date().getFullYear()} Aaroh. Zero tracking. Student sovereign.
          </div>
        </div>
      </footer>
    </div>
  );
}
