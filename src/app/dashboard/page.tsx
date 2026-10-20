"use client";

import React from "react";
import Link from "next/link";
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
} from "lucide-react";
import { useAarohStore } from "@/lib/store";
import { computeCareerRecommendations } from "@/lib/recommendation-engine";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { SKILLS_CATALOG } from "@/lib/skills-data";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { isCareerTrialCompleted } from "@/lib/trials-data";
import { getDisciplineLabel, getEvidenceStateLabel } from "@/lib/utils";

export default function DashboardPage() {
  const { profile, roadmap, setTargetCareer, toggleExamMode } = useAarohStore();

  const recommendations = computeCareerRecommendations(profile);
  const targetCareer = CAREERS_CATALOG.find((c) => c.slug === profile.targetCareerSlug) || CAREERS_CATALOG[2];
  const primaryRec = recommendations.find((r) => r.career.slug === profile.targetCareerSlug) || recommendations[0];

  // Active roadmap task
  const activeTask = roadmap?.tasks.find((t) => t.status === "available" || t.status === "in_progress") || roadmap?.tasks[0];
  const completedTasks = roadmap?.tasks.filter((t) => t.status === "completed").length || 0;
  const totalTasks = roadmap?.tasks.length || 4;

  const hasCompletedTrial = isCareerTrialCompleted(profile, targetCareer.slug);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* 1. WHERE AM I RIGHT NOW? Contextual Greeting & Current Exploration */}
      <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-text-muted">Student Overview</span>
              <span className="text-text-muted">•</span>
              <Badge variant="neutral">{getDisciplineLabel(profile.discipline)}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-text-primary tracking-tight">
              Good to see you, {profile.name}
            </h1>
          </div>

          {/* College Exam Mode Quick Toggle */}
          <div className="flex items-center gap-2 bg-surface-secondary px-3 py-1.5 rounded-xl border border-border-subtle self-start sm:self-auto">
            <Calendar className="w-3.5 h-3.5 text-amber-brand" />
            <span className="text-xs text-text-muted">Exam Mode:</span>
            <button
              onClick={toggleExamMode}
              className={`text-xs px-2 py-0.5 rounded font-semibold transition-colors ${
                profile.isExamMode
                  ? "bg-amber-brand text-neutral-950"
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
          <Link href="/explore" className="text-amber-brand font-medium hover:underline text-xs">
            Change Target Path →
          </Link>
        </div>
      </div>

      {/* 2. WHAT IS MY NEXT USEFUL ACTION? (Prominent Next Step Card) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-card to-surface-secondary border border-amber-brand/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="amber">Recommended Next Step</Badge>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-brand" />
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

        {/* The Single Obvious Action Button */}
        <div className="pt-1">
          {!hasCompletedTrial ? (
            <Link href={`/trials?career=${targetCareer.slug}`}>
              <Button size="md" className="w-full sm:w-auto font-bold shadow-sm">
                <Zap className="w-4 h-4 mr-1.5" />
                <span>Start 12-Min Micro-Trial</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          ) : (
            <Link href="/roadmap">
              <Button size="md" className="w-full sm:w-auto font-bold">
                <BookOpen className="w-4 h-4 mr-1.5" />
                <span>Continue Roadmap Task</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 3. WHAT CAN I EXPLORE NEXT? Top Career Hypotheses */}
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
          <Link href="/explore" className="text-xs text-amber-brand font-medium hover:underline">
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
                    ? "bg-surface-card border-amber-brand/50 shadow-sm"
                    : "bg-surface-card border-border-subtle hover:border-border-medium"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={isTarget ? "amber" : "neutral"}>
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
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-brand shrink-0" />
                      <span className="truncate">{rec.matchReasons[0] || "Exploratory fit"}</span>
                    </div>
                    {rec.uncertainties[0] && (
                      <div className="text-text-muted/70 flex items-start gap-1.5 text-[10px]">
                        <HelpCircle className="w-3 h-3 text-amber-brand/80 shrink-0 mt-0.5" />
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
                      <Zap className="w-3.5 h-3.5 text-amber-brand" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visible option to explore something completely different */}
        <div className="p-3.5 rounded-xl bg-surface-secondary/60 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-text-primary block">
              Curious about a different discipline?
            </span>
            <span className="text-text-muted">
              Explore Design, Finance, Public Policy, Healthcare, and Sciences with real work examples.
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

      {/* 4. CURRENT ROADMAP TASK (Progressive Disclosure) */}
      <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-brand" />
            <h3 className="text-sm font-bold font-display text-text-primary">
              Adaptive Roadmap Status
            </h3>
          </div>
          <Link href="/roadmap" className="text-xs text-amber-brand font-medium hover:underline">
            Full Roadmap ({totalTasks} Milestones) →
          </Link>
        </div>

        {activeTask && (
          <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-text-primary">
                Current Task: {activeTask.title}
              </span>
              <p className="text-text-muted">{activeTask.purpose}</p>
            </div>
            <Link href="/roadmap" className="shrink-0">
              <Button variant="primary" size="sm" className="text-xs">
                View Task Details
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 5. EVALUATED PROJECT DELIVERABLES & PORTFOLIO */}
      {profile.projectSubmissions && Object.keys(profile.projectSubmissions).length > 0 && (
        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-amber-brand" />
              <div>
                <h3 className="text-sm font-bold font-display text-text-primary">
                  Evaluated Project Deliverables
                </h3>
                <span className="text-[10px] text-text-muted">
                  Student-attested milestones and reflection (external artifacts uninspected)
                </span>
              </div>
            </div>
            <Link href="/projects" className="text-xs text-amber-brand font-medium hover:underline">
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
                  <Badge variant={sub.status === "evaluated" ? "amber" : "neutral"}>
                    {sub.status === "evaluated" ? "Evaluated" : "Review"}
                  </Badge>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
