"use client";

import Link from "next/link";
import {
  Compass,
  Zap,
  Target,
  Layers,
  BookOpen,
  FolderGit2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { InteractiveCareerMap } from "@/components/landing/InteractiveCareerMap";
import { CAREER_TRIALS } from "@/lib/trials-data";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary selection:bg-brand-primary/25 selection:text-brand-primary flex flex-col justify-between">
      {/* Public Navigation */}
      <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-primary to-brand-hover flex items-center justify-center font-bold text-brand-text font-display shadow-sm shadow-brand-glow">
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

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-text-muted">
            <Link href="#journey" className="hover:text-text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/explore" className="hover:text-text-primary transition-colors">
              Explore Careers
            </Link>
            <Link href="/trials" className="hover:text-text-primary transition-colors">
              Micro-Trials
            </Link>
            <Link href="/mentor" className="hover:text-text-primary transition-colors">
              AI Guide
            </Link>
            <Link href="#trust" className="hover:text-text-primary transition-colors">
              Trust & Privacy
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button variant="primary" size="sm">
                <span>Start Career Discovery</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-14 md:pt-18 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-secondary border border-border-subtle text-xs font-medium text-text-muted">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            <span>Question-First • Open-Ended AI • Evidence-Grounded</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display text-text-primary tracking-tight leading-[1.15]">
            Your future isn&apos;t a guess.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-indigo-400 to-mint-brand">
              It&apos;s a path you can build.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto">
            Discover paths tailored to where you actually are, test day-to-day work in 12-minute micro-trials, and consult your grounded AI career guide.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm px-6 py-3 font-bold shadow-brand-glow">
                <span>Begin Career Discovery (5 mins)</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/explore" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm">
                <span>Explore 7 Disciplines</span>
              </Button>
            </Link>
          </div>

          <p className="text-xs text-text-muted pt-1">
            Free to explore. No resume or sign-in required to get started.
          </p>
        </div>

        {/* Interactive Hero Visual */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 md:mt-12">
          <InteractiveCareerMap />
        </div>
      </section>

      {/* 4-Step Product Journey */}
      <section id="journey" className="py-14 md:py-20 bg-surface-secondary/50 border-y border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <Badge variant="amber">The Aaroh Framework</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-text-primary tracking-tight">
              A Clear Journey from Fog to Proof
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              We replace endless quiz predictions and tutorial paralysis with an honest, practical progression.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                label: "Discover",
                title: "Explore Hypotheses",
                desc: "Discover multi-disciplinary career paths filtered by your preferred workstyle, strengths, and curiosities.",
              },
              {
                step: "02",
                label: "Try",
                title: "12-Min Micro-Trial",
                desc: "Test the day-to-day reality in hands-on work simulations before committing hundreds of study hours.",
              },
              {
                step: "03",
                label: "Assess",
                title: "Track Skill Gaps",
                desc: "Understand what is required across 5 transparent evidence states from unassessed to practically demonstrated.",
              },
              {
                step: "04",
                label: "Build",
                title: "Adaptive Roadmap",
                desc: "Execute a realistic step-by-step plan with project briefs, exam-mode throttling, and zero guilt streaks.",
              },
            ].map((col) => (
              <div
                key={col.step}
                className="p-5 rounded-xl bg-surface-card border border-border-subtle space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black font-display text-amber-brand">{col.step}</span>
                    <Badge variant="neutral">{col.label}</Badge>
                  </div>
                  <h3 className="font-bold text-sm text-text-primary font-display">{col.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{col.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meaningful Demonstration: How Aaroh Helps */}
      <section className="py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <Badge variant="emerald">Practical Difference</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-text-primary tracking-tight">
              A Thoughtful Guide, Not an Enterprise Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto">
              How Aaroh differs from generic career portals and personality quiz websites:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-3">
              <span className="text-xs font-bold text-rose-brand uppercase tracking-wider block">
                Typical Career Advice
              </span>
              <ul className="space-y-2 text-xs text-text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-rose-brand shrink-0">✕</span>
                  <span>Rigid personality tests that claim to predict your &quot;one true destiny&quot;.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-brand shrink-0">✕</span>
                  <span>Fabricated salary claims and high-pressure placement guarantees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-brand shrink-0">✕</span>
                  <span>Endless tutorial playlists that never result in verifiable work.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-brand shrink-0">✕</span>
                  <span>Guilt-inducing streak mechanics during college exam weeks.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-surface-card border border-amber-brand/40 shadow-sm space-y-3">
              <span className="text-xs font-bold text-emerald-brand uppercase tracking-wider block">
                The Aaroh Approach
              </span>
              <ul className="space-y-2 text-xs text-text-primary">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-brand shrink-0 mt-0.5" />
                  <span>Exploration hypotheses tested through real 12-minute micro-work simulations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-brand shrink-0 mt-0.5" />
                  <span>Transparent, multi-disciplinary scope across Tech, Commerce, Design, Law, and Science.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-brand shrink-0 mt-0.5" />
                  <span>Practical Project Studio briefs with testing checklists and README templates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-brand shrink-0 mt-0.5" />
                  <span>College Exam Mode: One tap switches to a light 3h/wk plan with zero guilt.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Privacy Section */}
      <section id="trust" className="py-12 bg-surface-secondary/40 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-brand shrink-0" />
              <h3 className="text-base font-bold text-text-primary font-display">
                Our Transparency & Privacy Standard
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              We never fabricate salaries, placement rates, or vacancies. Your progress and reflections are saved locally in your browser. We never sell your personal data or demand resume uploads before showing value.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border-subtle bg-canvas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-text-primary">Aaroh</span>
            <span>— Personal Career Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/explore" className="hover:text-text-primary transition-colors">
              Explore
            </Link>
            <Link href="/trials" className="hover:text-text-primary transition-colors">
              Micro-Trials
            </Link>
            <Link href="/onboarding" className="hover:text-text-primary transition-colors">
              Find Direction
            </Link>
          </div>
          <div>© {new Date().getFullYear()} Aaroh</div>
        </div>
      </footer>
    </div>
  );
}
