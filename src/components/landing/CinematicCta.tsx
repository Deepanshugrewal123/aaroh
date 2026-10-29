"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Zap, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CinematicCta() {
  return (
    <section className="relative py-28 px-4 sm:px-6 max-w-4xl mx-auto text-center z-10">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-brand-primary/10 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-secondary/80 border border-border-subtle text-xs font-mono uppercase tracking-widest text-text-muted">
          <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
          <span>Launch Your Trajectory</span>
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-text-primary leading-[1.1]">
          Stop guessing your future.{" "}
          <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-indigo-400 to-mint-brand">
            Start proving your potential.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-text-muted max-w-xl mx-auto leading-relaxed">
          Join students across Engineering, Design, Commerce, Policy, and Science who replace anxiety with hands-on proof of work.
        </p>

        {/* Big Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-sm px-8 py-4 font-bold shadow-xl shadow-brand-glow hover:shadow-brand-primary/50 group"
            >
              <span>Begin Career Discovery (5 mins)</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </Link>
          <Link href="/trials" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-sm px-7 py-4 bg-surface-card/70 backdrop-blur-md hover:bg-surface-interactive/80"
            >
              <Zap className="w-4 h-4 mr-2 text-brand-primary" />
              <span>Explore Micro-Trials</span>
            </Button>
          </Link>
        </div>

        {/* Quick Link Matrix */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-text-muted">
          <Link href="/explore" className="hover:text-text-primary transition-colors flex items-center gap-1">
            <Compass className="w-3 h-3 text-brand-primary" />
            <span>7 Disciplines</span>
          </Link>
          <span>•</span>
          <Link href="/roadmap" className="hover:text-text-primary transition-colors flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-mint-brand" />
            <span>Adaptive Roadmap</span>
          </Link>
          <span>•</span>
          <Link href="/mentor" className="hover:text-text-primary transition-colors flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-brand" />
            <span>Grounded AI Guide</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
