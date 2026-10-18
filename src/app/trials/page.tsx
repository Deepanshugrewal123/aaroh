"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  FolderGit2,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAarohStore } from "@/lib/store";
import { CAREER_TRIALS } from "@/lib/trials-data";
import { CareerTrial } from "@/lib/types";
import { getDisciplineLabel } from "@/lib/utils";

function TrialWorkspaceContent() {
  const searchParams = useSearchParams();
  const trialIdParam = searchParams.get("id");
  const careerSlugParam = searchParams.get("career");

  const { profile, recordTrialCompletion } = useAarohStore();

  // Selected Trial
  const [activeTrial, setActiveTrial] = useState<CareerTrial>(() => {
    if (trialIdParam) {
      const match = CAREER_TRIALS.find((t) => t.id === trialIdParam);
      if (match) return match;
    }
    if (careerSlugParam) {
      const match = CAREER_TRIALS.find((t) => t.careerSlug === careerSlugParam);
      if (match) return match;
    }
    return CAREER_TRIALS[0];
  });

  // User input states
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [userRationale, setUserRationale] = useState<string>(activeTrial.practicalTask.starterContent || "");
  const [reflectionAnswer, setReflectionAnswer] = useState<string>("");
  const [enjoymentRating, setEnjoymentRating] = useState<number>(4);

  // Submission / Feedback state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (trialIdParam) {
      const match = CAREER_TRIALS.find((t) => t.id === trialIdParam);
      if (match) {
        setActiveTrial(match);
        setIsSubmitted(false);
        setSelectedOptionId("");
        setUserRationale(match.practicalTask.starterContent || "");
      }
    } else if (careerSlugParam) {
      const match = CAREER_TRIALS.find((t) => t.careerSlug === careerSlugParam);
      if (match) {
        setActiveTrial(match);
        setIsSubmitted(false);
        setSelectedOptionId("");
        setUserRationale(match.practicalTask.starterContent || "");
      }
    }
  }, [trialIdParam, careerSlugParam]);

  const selectedOption = activeTrial.practicalTask.options?.find((o) => o.id === selectedOptionId);
  const isCompleted = profile.completedTrialIds.includes(activeTrial.id) || isSubmitted;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId && activeTrial.practicalTask.options) return;

    setIsSubmitted(true);
    recordTrialCompletion(
      activeTrial.id,
      enjoymentRating,
      reflectionAnswer.trim() || userRationale.slice(0, 150)
    );
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSelectedOptionId("");
    setUserRationale(activeTrial.practicalTask.starterContent || "");
    setReflectionAnswer("");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border-subtle gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">Signature Differentiator</Badge>
            <span className="text-text-muted">•</span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              12–15 min micro-trials
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary tracking-tight">
            Career Trial Simulator
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
            Experience real-world daily challenges before committing to a career path. We test practical reasoning, empathy, and logic, then capture your reflection.
          </p>
        </div>

        {/* Disclaimer Badge */}
        <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle text-xs text-text-muted flex items-center gap-2 max-w-sm">
          <ShieldAlert className="w-4 h-4 text-amber-brand shrink-0" />
          <span>No single 15-minute trial determines your destiny. It is a spark to test your daily affinity.</span>
        </div>
      </div>

      {/* Trial Selector Carousel / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CAREER_TRIALS.map((trial) => {
          const isSelected = trial.id === activeTrial.id;
          const hasDone = profile.completedTrialIds.includes(trial.id);
          return (
            <button
              key={trial.id}
              onClick={() => {
                setActiveTrial(trial);
                setIsSubmitted(false);
                setSelectedOptionId("");
                setUserRationale(trial.practicalTask.starterContent || "");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all flex items-center gap-2 ${
                isSelected
                  ? "bg-amber-brand text-neutral-950 border-amber-brand shadow-sm font-bold"
                  : "bg-surface-card text-text-muted border-border-subtle hover:border-border-medium hover:text-text-primary"
              }`}
            >
              <span>{trial.title.split(":")[1]?.trim() || trial.title}</span>
              {hasDone && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-neutral-950/20 text-neutral-950" : "bg-emerald-500/20 text-emerald-400"}`}>
                  ✓ Done
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Trial Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (8 cols): Interactive Task & Evaluation */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="space-y-6">
            <div className="space-y-2 pb-4 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <Badge variant="neutral">{getDisciplineLabel(activeTrial.discipline)}</Badge>
                <span className="text-xs font-medium text-amber-brand">
                  Estimated time: ~{activeTrial.estimatedMinutes} mins
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-text-primary">
                {activeTrial.title}
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                <strong>Objective:</strong> {activeTrial.objective}
              </p>
            </div>

            {/* Realistic Scenario Brief */}
            <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-brand">
                Operational Scenario
              </h3>
              <p className="text-xs text-text-primary leading-relaxed">
                {activeTrial.scenario}
              </p>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Task Instructions
              </h3>
              <ul className="space-y-1.5 text-xs text-text-muted">
                {activeTrial.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-surface-interactive flex items-center justify-center text-[10px] font-bold text-amber-brand shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Decision Workspace */}
            <form onSubmit={handleSubmit} className="space-y-6 pt-2 border-t border-border-subtle">
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-primary">
                  {activeTrial.practicalTask.prompt}
                </label>

                {activeTrial.practicalTask.options && (
                  <div className="space-y-2.5">
                    {activeTrial.practicalTask.options.map((opt) => {
                      const isOptionSelected = selectedOptionId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => !isSubmitted && setSelectedOptionId(opt.id)}
                          className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isOptionSelected
                              ? "bg-amber-brand/10 border-amber-brand text-text-primary shadow-sm"
                              : "bg-surface-secondary/40 border-border-subtle text-text-muted hover:border-border-medium hover:text-text-primary"
                          } ${isSubmitted ? "cursor-default" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="trialOption"
                              checked={isOptionSelected}
                              onChange={() => setSelectedOptionId(opt.id)}
                              disabled={isSubmitted}
                              className="mt-0.5 accent-amber-brand"
                            />
                            <div className="space-y-1">
                              <span className="font-semibold text-text-primary leading-snug block">
                                {opt.label}
                              </span>
                              {isSubmitted && (
                                <p className="text-[11px] text-text-muted pt-1 border-t border-border-subtle/50 mt-1">
                                  <strong>Rubric Assessment:</strong> {opt.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Written Rationale Box */}
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-semibold text-text-primary">
                    Your Analysis & Decision Rationale:
                  </label>
                  <textarea
                    rows={4}
                    value={userRationale}
                    onChange={(e) => setUserRationale(e.target.value)}
                    disabled={isSubmitted}
                    placeholder="Explain why you made this choice and what trade-offs you considered..."
                    className="w-full p-3 rounded-xl bg-surface-secondary/70 border border-border-medium text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-amber-brand font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Reflection Questions (shown upon submission) */}
              {isSubmitted && (
                <div className="p-4 rounded-xl bg-surface-secondary/80 border border-emerald-500/30 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-brand font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Trial Evaluated — Self-Reflection Questions</span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-text-primary font-medium">
                      {activeTrial.reflectionQuestions[0]}
                    </p>
                    <textarea
                      rows={2}
                      value={reflectionAnswer}
                      onChange={(e) => setReflectionAnswer(e.target.value)}
                      placeholder="Be honest with yourself: Did this problem feel exciting, tedious, or somewhere in-between?"
                      className="w-full p-2.5 rounded-lg bg-surface-card border border-border-subtle text-xs text-text-primary"
                    />

                    <div>
                      <label className="block text-[11px] font-medium text-text-muted mb-1">
                        How much did you enjoy doing this kind of work? (1 = Draining, 5 = Energizing)
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setEnjoymentRating(num)}
                            className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all ${
                              enjoymentRating === num
                                ? "bg-amber-brand text-neutral-950 border-amber-brand"
                                : "bg-surface-card text-text-muted border-border-subtle hover:text-text-primary"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                {!isSubmitted ? (
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!selectedOptionId && !!activeTrial.practicalTask.options}
                  >
                    <span>Submit Trial for Evaluation</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 w-full justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Try Again
                    </Button>
                    <Link href={`/projects`}>
                      <Button variant="primary" size="sm">
                        <FolderGit2 className="w-3.5 h-3.5 mr-1" />
                        Explore Related Projects
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Right (4 cols): Evaluation Rubric & Suggested Next Step */}
        <div className="lg:col-span-4 space-y-6">
          {/* Evaluation Criteria Rubric */}
          <Card className="space-y-4">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-brand" />
              <span>Evaluation Rubric</span>
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Real professional work is evaluated on criteria, not arbitrary test scores.
            </p>

            <div className="space-y-3 pt-2">
              {activeTrial.evaluationCriteria.map((crit, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-surface-secondary/60 border border-border-subtle text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold text-text-primary">
                    <span>{crit.criterion}</span>
                    <Badge variant="amber">{crit.weight}%</Badge>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    {crit.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Suggested Next Step Card */}
          <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-brand">
              Next Recommended Action
            </h4>
            <p className="text-xs text-text-primary leading-relaxed">
              {activeTrial.suggestedNextStep}
            </p>
            <Link href="/roadmap" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full">
                <span>View in Adaptive Roadmap</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CareerTrialsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading micro-trial workspace...</div>}>
        <TrialWorkspaceContent />
      </Suspense>
    </AppShell>
  );
}
