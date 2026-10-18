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
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { useAarohStore } from "@/lib/store";
import { EducationalDiscipline, EducationStage, WorkStyle } from "@/lib/types";
import { computeCareerRecommendations } from "@/lib/recommendation-engine";
import { getDisciplineLabel } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile } = useAarohStore();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Local state initialized from profile
  const [name, setName] = useState(profile.name || "");
  const [stage, setStage] = useState<EducationStage>(profile.stage || "first_second_year");
  const [discipline, setDiscipline] = useState<EducationalDiscipline>(profile.discipline || "engineering");
  const [workStyles, setWorkStyles] = useState<WorkStyle[]>(profile.selectedWorkStyles || ["analytical"]);
  const [interests, setInterests] = useState<string[]>(profile.interests || ["Technology"]);
  const [weeklyHours, setWeeklyHours] = useState<number>(profile.weeklyCapacityHours || 8);

  const toggleWorkStyle = (style: WorkStyle) => {
    if (workStyles.includes(style)) {
      setWorkStyles(workStyles.filter((s) => s !== style));
    } else {
      if (workStyles.length < 3) {
        setWorkStyles([...workStyles, style]);
      }
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleComplete = () => {
    // Save updated profile
    const updatedProfile = {
      ...profile,
      name: name.trim() || "Student Explorer",
      stage,
      discipline,
      selectedWorkStyles: workStyles.length > 0 ? workStyles : (["analytical"] as WorkStyle[]),
      interests: interests.length > 0 ? interests : ["General Exploration"],
      weeklyCapacityHours: weeklyHours,
      updatedAt: new Date().toISOString(),
    };

    // Calculate top hypotheses
    const recs = computeCareerRecommendations(updatedProfile);
    const topSlugs = recs.slice(0, 3).map((r) => r.career.slug);

    updateProfile({
      name: updatedProfile.name,
      stage: updatedProfile.stage,
      discipline: updatedProfile.discipline,
      selectedWorkStyles: updatedProfile.selectedWorkStyles,
      interests: updatedProfile.interests,
      weeklyCapacityHours: updatedProfile.weeklyCapacityHours,
      targetCareerSlug: topSlugs[0] || "full-stack-systems-engineer",
      targetCareerHypotheses: topSlugs,
    });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-brand to-amber-hover flex items-center justify-center font-bold text-neutral-950 font-display shadow-amber-subtle">
            आ
          </div>
          <span className="font-display font-bold text-lg text-text-primary">Aaroh</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted font-medium">
            Step {step} of {totalSteps}
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Progressive Step Container */}
      <div className="max-w-2xl w-full mx-auto my-auto py-6">
        {/* Progress Bar */}
        <div className="w-full bg-surface-interactive h-1.5 rounded-full overflow-hidden mb-8 border border-border-subtle">
          <div
            className="bg-amber-brand h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* STEP 1: Name and Academic Stage */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Badge variant="amber">Welcome to Aaroh</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-text-primary">
                First, tell us where you currently stand
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                We personalize recommendations based on whether you are just starting college or preparing for final placements.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya or Aarav"
                  className="w-full px-4 py-3 rounded-xl bg-surface-card border border-border-medium text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-amber-brand transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-2">
                  Current educational stage:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: "first_second_year", label: "1st or 2nd Year College", sub: "Exploring interests & building foundations" },
                    { id: "pre_final_year", label: "Pre-Final Year", sub: "Focusing on portfolios & internships" },
                    { id: "final_year", label: "Final Year Student", sub: "Preparing for full-time opportunities" },
                    { id: "recent_graduate", label: "Recent Graduate", sub: "Looking for entry-level roles or transition" },
                    { id: "high_school", label: "High School / Pre-University", sub: "Investigating college and career paths" },
                    { id: "career_changer", label: "Career Explorer / Changer", sub: "Pivoting to a new field" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStage(s.id as EducationStage)}
                      className={`text-left p-3.5 rounded-xl border text-sm transition-all ${
                        stage === s.id
                          ? "bg-amber-brand/10 border-amber-brand text-text-primary font-medium"
                          : "bg-surface-card border-border-subtle text-text-muted hover:border-border-medium hover:text-text-primary"
                      }`}
                    >
                      <div className="font-semibold text-text-primary">{s.label}</div>
                      <div className="text-xs text-text-muted mt-0.5">{s.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Discipline & Field */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Badge variant="amber">Inclusive Multi-Disciplinary Scope</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-text-primary">
                What field are you studying or curious about?
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Aaroh is explicitly designed for diverse academic backgrounds. You are never restricted to only engineering roles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "engineering", title: "Engineering & Technology", desc: "Software, systems, hardware, networks" },
                { id: "commerce_business", title: "Commerce & Business", desc: "Finance, operations, marketing, strategy" },
                { id: "arts_design", title: "Arts, Design & Humanities", desc: "UI/UX, visual architecture, writing" },
                { id: "science_research", title: "Science & Research", desc: "Environmental data, biology, computational science" },
                { id: "healthcare", title: "Healthcare & Life Sciences", desc: "Clinical research, health informatics, pharma" },
                { id: "law_public_service", title: "Law & Public Policy", desc: "Regulatory analysis, governance, civic research" },
                { id: "media_communication", title: "Media & Communication", desc: "Science journalism, content strategy" },
                { id: "undecided", title: "Open / Undecided", desc: "I want to explore options across multiple fields" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDiscipline(d.id as EducationalDiscipline)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    discipline === d.id
                      ? "bg-amber-brand/10 border-amber-brand shadow-amber-subtle"
                      : "bg-surface-card border-border-subtle hover:border-border-medium"
                  }`}
                >
                  <div className="font-bold text-sm text-text-primary font-display">{d.title}</div>
                  <div className="text-xs text-text-muted mt-1 leading-relaxed">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Work Style Preferences */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Badge variant="amber">Workstyle Chemistry</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-text-primary">
                How do you enjoy working?
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Pick up to 3 work styles that energize you. Or choose &quot;Not sure yet&quot; if you want to find out through trials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "analytical", label: "Analytical & Quantitative", desc: "Finding patterns, dissecting numbers, checking logic" },
                { id: "creative", label: "Creative & Visual", desc: "Designing flows, aesthetic harmony, human interfaces" },
                { id: "practical_hands_on", label: "Practical & Hands-On", desc: "Building prototypes, fixing bugs, testing things out" },
                { id: "strategic", label: "Strategic & Decision-Oriented", desc: "Evaluating trade-offs, planning long-term outcomes" },
                { id: "collaborative", label: "Collaborative & Communicative", desc: "Interacting with stakeholders, interviewing, presenting" },
                { id: "independent", label: "Independent & Deep Focus", desc: "Working through tough problems with uninterrupted focus" },
              ].map((w) => {
                const isSelected = workStyles.includes(w.id as WorkStyle);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => toggleWorkStyle(w.id as WorkStyle)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-amber-brand/10 border-amber-brand font-medium"
                        : "bg-surface-card border-border-subtle hover:border-border-medium"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-text-primary">{w.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-brand" />}
                    </div>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{w.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setWorkStyles(["analytical", "creative"])}
                className="text-xs text-amber-brand hover:underline"
              >
                Not sure yet? Choose balanced explorer defaults
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Topics of Curiosity */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Badge variant="amber">Curiosity Sparks</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-text-primary">
                Which topics spark your curiosity?
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Select topics you would genuinely enjoy reading or building projects around.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {[
                "Web Apps & Full-Stack Code",
                "UI/UX & Accessible Design",
                "Financial Modeling & Valuation",
                "Public Policy & Civic Tech",
                "Climate Data & Sustainability",
                "Healthcare & Clinical Research",
                "Investigative Journalism & Tech Writing",
                "Machine Learning & Data Insights",
                "Startup Economics & Unit Margins",
                "Open Source Collaboration",
              ].map((topic) => {
                const isSelected = interests.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleInterest(topic)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-amber-brand text-neutral-950 border-amber-brand shadow-sm"
                        : "bg-surface-card text-text-muted border-border-subtle hover:border-border-medium hover:text-text-primary"
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Realistic Weekly Capacity */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Badge variant="amber">Realistic Time Commitment</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-text-primary">
                How many hours can you commit each week?
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Aaroh rejects fake urgency and manipulative streaks. We calibrate your adaptive roadmap so you make steady progress without burning out.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-surface-card border border-border-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">Weekly Learning Time:</span>
                  <span className="text-xl font-bold text-amber-brand font-display">
                    {weeklyHours} hours / week
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-amber-brand cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-text-muted">
                  <span>Light (2-4 hrs)</span>
                  <span>Balanced (6-10 hrs)</span>
                  <span>Intensive (12-20 hrs)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle flex items-start gap-3 text-xs text-text-muted">
                <Calendar className="w-4 h-4 text-amber-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary block mb-0.5">Exam Mode Guarantee</strong>
                  Whenever college midterm or end-semester exams approach, you can toggle Exam Mode with one tap to reduce your weekly workload down to 3 hours of light maintenance.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="pt-8 border-t border-border-subtle flex items-center justify-between mt-8">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setStep(step + 1)}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleComplete}
              className="shadow-amber-subtle"
            >
              <span>Generate My Career Hypotheses</span>
              <Sparkles className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Footer Trust Reassurance */}
      <div className="max-w-2xl w-full mx-auto text-center pt-4 text-[11px] text-text-muted flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-brand" />
        <span>Stored locally in your browser. Fully editable anytime.</span>
      </div>
    </div>
  );
}
