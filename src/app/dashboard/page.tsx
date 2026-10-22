"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Compass,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  HelpCircle,
  FolderGit2,
  Layers,
  ChevronRight,
  Send,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useAarohStore } from "@/lib/store";
import { computeCareerRecommendations } from "@/lib/recommendation-engine";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { isCareerTrialCompleted } from "@/lib/trials-data";
import { getDisciplineLabel } from "@/lib/utils";
import { DataPortabilityCard } from "@/components/backup/DataPortabilityCard";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, roadmap, setTargetCareer, toggleExamMode, loadDemoProfile, resetProfile } = useAarohStore();
  const [quickQuestion, setQuickQuestion] = useState("");

  const recommendations = computeCareerRecommendations(profile);
  const targetCareer =
    CAREERS_CATALOG.find((c) => c.slug === profile.targetCareerSlug) ||
    CAREERS_CATALOG.find((c) => c.slug === "full-stack-systems-engineer") ||
    CAREERS_CATALOG[0];

  const primaryRec = recommendations.find((r) => r.career.slug === profile.targetCareerSlug) || recommendations[0];

  // Active roadmap task
  const activeTask = roadmap?.tasks.find((t) => t.status === "available" || t.status === "in_progress") || roadmap?.tasks[0];
  const completedTasks = roadmap?.tasks.filter((t) => t.status === "completed").length || 0;
  const totalTasks = roadmap?.tasks.length || 4;

  const hasCompletedTrial = isCareerTrialCompleted(profile, targetCareer.slug);
  const isFirstRun = !profile.hasCompletedOnboarding && (!profile.name || profile.name === "");

  const handleAskMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuestion.trim()) return;
    router.push(`/mentor?q=${encodeURIComponent(quickQuestion.trim())}`);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* FIRST-RUN ONBOARDING INVITATION BANNER (Honest clean slate) */}
      {isFirstRun && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-card to-surface-secondary border-2 border-brand-primary/40 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="primary">Start Your Discovery</Badge>
            <span className="text-xs text-text-muted">Takes ~4–5 minutes</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black font-display text-text-primary tracking-tight">
              Welcome to Aaroh: Honest Career Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Most platforms guess career paths using shallow tests or pre-populate fake accomplishments. Aaroh starts with honest questions: Where are you in college? What have you actually built or studied? What do you want to avoid? And what is still uncertain?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link href="/onboarding" className="flex-1 sm:flex-none">
              <Button variant="primary" size="md" className="w-full sm:w-auto font-bold shadow-brand-glow">
                <span>Begin Career Discovery</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={loadDemoProfile}
              className="text-xs"
            >
              <span>Explore With Sample Data (Demo)</span>
            </Button>
          </div>
        </div>
      )}

      {/* 1. CONTEXTUAL GREETING & CURRENT EXPLORATION */}
      <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-text-muted">Student Overview</span>
              <span className="text-text-muted">•</span>
              <Badge variant="neutral">{getDisciplineLabel(profile.discipline)}</Badge>
              {profile.hasCompletedOnboarding && (
                <Badge variant="mint" className="text-[10px]">Discovery Confirmed</Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-text-primary tracking-tight">
              Good to see you, {profile.name || "Explorer"}
            </h1>
            {profile.currentSituation && (
              <p className="text-xs text-text-muted italic pt-0.5 line-clamp-1">
                &ldquo;{profile.currentSituation}&rdquo;
              </p>
            )}
          </div>

          {/* College Exam Mode Quick Toggle */}
          <div className="flex items-center gap-2 bg-surface-secondary px-3 py-1.5 rounded-xl border border-border-subtle self-start sm:self-auto">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-xs text-text-muted">Exam Mode:</span>
            <button
              onClick={toggleExamMode}
              className={`text-xs px-2 py-0.5 rounded font-semibold transition-colors ${
                profile.isExamMode
                  ? "bg-brand-primary text-neutral-950 shadow-brand-glow"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {profile.isExamMode ? "ON (3h/wk)" : "OFF"}
            </button>
          </div>
        </div>

        {/* Current Target Path Summary */}
        <div className="pt-2 border-t border-border-subtle/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Active Target:</span>
            <span className="font-bold text-text-primary font-display">{targetCareer.title}</span>
            <span className="text-text-muted">({profile.isExamMode ? "3h/wk light schedule" : `${profile.weeklyCapacityHours}h/wk plan`})</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/explore" className="text-brand-primary font-medium hover:underline text-xs">
              Change Target Path →
            </Link>
            <Link href="/onboarding" className="text-text-muted hover:text-text-primary text-xs">
              Retake Discovery
            </Link>
          </div>
        </div>
      </div>

      {/* 2. ASK AI MENTOR QUICK ACTION BAR */}
      <div className="p-4 rounded-2xl bg-surface-card border border-border-medium shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <h2 className="text-xs font-bold font-display uppercase tracking-wider text-text-primary">
              Ask Your AI Career Guide
            </h2>
          </div>
          <Link href="/mentor" className="text-xs text-brand-primary font-medium hover:underline">
            Open Full Chat →
          </Link>
        </div>

        <form onSubmit={handleAskMentor} className="flex gap-2">
          <input
            type="text"
            value={quickQuestion}
            onChange={(e) => setQuickQuestion(e.target.value)}
            placeholder="Ask anything: switching fields, Indian CTC reality, balancing exams, day-in-the-life..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-brand-primary"
          />
          <Link href={`/mentor`}>
            <Button variant="primary" size="sm" type="button" className="shrink-0 rounded-xl">
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              <span>Ask Guide</span>
            </Button>
          </Link>
        </form>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            "Why is this path suggested for me?",
            "What do entry-level roles pay in India?",
            "Can I switch from my degree to software or UX?",
          ].map((prompt, idx) => (
            <Link
              key={idx}
              href="/mentor"
              className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-secondary text-text-muted hover:text-text-primary border border-border-subtle hover:border-brand-primary/40 transition-colors"
            >
              {prompt}
            </Link>
          ))}
        </div>
      </div>

      {/* 3. WHAT IS MY NEXT USEFUL ACTION? (Prominent Next Step Card) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-card to-surface-secondary border border-brand-primary/30 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="primary">Recommended Next Step</Badge>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-primary" />
            <span>{!hasCompletedTrial ? "~12–15 mins" : activeTask?.estimatedHours ? `~${activeTask.estimatedHours} hrs` : "~3–4 hrs"}</span>
          </span>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-bold font-display text-text-primary leading-snug">
            {!hasCompletedTrial
              ? `Experience the Daily Work: 12-Min Micro-Trial for ${targetCareer.title}`
              : activeTask ? activeTask.title : primaryRec.recommendedFirstStep}
          </h2>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            {!hasCompletedTrial
              ? "Try an actual operational scenario before committing study hours. You will diagnose a realistic challenge and evaluate practical trade-offs."
              : activeTask?.purpose || primaryRec.recommendedFirstStep}
          </p>
        </div>

        {/* What the student will gain */}
        <div className="p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle text-xs space-y-1">
          <span className="font-semibold text-text-primary block">
            What You Will Gain:
          </span>
          <p className="text-text-muted leading-relaxed">
            {!hasCompletedTrial
              ? "Immediate clarity on whether this day-to-day thinking energizes you, plus unlocks your personalized Project Studio brief."
              : "Verifiable proof-of-work evidence that directly updates your Skill Intelligence matrix."}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {!hasCompletedTrial ? (
            <Link href={`/trials?career=${targetCareer.slug}`}>
              <Button size="md" variant="primary" className="w-full sm:w-auto font-bold shadow-brand-glow">
                <Zap className="w-4 h-4 mr-1.5" />
                <span>Start 12-Min Micro-Trial</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          ) : (
            <Link href="/roadmap">
              <Button size="md" variant="primary" className="w-full sm:w-auto font-bold shadow-brand-glow">
                <BookOpen className="w-4 h-4 mr-1.5" />
                <span>Continue Roadmap Task</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 4. ACTIVE QUESTIONS & UNCERTAINTIES */}
      {profile.uncertainties && profile.uncertainties.length > 0 && (
        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-mint-brand" />
              <h3 className="text-sm font-bold font-display text-text-primary">
                Active Doubts & Uncertainties You Are Testing
              </h3>
            </div>
            <span className="text-[11px] text-text-muted">
              {profile.uncertainties.length} questions identified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {profile.uncertainties.map((u, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-surface-secondary border border-border-subtle text-text-secondary flex items-start gap-2"
              >
                <span className="text-mint-brand font-bold shrink-0">•</span>
                <span className="leading-snug">{u}</span>
              </div>
            ))}
          </div>

          <div className="pt-1 text-[11px] text-text-muted flex items-center justify-between">
            <span>Aaroh uses practical micro-trials to test these doubts directly.</span>
            <Link href="/mentor" className="text-brand-primary font-medium hover:underline">
              Discuss with AI Mentor →
            </Link>
          </div>
        </div>
      )}

      {/* 5. TOP CAREER HYPOTHESES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-text-primary">
              Your Career Hypotheses
            </h3>
            <p className="text-xs text-text-muted">
              Starting exploration hypotheses based on what you shared in onboarding
            </p>
          </div>
          <Link href="/explore" className="text-xs text-brand-primary font-medium hover:underline">
            View All ({CAREERS_CATALOG.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {recommendations.slice(0, 2).map((rec) => {
            const isTarget = profile.targetCareerSlug === rec.career.slug;
            const fitLabel =
              rec.fitBand === "strong_hypothesis"
                ? "Strong Fit"
                : rec.fitBand === "promising_alternative"
                ? "Alternative"
                : "Bridge";

            return (
              <div
                key={rec.career.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  isTarget
                    ? "bg-surface-card border-brand-primary/50 shadow-brand-glow"
                    : "bg-surface-card border-border-subtle hover:border-border-medium"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={isTarget ? "primary" : "neutral"}>
                      {isTarget ? "Active Target" : "Alternative Path"}
                    </Badge>
                    <span className="text-[11px] font-semibold text-text-muted" title={rec.heuristicLimitationsNote}>
                      {rec.fitScore}/100 • {fitLabel}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-text-primary font-display">
                    {rec.career.title}
                  </h4>
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {rec.career.tagline}
                  </p>

                  <div className="space-y-1 pt-1 text-[11px]">
                    <div className="text-text-muted flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-mint-brand shrink-0" />
                      <span className="truncate">{rec.matchReasons[0] || "Exploratory fit"}</span>
                    </div>
                    {rec.uncertainties[0] && (
                      <div className="text-text-muted/70 flex items-start gap-1.5 text-[10px]">
                        <HelpCircle className="w-3 h-3 text-brand-primary/80 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{rec.uncertainties[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
                  {isTarget ? (
                    <Link href="/roadmap" className="w-full">
                      <Button variant="secondary" size="sm" className="w-full text-xs">
                        View Roadmap ({completedTasks}/{totalTasks})
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTargetCareer(rec.career.slug)}
                      className="w-full text-xs"
                    >
                      Switch to This Path
                    </Button>
                  )}
                  <Link href={`/trials?career=${rec.career.slug}`}>
                    <Button variant="ghost" size="sm" className="text-xs shrink-0" title="Try micro-trial">
                      <Zap className="w-3.5 h-3.5 text-brand-primary" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explore all disciplines */}
        <div className="p-3.5 rounded-xl bg-surface-secondary/60 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-text-primary block">
              Curious about a different discipline?
            </span>
            <span className="text-text-muted">
              Explore Design, Finance, Public Policy, Healthcare, Environmental Data, and Media with real work examples.
            </span>
          </div>
          <Link href="/explore">
            <Button variant="outline" size="sm" className="shrink-0 text-xs">
              <Compass className="w-3.5 h-3.5 mr-1" />
              <span>Explore All Careers</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 6. EVALUATED PROJECT DELIVERABLES & PORTFOLIO */}
      {profile.projectSubmissions && Object.keys(profile.projectSubmissions).length > 0 && (
        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-brand-primary" />
              <div>
                <h3 className="text-sm font-bold font-display text-text-primary">
                  Evaluated Project Deliverables
                </h3>
                <span className="text-[10px] text-text-muted">
                  Student-attested milestones and reflection (external artifacts uninspected)
                </span>
              </div>
            </div>
            <Link href="/projects" className="text-xs text-brand-primary font-medium hover:underline">
              Project Studio →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(profile.projectSubmissions).map((sub) => (
              <div
                key={sub.projectId}
                className="p-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 truncate mr-2">
                  <span className="font-bold text-text-primary block truncate">
                    {sub.projectSlug}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {sub.status === "evaluated"
                      ? `Evaluated • ${sub.overallScore}% Completeness`
                      : `Needs Revision • ${sub.overallScore}% Completeness`}
                  </span>
                </div>
                <Link href="/projects">
                  <Badge variant={sub.status === "evaluated" ? "primary" : "neutral"}>
                    {sub.status === "evaluated" ? "Evaluated" : "Review"}
                  </Badge>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. STUDENT DATA PORTABILITY & BACKUP RECOVERY */}
      <DataPortabilityCard />
    </div>
  );
}
