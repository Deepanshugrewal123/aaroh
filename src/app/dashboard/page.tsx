"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Compass,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAarohStore } from "@/lib/store";
import { computeCareerRecommendations } from "@/lib/recommendation-engine";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { SKILLS_CATALOG } from "@/lib/skills-data";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { getDisciplineLabel, getEvidenceStateLabel } from "@/lib/utils";

export default function DashboardPage() {
  const { profile, roadmap, setTargetCareer, toggleExamMode } = useAarohStore();

  const recommendations = computeCareerRecommendations(profile);
  const primaryRec = recommendations.find((r) => r.career.slug === profile.targetCareerSlug) || recommendations[0];

  // Active roadmap task
  const activeTask = roadmap?.tasks.find((t) => t.status === "available" || t.status === "in_progress") || roadmap?.tasks[0];
  const completedTaskCount = roadmap?.tasks.filter((t) => t.status === "completed").length || 0;
  const totalTasks = roadmap?.tasks.length || 4;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner: Profile Status & Next Best Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-brand uppercase tracking-wider">
              Career Intelligence Overview
            </span>
            <span className="text-text-muted">•</span>
            <Badge variant="neutral">{getDisciplineLabel(profile.discipline)}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary tracking-tight">
            Welcome back, {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Current Target Hypothesis:{" "}
            <span className="font-semibold text-text-primary">
              {primaryRec ? primaryRec.career.title : "Exploring Options"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/explore">
            <Button variant="outline" size="sm">
              <Compass className="w-4 h-4 mr-1.5" />
              <span>Explore Paths</span>
            </Button>
          </Link>
          <Link href="/trials">
            <Button variant="primary" size="sm" className="shadow-amber-subtle">
              <Zap className="w-4 h-4 mr-1.5" />
              <span>Career Trials</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Signature Action Card: Next Recommended Experiment */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-brand/10 via-surface-card to-surface-card border border-amber-brand/30 p-6 shadow-amber-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="amber">Recommended Next Step</Badge>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~15 minutes
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-display text-text-primary">
            {primaryRec?.recommendedFirstStep || "Try a hands-on micro-trial to test your day-to-day affinity."}
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Aaroh prioritizes practical evidence over endless reading. Testing the work directly provides immediate clarity on whether this path fits your thinking style.
          </p>
        </div>
        <div className="shrink-0">
          <Link href={`/trials?career=${primaryRec?.career.slug}`}>
            <Button size="md" className="w-full md:w-auto shadow-md">
              <span>Start Trial Scenario</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid: 2-Column Dashboard Core */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Top Career Hypotheses & Active Roadmap */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section: Career Hypotheses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-display text-text-primary">
                  Personalized Career Hypotheses
                </h3>
                <p className="text-xs text-text-muted">
                  Starting exploration hypotheses based on your declared strengths and preferences
                </p>
              </div>
              <Link href="/explore" className="text-xs text-amber-brand hover:underline font-medium">
                Compare All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.slice(0, 2).map((rec) => {
                const isTarget = profile.targetCareerSlug === rec.career.slug;
                return (
                  <Card
                    key={rec.career.id}
                    hoverEffect
                    className={`flex flex-col justify-between ${
                      isTarget ? "border-amber-brand/50 shadow-amber-subtle" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={isTarget ? "amber" : "neutral"}>
                          {isTarget ? "Active Target" : "Alternative Hypothesis"}
                        </Badge>
                        <span className="text-xs font-semibold text-text-primary">
                          {rec.fitScore}% compatibility index
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-text-primary font-display">
                          {rec.career.title}
                        </h4>
                        <p className="text-xs text-text-muted mt-1 line-clamp-2">
                          {rec.career.tagline}
                        </p>
                      </div>

                      {/* Transparent Skill Coverage */}
                      <Progress
                        value={rec.skillCoveragePercent}
                        label="Skill Requirement Coverage"
                        helperText="Calculated transparently from demonstrated, coursework, and self-reported skills. Not a hiring probability."
                      />

                      {/* Transparent Match Reasons */}
                      <div className="space-y-1.5 pt-2 border-t border-border-subtle/70">
                        <p className="text-[11px] font-semibold text-text-primary uppercase tracking-wider">
                          Why Recommended:
                        </p>
                        <ul className="space-y-1">
                          {rec.matchReasons.slice(0, 2).map((reason, i) => (
                            <li key={i} className="text-xs text-text-muted flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-brand shrink-0 mt-0.5" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Explicit Uncertainties */}
                      {rec.uncertainties.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-surface-secondary/70 border border-border-subtle text-[11px] text-text-muted">
                          <div className="flex items-center gap-1 font-semibold text-amber-brand mb-0.5">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Identified Unknowns:</span>
                          </div>
                          <p className="line-clamp-2">{rec.uncertainties[0]}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border-subtle/70 flex items-center justify-between gap-2 mt-4">
                      {!isTarget ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTargetCareer(rec.career.slug)}
                          className="w-full"
                        >
                          Set as Target Path
                        </Button>
                      ) : (
                        <Link href="/roadmap" className="w-full">
                          <Button variant="secondary" size="sm" className="w-full">
                            View Target Roadmap
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Section: Active Adaptive Roadmap Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-display text-text-primary">
                  Adaptive Roadmap Progress
                </h3>
                <p className="text-xs text-text-muted">
                  Calibrated for {profile.isExamMode ? "3 hrs/week (Exam Mode)" : `${profile.weeklyCapacityHours} hrs/week`}
                </p>
              </div>
              <Link href="/roadmap" className="text-xs text-amber-brand hover:underline font-medium">
                Full Roadmap
              </Link>
            </div>

            <Card className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-interactive flex items-center justify-center text-text-primary">
                    <BookOpen className="w-5 h-5 text-amber-brand" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">
                      {roadmap?.tasks.length || 4} Milestone Tasks Scheduled
                    </h4>
                    <p className="text-xs text-text-muted">
                      {completedTaskCount} of {totalTasks} tasks completed with evidence
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Exam Mode:</span>
                  <button
                    onClick={toggleExamMode}
                    className="text-xs px-2.5 py-1 rounded-md bg-surface-interactive border border-border-subtle font-medium text-text-primary hover:border-amber-brand"
                  >
                    {profile.isExamMode ? "Enabled (Light Plan)" : "Disabled (Standard)"}
                  </button>
                </div>
              </div>

              {/* Next active task */}
              {activeTask && (
                <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="amber">Current Task</Badge>
                      <span className="text-xs text-text-muted">~{activeTask.estimatedHours} hrs</span>
                    </div>
                    <p className="font-semibold text-sm text-text-primary">{activeTask.title}</p>
                    <p className="text-xs text-text-muted">{activeTask.purpose}</p>
                  </div>
                  <Link href="/roadmap">
                    <Button size="sm" variant="primary" className="shrink-0">
                      Work on Task
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column (4 cols): Skill Intelligence & Reality Check */}
        <div className="lg:col-span-4 space-y-6">
          {/* Skill Intelligence Breakdown */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-brand" />
                <span>Skill Intelligence</span>
              </h3>
              <Link href="/skills" className="text-xs text-amber-brand hover:underline">
                Manage
              </Link>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              5 transparent evidence states. Skills are never assumed to be zero merely because a portfolio upload is missing.
            </p>

            <div className="space-y-2.5">
              {Object.values(profile.skillEvidence).slice(0, 4).map((evidence) => {
                const skill = SKILLS_CATALOG[evidence.skillId];
                const stateInfo = getEvidenceStateLabel(evidence.state);
                return (
                  <div
                    key={evidence.skillId}
                    className="p-2.5 rounded-lg bg-surface-secondary/60 border border-border-subtle flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-text-primary">
                        {skill?.name || evidence.skillId}
                      </p>
                      <p className="text-[11px] text-text-muted truncate max-w-[150px]">
                        {evidence.sourceTitle || "Pending verification"}
                      </p>
                    </div>
                    <span className={stateInfo.badgeClass + " text-[11px] px-2 py-0.5 rounded-full"}>
                      {stateInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <Link href="/skills" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">
                <span>View Full Skill Matrix</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </Card>

          {/* Trust & Non-Manipulative Pledge */}
          <div className="p-4 rounded-xl bg-surface-secondary/80 border border-border-subtle space-y-2 text-xs text-text-muted">
            <div className="flex items-center gap-1.5 font-bold text-text-primary">
              <AlertCircle className="w-4 h-4 text-amber-brand" />
              <span>Aaroh Engineering Standard</span>
            </div>
            <p className="leading-relaxed">
              No fabricated placement percentages. No artificial streaks. Every roadmap task requires real proof-of-work deliverables rather than passive tutorial watching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
