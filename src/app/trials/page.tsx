"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  FolderGit2,
  Table,
  FileQuestion,
  FileText,
  Compass,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Award,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAarohStore } from "@/lib/store";
import {
  CAREER_TRIALS,
  evaluateTrialSubmission,
  RubricEvaluationResult,
} from "@/lib/trials-data";
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
  const [userRationale, setUserRationale] = useState<string>("");
  const [enjoymentRating, setEnjoymentRating] = useState<number>(4);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<RubricEvaluationResult | null>(null);

  // Sync state when activeTrial or profile completed records change
  useEffect(() => {
    const saved = profile.trialReflections[activeTrial.id];
    if (saved) {
      setSelectedOptionId(saved.selectedOptionId || "");
      setUserRationale(saved.reflection || "");
      setEnjoymentRating(saved.rating || 4);
      setIsSubmitted(true);
      setValidationError(null);

      // Re-evaluate or hydrate evaluation result
      if (saved.selectedOptionId) {
        const result = evaluateTrialSubmission(activeTrial, saved.selectedOptionId, saved.reflection || "");
        setEvaluationResult(result);
      }
    } else {
      setSelectedOptionId("");
      setUserRationale(activeTrial.practicalTask.starterContent || "");
      setEnjoymentRating(4);
      setIsSubmitted(false);
      setValidationError(null);
      setEvaluationResult(null);
    }
  }, [activeTrial, profile.completedTrialIds, profile.trialReflections]);

  // Handle URL query parameter changes
  useEffect(() => {
    if (trialIdParam) {
      const match = CAREER_TRIALS.find((t) => t.id === trialIdParam);
      if (match && match.id !== activeTrial.id) {
        setActiveTrial(match);
      }
    } else if (careerSlugParam) {
      const match = CAREER_TRIALS.find((t) => t.careerSlug === careerSlugParam);
      if (match && match.id !== activeTrial.id) {
        setActiveTrial(match);
      }
    }
  }, [trialIdParam, careerSlugParam, activeTrial.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation: must select option if options exist
    if (activeTrial.practicalTask.options && !selectedOptionId) {
      setValidationError("Please select your proposed approach before submitting.");
      return;
    }

    // Strict validation: must provide at least a brief written rationale
    const trimmed = userRationale.trim();
    const starter = (activeTrial.practicalTask.starterContent || "").trim();
    if (!trimmed || trimmed === starter || trimmed.length < 15) {
      setValidationError("Please add a short note (at least 15 characters) explaining your thinking and rationale.");
      return;
    }

    setValidationError(null);

    // Compute rubric evaluation
    const evalResult = evaluateTrialSubmission(activeTrial, selectedOptionId, userRationale);
    setEvaluationResult(evalResult);
    setIsSubmitted(true);

    // Save to store with full rubric details
    recordTrialCompletion(
      activeTrial.id,
      enjoymentRating,
      userRationale,
      {
        selectedOptionId,
        score: evalResult.score,
        criteriaScores: evalResult.criteriaScores,
        feedback: evalResult.overallFeedback,
      }
    );
  };

  const handleRatingChange = (newRating: number) => {
    setEnjoymentRating(newRating);
    if (isSubmitted) {
      // Immediately persist updated enjoyment rating
      recordTrialCompletion(
        activeTrial.id,
        newRating,
        userRationale,
        evaluationResult
          ? {
              selectedOptionId,
              score: evaluationResult.score,
              criteriaScores: evaluationResult.criteriaScores,
              feedback: evaluationResult.overallFeedback,
            }
          : undefined
      );
    }
  };

  const handleRevise = () => {
    setIsSubmitted(false);
    setValidationError(null);
  };

  const handleResetToBlank = () => {
    setIsSubmitted(false);
    setSelectedOptionId("");
    setUserRationale(activeTrial.practicalTask.starterContent || "");
    setValidationError(null);
    setEvaluationResult(null);
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {CAREER_TRIALS.map((trial) => {
          const isSelected = trial.id === activeTrial.id;
          const hasDone = profile.completedTrialIds.includes(trial.id);
          const shortTitle = trial.title.split(":")[1]?.trim() || trial.title;
          return (
            <button
              key={trial.id}
              onClick={() => {
                setActiveTrial(trial);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? "bg-amber-brand text-neutral-950 border-amber-brand shadow-sm font-bold"
                  : "bg-surface-secondary text-text-muted border-border-subtle hover:text-text-primary hover:border-border-medium"
              }`}
            >
              <span>{shortTitle}</span>
              {hasDone && (
                <span className={`text-[10px] ${isSelected ? "text-neutral-950 font-black" : "text-emerald-400"}`}>
                  ✓ Done
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* The Main Trial Experience */}
      <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-5 shadow-card">
        {/* Title & Goal */}
        <div className="space-y-1 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Badge variant="neutral">{getDisciplineLabel(activeTrial.discipline)}</Badge>
            {profile.completedTrialIds.includes(activeTrial.id) && (
              <Badge variant="emerald">Completed</Badge>
            )}
          </div>
          <h2 className="text-lg font-bold font-display text-text-primary">
            {activeTrial.title}
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            <strong>Goal:</strong> {activeTrial.objective}
          </p>
        </div>

        {/* Disclaimer / Educational Notice */}
        {activeTrial.disclaimerNotice && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-brand shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] text-amber-100/90">
              {activeTrial.disclaimerNotice}
            </p>
          </div>
        )}

        {/* 1. The Scenario */}
        <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-brand flex items-center gap-1.5">
            <span>1. The Real-World Scenario</span>
          </h3>
          <p className="text-xs text-text-primary leading-relaxed">
            {activeTrial.scenario}
          </p>
        </div>

        {/* Reference Data (if available for trial) */}
        {activeTrial.referenceData && (
          <div className="p-4 rounded-xl bg-surface-secondary/40 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-amber-brand" />
                <span>Reference Telemetry & Schedule Data</span>
              </h3>
              {activeTrial.referenceData.disclosureNotice && (
                <span className="text-[10px] text-text-muted italic">
                  {activeTrial.referenceData.disclosureNotice}
                </span>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-left text-xs text-text-primary border-collapse">
                <thead>
                  <tr className="bg-surface-secondary border-b border-border-subtle text-[11px] font-semibold text-text-muted">
                    {activeTrial.referenceData.headers.map((head, idx) => (
                      <th key={idx} className="p-2.5 whitespace-nowrap">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-[11px]">
                  {activeTrial.referenceData.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={rIdx % 2 === 0 ? "bg-surface-card" : "bg-surface-secondary/30"}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`p-2.5 ${
                            cIdx === 0
                              ? "font-semibold text-text-primary"
                              : "text-text-muted"
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {activeTrial.referenceData.notes && (
              <div className="space-y-1 pt-1 text-[11px] text-text-muted">
                {activeTrial.referenceData.notes.map((note, idx) => (
                  <p key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-brand font-bold">•</span>
                    <span>{note}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Source Dossier Excerpts (if available for journalism trial) */}
        {activeTrial.sourceExcerpts && (
          <div className="p-4 rounded-xl bg-surface-secondary/40 border border-border-subtle space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-brand" />
              <span>Investigative Dossier: Source Excerpts</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeTrial.sourceExcerpts.map((src) => {
                const badgeVariant =
                  src.classification === "supported"
                    ? "emerald"
                    : src.classification === "unverified"
                    ? "amber"
                    : src.classification === "disputed"
                    ? "rose"
                    : "neutral";
                return (
                  <div
                    key={src.id}
                    className="p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-text-primary text-[11px]">
                        {src.sourceLabel}
                      </span>
                      <Badge variant={badgeVariant} className="text-[10px] capitalize">
                        {src.classification}
                      </Badge>
                    </div>

                    <blockquote className="italic text-text-muted text-[11px] pl-2 border-l-2 border-amber-brand/50">
                      {src.excerptText}
                    </blockquote>

                    <p className="text-[10px] text-text-muted/80 leading-normal pt-1 border-t border-border-subtle/40">
                      <strong>Verification Note:</strong> {src.analysis}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

        {/* 3. The Challenge & Decision Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-border-subtle">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-text-primary">
                3. {activeTrial.practicalTask.prompt}
              </label>
              {isSubmitted && (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Submission Evaluated
                </span>
              )}
            </div>

            {/* Options List */}
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
                              <strong>Outcome Analysis:</strong> {opt.explanation}
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
                Your Reasoning & Operational Plan:
              </label>
              <textarea
                rows={3}
                value={userRationale}
                onChange={(e) => {
                  setUserRationale(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isSubmitted}
                placeholder="Explain why this approach balances priorities best..."
                className="w-full p-3 rounded-xl bg-surface-secondary border border-border-medium text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-amber-brand disabled:opacity-85"
              />
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Submitted Rubric Feedback & Takeaway Box */}
          {isSubmitted && (
            <div className="p-5 rounded-xl bg-surface-secondary border border-emerald-500/30 space-y-4 animate-fade-in text-xs">
              {/* Header with Rubric Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border-subtle gap-2">
                <div className="flex items-center gap-2 text-emerald-brand font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-brand" />
                  <span>Trial Completed & Evaluated</span>
                </div>

                {evaluationResult && (
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-[11px]">Rubric Score:</span>
                    <Badge
                      variant={
                        evaluationResult.score >= 85
                          ? "emerald"
                          : evaluationResult.score >= 60
                          ? "amber"
                          : "rose"
                      }
                      className="font-bold text-xs px-2.5 py-0.5"
                    >
                      {evaluationResult.score}/100 • {evaluationResult.ratingBand.replace("_", " ")}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Rubric Criteria Breakdown */}
              {evaluationResult && evaluationResult.criteriaScores.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-brand" />
                    <span>Evaluation Criteria Breakdown:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {evaluationResult.criteriaScores.map((crit, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-surface-card border border-border-subtle space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-text-primary truncate">
                            {crit.criterion}
                          </span>
                          <span className="text-text-muted shrink-0 text-[10px]">
                            {crit.weight}% wt • {crit.score}/100
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted leading-tight">
                          {crit.feedback}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Reflection Prompt */}
              <div className="p-3 rounded-lg bg-surface-card/60 border border-border-subtle space-y-2">
                <h4 className="text-[11px] font-semibold text-text-primary flex items-center gap-1.5">
                  <FileQuestion className="w-3.5 h-3.5 text-amber-brand" />
                  <span>Reflective Reality Check:</span>
                </h4>
                <p className="text-text-muted leading-relaxed text-[11px]">
                  {activeTrial.reflectionQuestions[0]}
                </p>
              </div>

              {/* Enjoyment Rating Slider/Buttons */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-text-primary">
                  How energizing was this kind of problem-solving for you?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleRatingChange(num)}
                      className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all ${
                        enjoymentRating === num
                          ? "bg-amber-brand text-neutral-950 border-amber-brand shadow-sm"
                          : "bg-surface-card text-text-muted border-border-subtle hover:text-text-primary"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <span className="text-[11px] text-text-muted ml-2">
                    {enjoymentRating <= 2
                      ? "Draining / Unnatural"
                      : enjoymentRating === 3
                      ? "Neutral / Balanced"
                      : "Energizing / Engaging"}
                  </span>
                </div>
              </div>

              {/* Distinct Evidence Boundary Disclaimer */}
              <div className="p-3 rounded-lg bg-surface-card border border-border-subtle text-[11px] text-text-muted space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-brand" />
                  <span>Evidence Matrix Boundary</span>
                </div>
                <p className="leading-relaxed">
                  Completing this micro-trial records your task affinity and informs career match scores. It does <strong>not</strong> grant &quot;Practically Demonstrated&quot; status in your Skill Intelligence matrix. Real skill evidence requires building verified vertical-slice projects.
                </p>
              </div>

              {/* Next Step Suggestion */}
              <div className="pt-2 border-t border-border-subtle/60 text-text-muted flex items-start gap-2 text-[11px]">
                <Compass className="w-3.5 h-3.5 text-amber-brand shrink-0 mt-0.5" />
                <div>
                  <strong>Recommended Follow-up:</strong> {activeTrial.suggestedNextStep}
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {!isSubmitted ? (
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!selectedOptionId && !!activeTrial.practicalTask.options}
                className="font-bold"
              >
                <span>Submit & Evaluate Decision</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRevise}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    <span>Revise Decision</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetToBlank}
                    className="text-text-muted hover:text-rose-400"
                  >
                    <span>Clear Response</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/roadmap">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                      <span>View Roadmap</span>
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button variant="primary" size="sm" className="font-bold">
                      <FolderGit2 className="w-3.5 h-3.5 mr-1.5" />
                      <span>View Project Briefs</span>
                    </Button>
                  </Link>
                </div>
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
