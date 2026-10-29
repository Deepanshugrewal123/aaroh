"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TiltCard } from "./TiltCard";
import { CAREER_TRIALS, evaluateTrialSubmission, RubricEvaluationResult } from "@/lib/trials-data";
import { soundEngine } from "./SoundAmbienceToggle";

export function LiveTrialPreview() {
  const [selectedTrialId, setSelectedTrialId] = useState<string>("trial-ux-design");
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [evaluationResult, setEvaluationResult] = useState<RubricEvaluationResult | null>(null);

  const activeTrial =
    CAREER_TRIALS.find((t) => t.id === selectedTrialId) || CAREER_TRIALS[0];

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    soundEngine?.playChime(1);
    const result = evaluateTrialSubmission(activeTrial, optId, "Landing page interactive preview submission");
    setEvaluationResult(result);
  };

  const handleReset = () => {
    setSelectedOptionId("");
    setEvaluationResult(null);
  };

  const switchTrial = (trialId: string) => {
    setSelectedTrialId(trialId);
    setSelectedOptionId("");
    setEvaluationResult(null);
    soundEngine?.playChime(3);
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 max-w-5xl mx-auto z-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-secondary border border-border-subtle text-xs font-mono uppercase tracking-wider text-brand-primary">
          <Zap className="w-3.5 h-3.5" />
          <span>Interactive Simulation Preview</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-text-primary tracking-tight">
          Test Day-to-Day Work in 60 Seconds
        </h2>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          Experience Aaroh&apos;s simulation-first approach right now. Review a real engineering or design dilemma, select your priority intervention, and see immediate deterministic rubric feedback.
        </p>

        {/* Trial Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => switchTrial("trial-ux-design")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              selectedTrialId === "trial-ux-design"
                ? "bg-brand-primary text-brand-text border-brand-primary shadow-sm"
                : "bg-surface-secondary text-text-muted hover:text-text-primary border-border-subtle"
            }`}
          >
            🎨 UX Design Scenario
          </button>
          <button
            onClick={() => switchTrial("trial-full-stack")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              selectedTrialId === "trial-full-stack"
                ? "bg-brand-primary text-brand-text border-brand-primary shadow-sm"
                : "bg-surface-secondary text-text-muted hover:text-text-primary border-border-subtle"
            }`}
          >
            ⚙️ Systems Engineering Scenario
          </button>
        </div>
      </div>

      {/* Main Interactive Trial Workspace Card */}
      <TiltCard className="bg-surface-card/95 border border-brand-primary/40 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Scenario Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="amber">Simulation Challenge</Badge>
              <span className="text-xs font-mono text-text-muted">~{activeTrial.estimatedMinutes} Mins in Platform</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
              {activeTrial.title.replace("Micro-Trial: ", "")}
            </h3>
          </div>
          {evaluationResult && (
            <button
              onClick={handleReset}
              className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scenario</span>
            </button>
          )}
        </div>

        {/* Real Scenario Narrative */}
        <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle text-xs sm:text-sm text-text-secondary leading-relaxed">
          <strong className="text-text-primary block font-mono uppercase text-[11px] mb-1">
            Real Work Context:
          </strong>
          {activeTrial.scenario}
        </div>

        {/* Task Prompt */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2 font-display">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span>{activeTrial.practicalTask.prompt}</span>
          </p>

          {/* Options List */}
          <div className="space-y-2.5">
            {activeTrial.practicalTask.options?.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 rounded-xl border text-xs sm:text-sm transition-all duration-150 cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? "bg-brand-primary/10 border-brand-primary text-text-primary shadow-sm"
                      : "bg-surface-secondary/40 border-border-subtle text-text-secondary hover:border-border-medium hover:bg-surface-interactive/50"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelectOption(opt.id);
                    }
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 font-bold text-[10px] ${
                      isSelected
                        ? "bg-brand-primary text-brand-text border-brand-primary"
                        : "border-border-medium text-text-muted"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </div>
                  <span className="leading-relaxed">{opt.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deterministic Evaluation Feedback Reveal */}
        {evaluationResult && (
          <div className="p-5 rounded-xl bg-surface-secondary border border-mint-brand/40 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-text-primary font-display flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-mint-brand" />
                <span>Deterministic Evaluation Result</span>
              </span>
              <span
                className={`text-sm font-black font-display px-2.5 py-0.5 rounded-full ${
                  evaluationResult.score >= 70
                    ? "bg-mint-brand/10 text-mint-brand border border-mint-brand/30"
                    : "bg-amber-brand/10 text-amber-brand border border-amber-brand/30"
                }`}
              >
                Score: {evaluationResult.score} / 100
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {evaluationResult.overallFeedback}
            </p>

            <div className="pt-2 border-t border-border-subtle/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
              <span>
                Band: <strong>{evaluationResult.ratingBand.replace("_", " ").toUpperCase()}</strong> • Tested against 3 rubric criteria
              </span>
              <Link href={`/trials?career=${activeTrial.careerSlug}`}>
                <Button size="sm" variant="primary">
                  <span>Open Full Micro-Trial & Reflect</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </TiltCard>
    </section>
  );
}
