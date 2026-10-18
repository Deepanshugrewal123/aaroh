"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Calendar,
  Compass,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { useAarohStore } from "@/lib/store";
import { EducationalDiscipline, EducationStage, WorkStyle } from "@/lib/types";
import { computeCareerRecommendations } from "@/lib/recommendation-engine";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile } = useAarohStore();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Local state initialized from profile
  const [name, setName] = useState(profile.name || "");
  const [stage, setStage] = useState<EducationStage>(profile.stage || "first_second_year");
  const [discipline, setDiscipline] = useState<EducationalDiscipline>(profile.discipline || "engineering");
  const [workStyles, setWorkStyles] = useState<WorkStyle[]>(profile.selectedWorkStyles || ["analytical"]);
  const [weeklyHours, setWeeklyHours] = useState<number>(profile.weeklyCapacityHours || 8);

  const toggleWorkStyle = (style: WorkStyle) => {
    if (workStyles.includes(style)) {
      setWorkStyles(workStyles.filter((s) => s !== style));
    } else {
      setWorkStyles([...workStyles, style]);
    }
  };

  const handleComplete = () => {
    const updatedProfile = {
      ...profile,
      name: name.trim() || "Student Explorer",
      stage,
      discipline,
      selectedWorkStyles: workStyles.length > 0 ? workStyles : (["analytical"] as WorkStyle[]),
      weeklyCapacityHours: weeklyHours,
      updatedAt: new Date().toISOString(),
    };

    const recs = computeCareerRecommendations(updatedProfile);
    const topSlugs = recs.slice(0, 3).map((r) => r.career.slug);

    updateProfile({
      name: updatedProfile.name,
      stage: updatedProfile.stage,
      discipline: updatedProfile.discipline,
      selectedWorkStyles: updatedProfile.selectedWorkStyles,
      weeklyCapacityHours: updatedProfile.weeklyCapacityHours,
      targetCareerSlug: topSlugs[0] || "full-stack-systems-engineer",
      targetCareerHypotheses: topSlugs,
    });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between pb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-brand to-amber-hover flex items-center justify-center font-bold text-neutral-950 font-display shadow-sm">
            आ
          </div>
          <span className="font-display font-bold text-base text-text-primary">Aaroh</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted font-medium">
            Step {step} of {totalSteps}
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Progressive Step Container */}
      <div className="max-w-xl w-full mx-auto my-auto py-4">
        {/* Progress Bar */}
        <div className="w-full bg-surface-interactive h-1 rounded-full overflow-hidden mb-8 border border-border-subtle">
          <div
            className="bg-amber-brand h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* STEP 1: Name and College Stage */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <Badge variant="amber">Getting Started</Badge>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                Where are you in your education?
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                We calibrate your starting roadmap so beginner students aren&apos;t overwhelmed by senior requirements.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  Your Name (or nickname):
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya or Aarav (optional)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-medium text-text-primary text-sm focus:outline-none focus:border-amber-brand transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-primary">
                  Current stage:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: "first_second_year", label: "1st or 2nd Year College", sub: "Exploring interests & foundations" },
                    { id: "pre_final_year", label: "Pre-Final / Final Year", sub: "Preparing for internships or jobs" },
                    { id: "recent_graduate", label: "Recent Graduate", sub: "Transitioning to entry-level career" },
                    { id: "undecided", label: "Open / Exploring", sub: "Still exploring what is out there" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStage(s.id as EducationStage)}
                      className={`text-left p-3.5 rounded-xl border text-xs transition-all ${
                        stage === s.id
                          ? "bg-amber-brand/10 border-amber-brand text-text-primary font-medium shadow-sm"
                          : "bg-surface-card border-border-subtle text-text-muted hover:border-border-medium hover:text-text-primary"
                      }`}
                    >
                      <div className="font-bold text-text-primary text-sm font-display">{s.label}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{s.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Field / Area of Curiosity */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <Badge variant="amber">Field & Curiosity</Badge>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                What field or topics spark your curiosity?
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Aaroh supports multi-disciplinary career paths. You are never restricted to only engineering roles.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: "engineering", label: "⚙️ Technology & Code", desc: "Software, systems, data" },
                { id: "commerce_business", label: "📈 Commerce & Finance", desc: "Modeling, capital, strategy" },
                { id: "arts_design", label: "🎨 Design & UX", desc: "Interfaces, research, visuals" },
                { id: "law_public_service", label: "⚖️ Policy & Governance", desc: "Civic research, law, analysis" },
                { id: "healthcare", label: "🩺 Healthcare & Life Sciences", desc: "Clinical trials, pharma" },
                { id: "science_research", label: "🔬 Science & Data", desc: "Climate data, statistics" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDiscipline(d.id as EducationalDiscipline)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    discipline === d.id
                      ? "bg-amber-brand/10 border-amber-brand shadow-sm"
                      : "bg-surface-card border-border-subtle hover:border-border-medium"
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-text-primary font-display">{d.label}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">{d.desc}</div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setDiscipline("undecided")}
              className={`w-full p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                discipline === "undecided"
                  ? "bg-amber-brand/10 border-amber-brand text-amber-brand"
                  : "bg-surface-secondary text-text-muted border-border-subtle hover:text-text-primary"
              }`}
            >
              ✨ I&apos;m not sure yet — show me diverse paths from multiple disciplines
            </button>
          </div>
        )}

        {/* STEP 3: Working Style */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <Badge variant="amber">Workstyle Chemistry</Badge>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                How do you enjoy solving problems?
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Pick what feels most energizing. You can change this anytime after taking micro-trials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: "practical_hands_on", label: "Hands-on & Practical", desc: "Building things, troubleshooting, testing ideas" },
                { id: "creative", label: "Visual & Creative", desc: "Designing flows, aesthetics, human experience" },
                { id: "analytical", label: "Analytical & Structured", desc: "Dissecting numbers, logic, trade-off models" },
                { id: "collaborative", label: "Communication & Strategy", desc: "Writing briefs, syntheses, stakeholder consensus" },
              ].map((w) => {
                const isSelected = workStyles.includes(w.id as WorkStyle);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => toggleWorkStyle(w.id as WorkStyle)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-amber-brand/10 border-amber-brand font-medium shadow-sm"
                        : "bg-surface-card border-border-subtle hover:border-border-medium"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-text-primary font-display">{w.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-brand" />}
                    </div>
                    <p className="text-[11px] text-text-muted mt-1">{w.desc}</p>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setWorkStyles(["analytical", "practical_hands_on"])}
              className="w-full text-center text-xs text-amber-brand hover:underline pt-1"
            >
              Not sure yet? Use balanced explorer default
            </button>
          </div>
        )}

        {/* STEP 4: Realistic Capacity & Handoff */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <Badge variant="amber">Realistic Progress</Badge>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                How many hours can you commit each week?
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Aaroh has zero guilt streaks or fake deadlines. When college exams hit, toggle Exam Mode to throttle back.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">Weekly Learning Time:</span>
                <span className="text-base font-bold text-amber-brand font-display">
                  {weeklyHours} hours / week
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                step="1"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-amber-brand cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Light (2-4 hrs)</span>
                <span>Balanced (6-8 hrs)</span>
                <span>Focused (10-16 hrs)</span>
              </div>
            </div>

            {/* Clear explanation of what happens next */}
            <div className="p-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-1.5 text-xs text-text-muted">
              <p className="font-semibold text-text-primary">What happens when you continue:</p>
              <p>• We calculate 2 starting career hypotheses based on what you shared.</p>
              <p>• You get immediate access to your first 12-minute micro-trial.</p>
              <p>• Everything is saved locally on your device and fully editable anytime.</p>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="pt-6 border-t border-border-subtle flex items-center justify-between mt-6">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setStep(step + 1)}
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleComplete}
              className="shadow-sm font-bold"
            >
              <span>Generate Starting Hypotheses</span>
              <Sparkles className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Footer Trust Reassurance */}
      <div className="max-w-xl w-full mx-auto text-center pt-2 text-[11px] text-text-muted flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-brand" />
        <span>No password or resume required. Fully editable anytime.</span>
      </div>
    </div>
  );
}
