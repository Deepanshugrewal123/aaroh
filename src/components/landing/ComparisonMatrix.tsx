"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { TiltCard } from "./TiltCard";
import { CheckCircle2, XCircle, Sparkles, Scale } from "lucide-react";

export function ComparisonMatrix() {
  return (
    <section className="relative py-20 px-4 sm:px-6 max-w-5xl mx-auto z-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-secondary border border-border-subtle text-xs font-mono uppercase tracking-wider text-mint-brand">
          <Scale className="w-3.5 h-3.5" />
          <span>The Practical Difference</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black font-display text-text-primary tracking-tight">
          A Thoughtful Guide, Not an Enterprise Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          How Aaroh contrasts with superficial career quizzes, tutorial paralysis, and high-pressure placement portals:
        </p>
      </div>

      {/* Side-by-Side 3D Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Typical Career Advice */}
        <TiltCard
          maxTilt={5}
          className="bg-surface-secondary/50 border-border-subtle hover:border-rose-brand/40 space-y-5 p-7"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-brand flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-brand" />
              <span>Typical Career Advice</span>
            </span>
            <Badge variant="rose">Superficial & High-Stress</Badge>
          </div>

          <ul className="space-y-4 text-xs sm:text-sm text-text-muted">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-rose-brand/10 text-rose-brand flex items-center justify-center shrink-0 font-bold mt-0.5">
                ✕
              </span>
              <span>
                <strong>Rigid Personality Tests:</strong> Shallow quizzes that claim to calculate your &quot;one true destiny&quot; from a dozen multiple-choice questions.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-rose-brand/10 text-rose-brand flex items-center justify-center shrink-0 font-bold mt-0.5">
                ✕
              </span>
              <span>
                <strong>Fabricated Salary Hype:</strong> Deceptive placement statistics, inflated CTC packages, and high-pressure commercial bootcamps.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-rose-brand/10 text-rose-brand flex items-center justify-center shrink-0 font-bold mt-0.5">
                ✕
              </span>
              <span>
                <strong>Tutorial Paralysis:</strong> Passive 80-hour video playlists that leave students with empty GitHub profiles and zero verifiable evidence.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-rose-brand/10 text-rose-brand flex items-center justify-center shrink-0 font-bold mt-0.5">
                ✕
              </span>
              <span>
                <strong>Guilt-Driven Streak Mechanics:</strong> Gamified platforms that punish students with broken streaks when real university midterms arrive.
              </span>
            </li>
          </ul>
        </TiltCard>

        {/* Card 2: The Aaroh Method */}
        <TiltCard
          maxTilt={5}
          className="bg-surface-card/90 border-2 border-mint-brand/40 shadow-xl space-y-5 p-7"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-mint-brand flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-mint-brand" />
              <span>The Aaroh Method</span>
            </span>
            <Badge variant="mint">Grounded & Student-First</Badge>
          </div>

          <ul className="space-y-4 text-xs sm:text-sm text-text-primary">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-mint-brand shrink-0 mt-0.5" />
              <span>
                <strong>12-Minute Micro-Trials:</strong> Test practical work scenarios directly in browser before dedicating semesters of study time.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-mint-brand shrink-0 mt-0.5" />
              <span>
                <strong>Transparent Multidisciplinary Scope:</strong> Equal depth across Engineering, Product UX, Valuation, Governance, and Research.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-mint-brand shrink-0 mt-0.5" />
              <span>
                <strong>Grounded Proof Over Badges:</strong> Project Studio briefs with testing checklists, rubric evaluations, and peer verification packets.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-mint-brand shrink-0 mt-0.5" />
              <span>
                <strong>Anti-Burnout College Exam Mode:</strong> One-tap toggle reduces study volume to 3h/week of light concept maintenance with zero guilt.
              </span>
            </li>
          </ul>
        </TiltCard>
      </div>
    </section>
  );
}
