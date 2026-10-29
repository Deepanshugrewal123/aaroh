"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { TiltCard } from "./TiltCard";
import { Compass, Zap, Layers, BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const FRAMEWORK_STEPS = [
  {
    step: "01",
    phase: "Discover",
    icon: Compass,
    title: "Explore Multidisciplinary Hypotheses",
    summary:
      "Aaroh starts with structured questions instead of rigid predictions. Filter career possibilities across Tech, Commerce, Design, Science, Law, and Healthcare based on where you actually are in college.",
    highlights: ["Question-First Baseline", "No Pre-Populated Fake Data", "Avoidance Filters & Workstyles"],
    link: "/explore",
    cta: "Explore Roles",
  },
  {
    step: "02",
    phase: "Try",
    icon: Zap,
    title: "12-Minute Hands-On Micro-Trials",
    summary:
      "Test actual work scenarios before committing hundreds of study hours. Solve real dilemmas—from hospital kiosk usability audits to database query latency debugging—evaluated against deterministic rubrics.",
    highlights: ["Simulation-First Reality", "Deterministic Rubric Feedback", "Affinity vs Competence Split"],
    link: "/trials",
    cta: "Take a Trial",
  },
  {
    step: "03",
    phase: "Assess",
    icon: Layers,
    title: "Track Genuine Skill Evidence",
    summary:
      "Replace vague beginner/expert badges with 5 honest evidence states. An unassessed skill never means you are inadequate—it merely marks unexplored ground waiting for practical demonstration.",
    highlights: ["5 Transparent Evidence States", "Local Proof Logging", "Non-Erasure Protection"],
    link: "/skills",
    cta: "View Evidence System",
  },
  {
    step: "04",
    phase: "Build",
    icon: BookOpen,
    title: "Adaptive Roadmap & Exam Mode",
    summary:
      "Progress with realistic milestones calibrated to your weekly capacity. When college midterms or final exams arrive, switch to College Exam Mode (3h/wk) with zero guilt and zero broken streaks.",
    highlights: ["Dynamic Hours Slider", "Anti-Burnout College Exam Mode", "Project Studio Briefs & READMEs"],
    link: "/roadmap",
    cta: "See Adaptive Plan",
  },
];

export function FrameworkTimeline() {
  return (
    <section id="journey" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto z-10">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-secondary border border-border-subtle text-xs font-mono uppercase tracking-wider text-amber-brand">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>The Aaroh Method</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-text-primary tracking-tight">
          A Clear Journey from Fog to Proof
        </h2>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          We replace endless tutorial loops and fortune-teller personality quizzes with a grounded progression designed around student agency.
        </p>
      </div>

      {/* 4 Connected Sequential Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {FRAMEWORK_STEPS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <TiltCard
              key={item.step}
              className="group flex flex-col justify-between border-border-subtle hover:border-brand-primary/50 transition-all p-6 sm:p-7 space-y-6"
            >
              <div className="space-y-4">
                {/* Header row: Step badge & Phase tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-br from-brand-primary to-mint-brand">
                      {item.step}
                    </span>
                    <Badge variant={idx === 1 ? "amber" : idx === 2 ? "mint" : "primary"}>
                      Phase {item.step}: {item.phase}
                    </Badge>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-brand-primary group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-brand-text transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Title & Summary */}
                <h3 className="text-xl font-bold font-display text-text-primary group-hover:text-brand-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {item.summary}
                </p>

                {/* Highlight badges */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-surface-secondary/80 text-text-secondary border border-border-subtle"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-4 border-t border-border-subtle/80 flex items-center justify-between">
                <span className="text-xs text-text-muted font-mono">Verified in platform</span>
                <Link href={item.link}>
                  <Button variant="outline" size="sm" className="group-hover:border-brand-primary">
                    <span>{item.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}
