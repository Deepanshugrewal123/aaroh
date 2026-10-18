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
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { InteractiveCareerMap } from "@/components/landing/InteractiveCareerMap";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { CAREER_TRIALS } from "@/lib/trials-data";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary selection:bg-amber-brand/20 selection:text-amber-300">
      {/* Public Navigation */}
      <header className="sticky top-0 z-50 bg-canvas/85 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-brand to-amber-hover flex items-center justify-center font-bold text-neutral-950 font-display shadow-amber-subtle">
              आ
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-text-primary leading-none">
                Aaroh
              </span>
              <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">
                Personal Career Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
            <Link href="#how-it-works" className="hover:text-text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/explore" className="hover:text-text-primary transition-colors">
              Explore Careers
            </Link>
            <Link href="/trials" className="hover:text-text-primary transition-colors">
              Career Trials
            </Link>
            <Link href="#trust-pledge" className="hover:text-text-primary transition-colors">
              Our Trust Pledge
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
                <span>Find My Direction</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-interactive border border-border-subtle text-xs font-medium text-text-muted">
              <Sparkles className="w-3.5 h-3.5 text-amber-brand" />
              <span>Student-First • Multi-Disciplinary • Evidence-Based</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-text-primary font-display tracking-tight leading-[1.1]">
              Your future isn&apos;t a guess.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-brand via-amber-hover to-emerald-brand">
                It&apos;s a path you can build.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto">
              Discover career paths that make sense for you. Understand the skills you need. Turn your next step into measurable, real-world progress without fake certainty or algorithmic hype.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-amber-subtle">
                  <span>Start Career Discovery</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/trials" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  <Zap className="w-4 h-4 mr-1 text-amber-brand" />
                  <span>Try a 12-Min Micro-Trial</span>
                </Button>
              </Link>
            </div>

            <p className="text-xs text-text-muted pt-1">
              Beginner-friendly. No prior resume or technical experience required.
            </p>
          </div>

          {/* Interactive Hero Visual */}
          <div className="mt-12 md:mt-16">
            <InteractiveCareerMap />
          </div>
        </div>
      </section>

      {/* The 4-Step Product Workflow */}
      <section id="how-it-works" className="py-16 md:py-24 bg-surface-secondary/50 border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <Badge variant="amber">The Aaroh Framework</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold text-text-primary font-display tracking-tight">
              From Career Fog to Verified Capability
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Most platforms push you into random video courses or predict your destiny with generic personality quizzes. Aaroh guides you through an honest, evidence-based loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Discover Hypotheses",
                desc: "Explore realistic multidisciplinary career paths filtered by your preferred workstyle, strengths, and curiosities.",
                badge: "Explore",
                icon: Compass,
              },
              {
                step: "02",
                title: "Try the Work",
                desc: "Experience real daily decisions in a 12-minute micro-trial before investing hundreds of hours of study time.",
                badge: "Signature",
                icon: Zap,
              },
              {
                step: "03",
                title: "Assess & Track Gaps",
                desc: "Map required role skills across 5 transparent evidence states from unassessed to independently verified.",
                badge: "Skill Intelligence",
                icon: Layers,
              },
              {
                step: "04",
                title: "Build & Prove",
                desc: "Execute an adaptive roadmap with concrete project deliverables, public code/documents, and zero fake achievements.",
                badge: "Action",
                icon: FolderGit2,
              },
            ].map((col) => {
              const Icon = col.icon;
              return (
                <Card key={col.step} hoverEffect className="relative flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black font-display text-amber-brand/80">
                        {col.step}
                      </span>
                      <Badge variant="neutral">{col.badge}</Badge>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-surface-interactive flex items-center justify-center text-text-primary">
                      <Icon className="w-5 h-5 text-amber-brand" />
                    </div>
                    <h3 className="font-bold text-base text-text-primary font-display">
                      {col.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {col.desc}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Career Trials Preview */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <Badge variant="emerald">Signature Differentiator</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-display tracking-tight mt-1.5">
                Career Trial Mode: Experience Before You Commit
              </h2>
              <p className="text-sm text-text-muted mt-1 max-w-xl">
                Small, realistic work simulations designed to give you a genuine taste of what people in these roles actually do all day.
              </p>
            </div>
            <Link href="/trials">
              <Button variant="outline" size="sm">
                <span>View All Trials</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAREER_TRIALS.slice(0, 3).map((trial) => (
              <Card key={trial.id} hoverEffect className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-amber-brand flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {trial.estimatedMinutes} mins
                    </span>
                    <Badge variant="neutral">{trial.discipline.replace("_", " ")}</Badge>
                  </div>
                  <CardTitle className="text-base">{trial.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {trial.objective}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="p-3 rounded-lg bg-surface-secondary/70 border border-border-subtle text-xs text-text-muted mb-4">
                    <p className="font-semibold text-text-primary mb-1">Scenario:</p>
                    <p className="line-clamp-2">{trial.scenario}</p>
                  </div>
                  <Link href={`/trials?id=${trial.id}`}>
                    <Button variant="primary" size="sm" className="w-full">
                      Start Micro-Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transparency Information */}
      <section id="trust-pledge" className="py-16 bg-surface-secondary/40 border-t border-border-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-surface-card border border-border-subtle p-6 sm:p-10 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-brand">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-text-primary font-display">
                  Our Non-Negotiable Trust & AI Transparency Pledge
                </h3>
                <p className="text-xs text-text-muted">
                  How Aaroh treats your career data and what we promise never to do
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs text-text-muted leading-relaxed">
              <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-surface-secondary/60 border border-border-subtle">
                <CheckCircle2 className="w-4 h-4 text-emerald-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary block mb-0.5">Zero Fabricated Salaries or Stats</strong>
                  We never invent salary ranges, placement percentages, or job vacancy counts. Every stat references official sources.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-surface-secondary/60 border border-border-subtle">
                <CheckCircle2 className="w-4 h-4 text-emerald-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary block mb-0.5">Exploratory Hypotheses, Not Destiny</strong>
                  We never claim an AI algorithm knows your &quot;one true career&quot;. Career matching is a hypothesis for you to test hands-on.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-surface-secondary/60 border border-border-subtle">
                <CheckCircle2 className="w-4 h-4 text-emerald-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary block mb-0.5">Multi-Disciplinary First</strong>
                  Aaroh is built for Commerce, Arts, Law, Healthcare, Science, and Humanities students as respectfully as for Tech engineers.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-surface-secondary/60 border border-border-subtle">
                <CheckCircle2 className="w-4 h-4 text-emerald-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary block mb-0.5">Exam Mode & Anti-Burnout</strong>
                  No manipulative guilt streaks. When college exams hit, toggle Exam Mode to throttle down into a 3-hour light review plan.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border-subtle bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-text-primary">Aaroh</span>
            <span>— Personal Career Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="hover:text-text-primary transition-colors">
              Explore Careers
            </Link>
            <Link href="/trials" className="hover:text-text-primary transition-colors">
              Micro-Trials
            </Link>
            <Link href="/skills" className="hover:text-text-primary transition-colors">
              Skill Intelligence
            </Link>
            <Link href="/onboarding" className="hover:text-text-primary transition-colors">
              Onboarding
            </Link>
          </div>
          <div>© {new Date().getFullYear()} Aaroh. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
