"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TiltCard } from "./TiltCard";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { SKILLS_CATALOG } from "@/lib/skills-data";
import { soundEngine } from "./SoundAmbienceToggle";

interface ConstellationExplorerProps {
  activeDisciplineIndex: number;
  onSelectDiscipline: (index: number) => void;
}

const DISCIPLINE_TABS = [
  { label: "Engineering & Systems", icon: "⚙️", slug: "full-stack-systems-engineer" },
  { label: "Design & UX", icon: "🎨", slug: "product-ux-designer" },
  { label: "Commerce & Valuation", icon: "📈", slug: "financial-analyst" },
  { label: "Law & Public Policy", icon: "⚖️", slug: "public-policy-analyst" },
  { label: "Science & Research", icon: "🔬", slug: "environmental-data-researcher" },
  { label: "Healthcare & Life", icon: "🧬", slug: "clinical-research-coordinator" },
  { label: "Media & Journalism", icon: "📰", slug: "investigative-tech-journalist" },
];

export function ConstellationExplorer({
  activeDisciplineIndex,
  onSelectDiscipline,
}: ConstellationExplorerProps) {
  const currentTab = DISCIPLINE_TABS[activeDisciplineIndex] || DISCIPLINE_TABS[0];
  const currentRole =
    CAREERS_CATALOG.find((c) => c.slug === currentTab.slug) || CAREERS_CATALOG[0];

  const handleTabClick = (idx: number) => {
    onSelectDiscipline(idx);
    soundEngine?.playChime(idx);
  };

  return (
    <section id="constellation" className="relative py-20 px-4 sm:px-6 max-w-6xl mx-auto z-10">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-secondary border border-border-subtle text-xs font-mono uppercase tracking-wider text-text-muted">
          <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
          <span>Interactive Career Constellation</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-text-primary tracking-tight">
          Explore Multidisciplinary Pathways
        </h2>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          Navigate 7 grounded career disciplines. Understand day-to-day realities, entry pathways, and skill demands without inflated salary claims or false promises.
        </p>
      </div>

      {/* Interactive Orbital Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {DISCIPLINE_TABS.map((tab, idx) => {
          const isSelected = activeDisciplineIndex === idx;
          return (
            <button
              key={tab.slug}
              onClick={() => handleTabClick(idx)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-brand-primary text-brand-text border-brand-primary shadow-lg shadow-brand-glow scale-105"
                  : "bg-surface-card/80 backdrop-blur-md text-text-muted hover:text-text-primary border-border-subtle hover:border-border-medium hover:bg-surface-interactive/70"
              }`}
              aria-pressed={isSelected}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Career Role 3D Depth Card */}
      <TiltCard className="border border-brand-primary/30 bg-surface-card/90 backdrop-blur-xl shadow-2xl p-6 sm:p-8 animate-fade-in">
        <div className="space-y-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle/80 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="primary">{currentRole.discipline.replace("_", " ").toUpperCase()}</Badge>
                <span className="text-xs font-mono text-text-muted">•</span>
                <span className="text-xs font-mono text-mint-brand flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentRole.dayInTheLife.typicalHours}</span>
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-text-primary tracking-tight">
                {currentRole.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/trials?career=${currentRole.slug}`}>
                <Button size="sm" variant="primary" className="font-bold shadow-md shadow-brand-glow">
                  <Zap className="w-3.5 h-3.5 mr-1 text-current" />
                  <span>Try 12-Min Work Simulation</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Tagline & Summary */}
          <div className="space-y-2">
            <p className="text-sm sm:text-base font-semibold text-text-primary leading-snug">
              {currentRole.tagline}
            </p>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {currentRole.summary}
            </p>
          </div>

          {/* 3-Column Editorial Grid: Daily Work / Skills / Reality Check */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Column 1: Day-to-Day Realities */}
            <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-text-muted block">
                Actual Daily Work
              </span>
              <ul className="space-y-2 text-xs text-text-secondary">
                {currentRole.dayInTheLife.coreActivities.slice(0, 3).map((activity, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-primary shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Required Skills */}
            <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-text-muted block">
                Core Skill Capabilities
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentRole.skillsRequired.map((req) => {
                  const skillMeta = SKILLS_CATALOG[req.skillId];
                  return (
                    <span
                      key={req.skillId}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-surface-card border border-border-subtle text-text-primary font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 text-mint-brand shrink-0" />
                      <span>{skillMeta?.name || req.skillId}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Honest Trade-Offs & Misconceptions */}
            <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-brand block flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Honest Trade-Off Reality</span>
              </span>
              <p className="text-xs text-text-muted leading-relaxed">
                {currentRole.tradeoffsAndRealities.commonMisconceptions[0] ||
                  currentRole.tradeoffsAndRealities.challenges[0]}
              </p>
              <div className="pt-1 text-[11px] text-text-secondary font-medium">
                <strong>Entry Timeline:</strong> {currentRole.entryPathways[0]?.timelineMonths || "3–6 months"}
              </div>
            </div>
          </div>

          {/* Footer Card Navigation Actions */}
          <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-mint-brand" />
              <span>Full curriculum briefs and testing rubrics available in Project Studio</span>
            </span>
            <div className="flex items-center gap-2">
              <Link href={`/explore`}>
                <Button variant="outline" size="sm">
                  <span>Browse All 7 Careers</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </TiltCard>
    </section>
  );
}
