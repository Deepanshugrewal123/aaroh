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
  Clock,
  Layers,
  AlertCircle,
  ChevronRight,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { useAarohStore } from "@/lib/store";
import { EducationalDiscipline, EducationStage, WorkStyle } from "@/lib/types";
import { computeCareerRecommendations } from "@/lib/recommendation-engine";
import { getDisciplineLabel } from "@/lib/utils";

const STAGE_NAMES = [
  "Current Position",
  "Evidence Baseline",
  "Styles & Interests",
  "Time & Goals",
  "Uncertainties",
  "Confirmation",
];

const DISCIPLINE_OPTIONS: { id: EducationalDiscipline; label: string; desc: string }[] = [
  { id: "engineering", label: "Engineering & Technology", desc: "CS, IT, Electronics, Mechanical, Civil, etc." },
  { id: "commerce_business", label: "Commerce & Business", desc: "B.Com, BBA, Finance, Accounting, Economics" },
  { id: "arts_design", label: "Arts, Design & Humanities", desc: "Design, Literature, Psychology, Fine Arts" },
  { id: "science_research", label: "Science & Research", desc: "Physics, Math, Chemistry, Environmental, Data" },
  { id: "healthcare", label: "Healthcare & Life Sciences", desc: "Biotech, Nursing, Pharma, Pre-Med, Allied Health" },
  { id: "law_public_service", label: "Law & Public Policy", desc: "Law, Governance, Public Administration, Civil Services" },
  { id: "media_communication", label: "Media & Journalism", desc: "Mass Comm, Tech Journalism, Digital Media" },
  { id: "undecided", label: "Undecided / Open Explorer", desc: "Exploring multiple fields without fixed specialization" },
];

const WORK_STYLE_OPTIONS: { id: WorkStyle; label: string; desc: string }[] = [
  { id: "analytical", label: "Analytical", desc: "Breaking problems down, modeling data, tracing logic" },
  { id: "creative", label: "Creative & Visual", desc: "Designing user interfaces, storytelling, aesthetic flow" },
  { id: "practical_hands_on", label: "Practical & Hands-On", desc: "Building working systems, debugging, shipping code" },
  { id: "collaborative", label: "Collaborative & People-Facing", desc: "Cross-functional teams, interviews, user communication" },
  { id: "independent", label: "Independent Deep Work", desc: "Long uninterrupted focus, reading literature, self-driven tasks" },
  { id: "strategic", label: "Strategic & Systems Thinking", desc: "Tradeoff analysis, organizational impact, ethical questions" },
];

const SUGGESTED_INTEREST_TAGS = [
  "Web Development",
  "System Architecture",
  "UX & Product Design",
  "Environmental Data",
  "Financial Modeling",
  "Public Policy",
  "Clinical Workflows",
  "Investigative Tech Journalism",
  "Data Visualization",
  "Open Source",
  "Security & Privacy",
  "Economics & Markets",
];

const COMMON_UNCERTAINTIES = [
  "I am not sure if my coding/technical ability is strong enough for industry jobs.",
  "I don't know whether I want a high-specialization tech role or a product/human-facing role.",
  "I worry about choosing a path that could be rapidly disrupted or automated.",
  "I find it hard to balance rigorous college coursework/exams with side projects.",
  "I have broad curiosity across disciplines and fear getting boxed into one track too early.",
  "I don't know what entry-level jobs in India actually pay and demand versus social media hype.",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile, setTargetCareer } = useAarohStore();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Stage A: Current Position & Discipline
  const [name, setName] = useState(profile.name || "");
  const [stage, setStage] = useState<EducationStage>(profile.stage || "first_second_year");
  const [discipline, setDiscipline] = useState<EducationalDiscipline>(profile.discipline || "engineering");
  const [customDisciplineText, setCustomDisciplineText] = useState(profile.customDisciplineText || "");
  const [currentSituation, setCurrentSituation] = useState(profile.currentSituation || "");

  // Stage B: Real Experience Baseline
  const [isCompleteBeginner, setIsCompleteBeginner] = useState(
    !profile.actualExperience && Object.keys(profile.skillEvidence || {}).length === 0
  );
  const [actualExperience, setActualExperience] = useState(profile.actualExperience || "");
  const [experienceTypes, setExperienceTypes] = useState<string[]>([]);

  // Stage C: Working Styles & Curiosity
  const [selectedStyles, setSelectedStyles] = useState<WorkStyle[]>(
    profile.selectedWorkStyles?.length ? profile.selectedWorkStyles : ["analytical"]
  );
  const [interestTags, setInterestTags] = useState<string[]>(
    profile.interests?.length ? profile.interests : ["Technology", "Problem Solving"]
  );
  const [customInterestInput, setCustomInterestInput] = useState("");
  const [thingsToAvoid, setThingsToAvoid] = useState(profile.thingsToAvoid || "");

  // Stage D: Time, Goals & Constraints
  const [weeklyHours, setWeeklyHours] = useState<number>(profile.weeklyCapacityHours || 6);
  const [isExamModeAware, setIsExamModeAware] = useState(profile.isExamMode || false);
  const [goalsAndConstraints, setGoalsAndConstraints] = useState(profile.goalsAndConstraints || "");

  // Stage E: Uncertainties
  const [selectedUncertainties, setSelectedUncertainties] = useState<string[]>(
    profile.uncertainties?.length ? profile.uncertainties : []
  );
  const [customUncertainty, setCustomUncertainty] = useState("");

  const toggleStyle = (style: WorkStyle) => {
    if (selectedStyles.includes(style)) {
      if (selectedStyles.length > 1) {
        setSelectedStyles(selectedStyles.filter((s) => s !== style));
      }
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const toggleInterest = (tag: string) => {
    if (interestTags.includes(tag)) {
      setInterestTags(interestTags.filter((t) => t !== tag));
    } else {
      setInterestTags([...interestTags, tag]);
    }
  };

  const addCustomInterest = () => {
    const val = customInterestInput.trim();
    if (val && !interestTags.includes(val)) {
      setInterestTags([...interestTags, val]);
      setCustomInterestInput("");
    }
  };

  const toggleUncertainty = (u: string) => {
    if (selectedUncertainties.includes(u)) {
      setSelectedUncertainties(selectedUncertainties.filter((item) => item !== u));
    } else {
      setSelectedUncertainties([...selectedUncertainties, u]);
    }
  };

  const addCustomUncertainty = () => {
    const val = customUncertainty.trim();
    if (val && !selectedUncertainties.includes(val)) {
      setSelectedUncertainties([...selectedUncertainties, val]);
      setCustomUncertainty("");
    }
  };

  const handleFinishOnboarding = () => {
    const finalName = name.trim() || "Student Explorer";
    const combinedUncertainties = [...selectedUncertainties];

    const updatedProfile = {
      ...profile,
      name: finalName,
      stage,
      discipline,
      customDisciplineText: customDisciplineText.trim() || undefined,
      currentSituation: currentSituation.trim() || undefined,
      actualExperience: isCompleteBeginner
        ? "Complete beginner: Has not built independent projects yet. Looking to explore first fundamentals safely."
        : actualExperience.trim() || undefined,
      selectedWorkStyles: selectedStyles,
      interests: interestTags,
      thingsToAvoid: thingsToAvoid.trim() || undefined,
      weeklyCapacityHours: weeklyHours,
      isExamMode: isExamModeAware,
      goalsAndConstraints: goalsAndConstraints.trim() || undefined,
      uncertainties: combinedUncertainties,
      hasCompletedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };

    // Deterministically compute hypotheses based purely on student answers
    const recommendations = computeCareerRecommendations(updatedProfile);
    const topHypotheses = recommendations.slice(0, 3).map((r) => r.career.slug);
    const primaryTarget = topHypotheses[0] || "full-stack-systems-engineer";

    updateProfile({
      name: updatedProfile.name,
      stage: updatedProfile.stage,
      discipline: updatedProfile.discipline,
      customDisciplineText: updatedProfile.customDisciplineText,
      currentSituation: updatedProfile.currentSituation,
      actualExperience: updatedProfile.actualExperience,
      selectedWorkStyles: updatedProfile.selectedWorkStyles,
      interests: updatedProfile.interests,
      thingsToAvoid: updatedProfile.thingsToAvoid,
      weeklyCapacityHours: updatedProfile.weeklyCapacityHours,
      isExamMode: updatedProfile.isExamMode,
      goalsAndConstraints: updatedProfile.goalsAndConstraints,
      uncertainties: updatedProfile.uncertainties,
      targetCareerSlug: primaryTarget,
      targetCareerHypotheses: topHypotheses,
      hasCompletedOnboarding: true,
    });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between pb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-primary to-brand-hover flex items-center justify-center font-bold text-brand-text font-display shadow-sm shadow-brand-glow">
            आ
          </div>
          <div>
            <span className="font-display font-bold text-base text-text-primary block leading-none">
              Aaroh
            </span>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
              Career Discovery
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="primary">
            Stage {currentStep} of {totalSteps}: {STAGE_NAMES[currentStep - 1]}
          </Badge>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-2xl w-full mx-auto my-auto py-4">
        {/* Progress Bar */}
        <div className="w-full bg-surface-interactive h-1.5 rounded-full overflow-hidden mb-6 border border-border-subtle">
          <div
            className="bg-brand-primary h-full transition-all duration-300 shadow-brand-glow"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <div className="bg-surface-card rounded-2xl border border-border-medium p-5 sm:p-7 shadow-card space-y-6">
          {/* STAGE 1: Current Position & Discipline */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <Badge variant="primary">Stage A</Badge>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                  Where are you right now in your journey?
                </h1>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Aaroh adapts to your real starting point. Tell us your field and current college year so we never give generic advice.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Your Name (or preferred moniker):
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya or Ananya"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-sm focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-text-primary">
                    Broad Academic Discipline:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {DISCIPLINE_OPTIONS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDiscipline(d.id)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          discipline === d.id
                            ? "bg-brand-primary/10 border-brand-primary text-text-primary font-medium shadow-sm"
                            : "bg-surface-secondary border-border-subtle text-text-muted hover:border-border-medium hover:text-text-primary"
                        }`}
                      >
                        <div className="font-bold text-text-primary text-sm font-display">{d.label}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Specific degree, major, or branch (optional):
                  </label>
                  <input
                    type="text"
                    value={customDisciplineText}
                    onChange={(e) => setCustomDisciplineText(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science, B.Com with Accounting, BA Psychology"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-text-primary">
                    Current Education Stage:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "first_second_year", label: "1st or 2nd Year College" },
                      { id: "pre_final_year", label: "Pre-Final Year" },
                      { id: "final_year", label: "Final Year" },
                      { id: "recent_graduate", label: "Recent Graduate" },
                      { id: "career_changer", label: "Career Changer" },
                      { id: "high_school", label: "School / Pre-College" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStage(s.id as EducationStage)}
                        className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                          stage === s.id
                            ? "bg-brand-primary/15 border-brand-primary text-text-primary font-bold shadow-sm"
                            : "bg-surface-secondary border-border-subtle text-text-muted hover:text-text-primary hover:border-border-medium"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    In your own words: What brings you to Aaroh today? (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={currentSituation}
                    onChange={(e) => setCurrentSituation(e.target.value)}
                    placeholder="e.g. I am in 2nd year CS but find rote coding repetitive; I'm curious if UX design or product systems fit better."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-brand-primary transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: Real Evidence Baseline */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <Badge variant="mint">Stage B • Evidence Integrity</Badge>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                  What have you actually built, studied, or tried so far?
                </h1>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Honesty is valued here. If you haven&apos;t built projects yet, say so proudly—starting with a clean slate is better than fake claims.
                </p>
              </div>

              <div className="space-y-4">
                {/* Complete Beginner Honest Toggle */}
                <div
                  onClick={() => setIsCompleteBeginner(!isCompleteBeginner)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isCompleteBeginner
                      ? "bg-mint-brand/10 border-mint-brand text-text-primary"
                      : "bg-surface-secondary border-border-subtle text-text-muted hover:border-border-medium"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${
                      isCompleteBeginner ? "bg-mint-brand border-mint-brand text-mint-text font-bold" : "border-border-medium"
                    }`}
                  >
                    {isCompleteBeginner && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-text-primary">
                      I am a complete beginner / haven&apos;t built projects yet
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                      Zero fake evidence. Aaroh will begin with 12-minute micro-trials and low-barrier foundational modules.
                    </p>
                  </div>
                </div>

                {!isCompleteBeginner && (
                  <div className="space-y-4 animate-fade-in pt-2">
                    <label className="block text-xs font-semibold text-text-primary">
                      What practical experiences have you touched? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: "academic_coursework", label: "Academic course assignments or lab work" },
                        { id: "personal_projects", label: "Personal hobby projects / side experiments" },
                        { id: "online_courses", label: "Self-paced online tutorials / certifications" },
                        { id: "internship_freelance", label: "Prior internship, client work, or freelancing" },
                        { id: "club_leadership", label: "College club, fest, or society organization" },
                        { id: "open_source_or_competitions", label: "Hackathons, case competitions, open-source" },
                      ].map((item) => {
                        const isChecked = experienceTypes.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setExperienceTypes(experienceTypes.filter((x) => x !== item.id));
                              } else {
                                setExperienceTypes([...experienceTypes, item.id]);
                              }
                            }}
                            className={`p-3 rounded-xl border text-left text-xs transition-all ${
                              isChecked
                                ? "bg-brand-primary/15 border-brand-primary text-text-primary font-medium"
                                : "bg-surface-secondary border-border-subtle text-text-muted hover:border-border-medium"
                            }`}
                          >
                            <span className="font-semibold text-text-primary block">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1.5">
                        Describe one project, assignment, or tool you worked on (even if small or incomplete):
                      </label>
                      <textarea
                        rows={3}
                        value={actualExperience}
                        onChange={(e) => setActualExperience(e.target.value)}
                        placeholder="e.g. Built a basic library management CLI in C++; analyzed census data in Excel for an economics presentation; made a Figma mockup for a college club website."
                        className="w-full px-3.5 py-2 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-brand-primary transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STAGE 3: Styles, Interests & Avoidances */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <Badge variant="primary">Stage C • Affinity Profile</Badge>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                  How do you enjoy working, and what do you want to avoid?
                </h1>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Career satisfaction is as much about work rhythms and avoiding burnout as it is about topics.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-text-primary">
                    Preferred Working Styles (Choose 1 to 3):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {WORK_STYLE_OPTIONS.map((style) => {
                      const isSelected = selectedStyles.includes(style.id);
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => toggleStyle(style.id)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all ${
                            isSelected
                              ? "bg-brand-primary/15 border-brand-primary text-text-primary font-medium shadow-sm"
                              : "bg-surface-secondary border-border-subtle text-text-muted hover:border-border-medium hover:text-text-primary"
                          }`}
                        >
                          <div className="font-bold text-text-primary text-sm font-display flex items-center justify-between">
                            <span>{style.label}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />}
                          </div>
                          <div className="text-[11px] text-text-muted mt-1 leading-snug">{style.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-text-primary">
                    Topics & Themes That Intrigue You:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_INTEREST_TAGS.map((tag) => {
                      const isSelected = interestTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleInterest(tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? "bg-brand-primary text-brand-text font-bold border-brand-primary shadow-brand-glow"
                              : "bg-surface-secondary border-border-subtle text-text-muted hover:text-text-primary hover:border-border-medium"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={customInterestInput}
                      onChange={(e) => setCustomInterestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomInterest();
                        }
                      }}
                      placeholder="Add custom topic (e.g. Electric Vehicles, Cognitive Science)"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-surface-secondary border border-border-medium text-xs text-text-primary focus:outline-none focus:border-brand-primary"
                    />
                    <Button variant="secondary" size="sm" type="button" onClick={addCustomInterest}>
                      Add
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    What daily tasks or work environments do you definitely want to AVOID?
                  </label>
                  <textarea
                    rows={2}
                    value={thingsToAvoid}
                    onChange={(e) => setThingsToAvoid(e.target.value)}
                    placeholder="e.g. Cold calling / high-pressure sales; pure bureaucratic paperwork; 100% solo isolation without team feedback."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-brand-primary transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: Time, Goals & Reality Constraints */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <Badge variant="primary">Stage D • Schedule Calibration</Badge>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                  Calibrate your realistic capacity & immediate milestones
                </h1>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Sustainable progress beats all-nighters that lead to burnout. How much time can you comfortably commit?
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-primary">
                      Weekly Capacity: <span className="font-bold text-brand-primary text-sm font-display">{weeklyHours} hours/week</span>
                    </label>
                    <span className="text-[11px] text-text-muted">
                      {weeklyHours <= 4 ? "Light Exploration (~35 mins/day)" : weeklyHours <= 8 ? "Recommended Baseline (~1 hr/day)" : "Intensive Momentum (~2 hrs/day)"}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { hours: 4, label: "4 hrs/wk", sub: "Light" },
                      { hours: 6, label: "6 hrs/wk", sub: "Balanced" },
                      { hours: 8, label: "8 hrs/wk", sub: "Standard" },
                      { hours: 12, label: "12 hrs/wk", sub: "Intensive" },
                    ].map((item) => (
                      <button
                        key={item.hours}
                        type="button"
                        onClick={() => setWeeklyHours(item.hours)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          weeklyHours === item.hours
                            ? "bg-brand-primary/15 border-brand-primary text-text-primary font-bold shadow-sm"
                            : "bg-surface-secondary border-border-subtle text-text-muted hover:border-border-medium hover:text-text-primary"
                        }`}
                      >
                        <div className="font-bold text-sm text-text-primary">{item.label}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">{item.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-primary" />
                      <span className="font-bold text-xs text-text-primary font-display">
                        College Exam Season Protection
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsExamModeAware(!isExamModeAware)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        isExamModeAware
                          ? "bg-brand-primary text-brand-text border-brand-primary shadow-brand-glow"
                          : "bg-surface-interactive border-border-subtle text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {isExamModeAware ? "Active (3h/wk cap)" : "Inactive"}
                    </button>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    When active, Aaroh throttles your schedule to ~3 hours/week of light concept maintenance, deferring project milestones without breaking your streaks.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    What is your primary focus for the next 3 to 6 months?
                  </label>
                  <textarea
                    rows={2}
                    value={goalsAndConstraints}
                    onChange={(e) => setGoalsAndConstraints(e.target.value)}
                    placeholder="e.g. Test whether I genuinely enjoy data research before deciding on my final-year project; prepare 1 verified portfolio artifact."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-brand-primary transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STAGE 5: Uncertainties & Unknowns */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <Badge variant="mint">Stage E • Honest Uncertainty</Badge>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                  What questions or doubts are currently unresolved?
                </h1>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Career intelligence starts by acknowledging what you don&apos;t know yet. Check any questions on your mind:
                </p>
              </div>

              <div className="space-y-3">
                {COMMON_UNCERTAINTIES.map((u, i) => {
                  const isChecked = selectedUncertainties.includes(u);
                  return (
                    <div
                      key={i}
                      onClick={() => toggleUncertainty(u)}
                      className={`p-3 rounded-xl border cursor-pointer text-xs transition-all flex items-start gap-3 ${
                        isChecked
                          ? "bg-mint-brand/10 border-mint-brand text-text-primary font-medium"
                          : "bg-surface-secondary border-border-subtle text-text-muted hover:border-border-medium hover:text-text-primary"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                          isChecked ? "bg-mint-brand border-mint-brand text-mint-text font-bold" : "border-border-medium"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="leading-relaxed">{u}</span>
                    </div>
                  );
                })}

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Any other specific question or anxiety you want your AI guide to address?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customUncertainty}
                      onChange={(e) => setCustomUncertainty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomUncertainty();
                        }
                      }}
                      placeholder="e.g. Can I transition from Mechanical to UX in India without a design degree?"
                      className="flex-1 px-3 py-2 rounded-xl bg-surface-secondary border border-border-medium text-xs text-text-primary focus:outline-none focus:border-brand-primary"
                    />
                    <Button variant="secondary" size="sm" type="button" onClick={addCustomUncertainty}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 6: Confirmation Review Screen */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <Badge variant="primary">Stage F • Discovery Review</Badge>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                  Review your discovery summary
                </h1>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Here is what Aaroh will use to form your starting career hypotheses. You can edit any section at any time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Card 1: Your Baseline */}
                <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
                    <span className="font-bold text-text-primary font-display flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-brand-primary" />
                      Current Baseline
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-brand-primary hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-text-muted">
                    <p><strong className="text-text-primary">Name:</strong> {name.trim() || "Student Explorer"}</p>
                    <p><strong className="text-text-primary">Field:</strong> {getDisciplineLabel(discipline)}</p>
                    {customDisciplineText && <p><strong className="text-text-primary">Branch:</strong> {customDisciplineText}</p>}
                    <p><strong className="text-text-primary">Stage:</strong> {stage.replace(/_/g, " ")}</p>
                    {currentSituation && <p className="italic text-[11px] pt-1 text-text-secondary">&ldquo;{currentSituation}&rdquo;</p>}
                  </div>
                </div>

                {/* Card 2: Demonstrated Work */}
                <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
                    <span className="font-bold text-text-primary font-display flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-mint-brand" />
                      Experience Baseline
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-brand-primary hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-text-muted">
                    {isCompleteBeginner ? (
                      <p className="text-mint-brand font-semibold">
                        Complete beginner (0 unverified claims). Starting with micro-trials and core fundamentals.
                      </p>
                    ) : (
                      <>
                        <p><strong className="text-text-primary">Touchpoints:</strong> {experienceTypes.length ? experienceTypes.join(", ") : "Self-guided"}</p>
                        {actualExperience && <p className="text-[11px] text-text-secondary pt-1">&ldquo;{actualExperience}&rdquo;</p>}
                      </>
                    )}
                  </div>
                </div>

                {/* Card 3: Working Styles & Preferences */}
                <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
                    <span className="font-bold text-text-primary font-display flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                      Styles & Curiosities
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-brand-primary hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="space-y-1.5 text-text-muted">
                    <div>
                      <span className="font-semibold text-text-primary">Styles: </span>
                      <span className="text-text-secondary">{selectedStyles.join(", ")}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-text-primary">Interests: </span>
                      <span className="text-text-secondary">{interestTags.slice(0, 5).join(", ")}{interestTags.length > 5 ? "..." : ""}</span>
                    </div>
                    {thingsToAvoid && (
                      <p className="text-[11px] text-rose-brand/90 pt-0.5">
                        Avoid: {thingsToAvoid}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card 4: Identified Uncertainties */}
                <div className="p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
                    <span className="font-bold text-text-primary font-display flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-mint-brand" />
                      Identified Unknowns
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="text-brand-primary hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-text-muted">
                    {selectedUncertainties.length === 0 ? (
                      <p className="text-text-muted italic">No specific uncertainties selected.</p>
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-text-secondary">
                        {selectedUncertainties.slice(0, 3).map((u, i) => (
                          <li key={i} className="truncate">{u}</li>
                        ))}
                        {selectedUncertainties.length > 3 && (
                          <li className="text-text-muted">+{selectedUncertainties.length - 3} more questions</li>
                        )}
                      </ul>
                    )}
                    <p className="text-[10px] text-brand-primary pt-1 font-semibold">
                      Will test via Career Micro-Trials instead of guessing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                type="button"
                onClick={handleFinishOnboarding}
                className="w-full sm:w-auto"
              >
                Explore My Career Hypotheses
                <Sparkles className="w-4 h-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
