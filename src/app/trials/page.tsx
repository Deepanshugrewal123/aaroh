"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Clock,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FolderGit2,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
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

  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [userRationale, setUserRationale] = useState<string>(activeTrial.practicalTask.starterContent || "");
  const [enjoymentRating, setEnjoymentRating] = useState<number>(4);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId && activeTrial.practicalTask.options) return;

    setIsSubmitted(true);
    recordTrialCompletion(
      activeTrial.id,
      enjoymentRating,
      userRationale.slice(0, 150)
    );
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSelectedOptionId("");
    setUserRationale(activeTrial.practicalTask.starterContent || "");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">Hands-on Reality Check</Badge>
            <span className="text-text-muted">•</span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-brand" />
              {activeTrial.estimatedMinutes} mins
            </span>
          </div>
          <h1 className="text-2xl font-black font-display text-text-primary tracking-tight">
            Career Trial Simulator
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5 leading-relaxed">
            A low-stakes learning experiment. No exams or grades—you&apos;re discovering if this daily problem-solving feels energizing.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle text-[11px] text-text-muted flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-brand shrink-0" />
          <span>Tests daily affinity, not total human potential</span>
        </div>
      </div>

      {/* Trial Carousel Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-amber-brand text-neutral-950 border-amber-brand shadow-sm"
                  : "bg-surface-secondary text-text-muted border-border-subtle hover:text-text-primary"
              }`}
            >
              <span>{trial.title.split(":")[1]?.trim() || trial.title}</span>
              {hasDone && <span className="text-[10px] text-emerald-400">✓ Done</span>}
            </button>
          );
        })}
      </div>

      {/* The Main Trial Experience */}
      <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-5 shadow-card">
        <div className="space-y-1 pb-3 border-b border-border-subtle">
          <Badge variant="neutral">{getDisciplineLabel(activeTrial.discipline)}</Badge>
          <h2 className="text-lg font-bold font-display text-text-primary">
            {activeTrial.title}
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            <strong>Goal:</strong> {activeTrial.objective}
          </p>
        </div>

        {/* 1. The Scenario */}
        <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-brand">
            1. The Real-World Scenario
          </h3>
          <p className="text-xs text-text-primary leading-relaxed">
            {activeTrial.scenario}
          </p>
        </div>

        {/* 2. Instructions */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            2. What You Need to Do:
          </h3>
          <ul className="space-y-1 text-xs text-text-muted">
            {activeTrial.instructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-brand font-bold">•</span>
                <span>{inst}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. The Challenge & Decision */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-border-subtle">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-primary">
              3. Choose Your Approach:
            </label>

            {activeTrial.practicalTask.options && (
              <div className="space-y-2">
                {activeTrial.practicalTask.options.map((opt) => {
                  const isOptionSelected = selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => !isSubmitted && setSelectedOptionId(opt.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isOptionSelected
                          ? "bg-amber-brand/10 border-amber-brand text-text-primary shadow-sm"
                          : "bg-surface-secondary/50 border-border-subtle text-text-muted hover:border-border-medium hover:text-text-primary"
                      } ${isSubmitted ? "cursor-default" : ""}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="trialChoice"
                          checked={isOptionSelected}
                          onChange={() => setSelectedOptionId(opt.id)}
                          disabled={isSubmitted}
                          className="mt-0.5 accent-amber-brand"
                        />
                        <div className="space-y-1">
                          <span className="font-semibold text-text-primary block leading-snug">
                            {opt.label}
                          </span>
                          {isSubmitted && (
                            <p className="text-[11px] text-text-muted pt-1 border-t border-border-subtle/40 mt-1">
                              <strong>Why:</strong> {opt.explanation}
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
            <div className="space-y-1 pt-2">
              <label className="block text-xs font-semibold text-text-primary">
                Your Thinking & Rationale (optional note):
              </label>
              <textarea
                rows={3}
                value={userRationale}
                onChange={(e) => setUserRationale(e.target.value)}
                disabled={isSubmitted}
                placeholder="Why does this choice make the most sense for the users or business?"
                className="w-full p-3 rounded-xl bg-surface-secondary border border-border-medium text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-amber-brand"
              />
            </div>
          </div>

          {/* Submitted Reflection Box */}
          {isSubmitted && (
            <div className="p-4 rounded-xl bg-surface-secondary border border-emerald-500/30 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center gap-1.5 text-emerald-brand font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Trial Completed! Here is your takeaway:</span>
              </div>

              <p className="text-text-muted leading-relaxed">
                {activeTrial.reflectionQuestions[0]}
              </p>

              <div>
                <label className="block text-[11px] text-text-muted mb-1">
                  How energizing was this kind of problem for you? (1 = Draining, 5 = Energizing)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setEnjoymentRating(num)}
                      className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
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

              <div className="pt-2 border-t border-border-subtle/60 text-text-muted">
                <strong>Next Step:</strong> {activeTrial.suggestedNextStep}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between">
            {!isSubmitted ? (
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!selectedOptionId && !!activeTrial.practicalTask.options}
                className="font-bold"
              >
                <span>Submit & Review Takeaways</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <div className="flex items-center justify-between w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Try Again</span>
                </Button>
                <Link href="/projects">
                  <Button variant="primary" size="sm" className="font-bold">
                    <FolderGit2 className="w-3.5 h-3.5 mr-1.5" />
                    <span>View Related Projects</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CareerTrialsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Loading micro-trial...</div>}>
        <TrialWorkspaceContent />
      </Suspense>
    </AppShell>
  );
}
