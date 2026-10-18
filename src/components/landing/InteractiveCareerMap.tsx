"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface CareerPathHighlight {
  id: string;
  sparkLabel: string;
  sparkIcon: string;
  discipline: string;
  careerTitle: string;
  tagline: string;
  slug: string;
  dayInTheLifeSnippet: string;
  essentialSkills: string[];
  trialName: string;
  trialMinutes: number;
}

const CAREER_PATHWAYS: CareerPathHighlight[] = [
  {
    id: "tech",
    sparkLabel: "Building Systems & Code",
    sparkIcon: "⚙️",
    discipline: "Engineering",
    careerTitle: "Full-Stack Systems Engineer",
    tagline: "Architect and build reliable digital services from database schemas to interactive client interfaces.",
    slug: "full-stack-systems-engineer",
    dayInTheLifeSnippet: "Design database migrations, write performant API endpoints, and eliminate latency bottlenecks.",
    essentialSkills: ["SQL & Relational Modeling", "TypeScript & React", "Git Collaboration"],
    trialName: "Database Bottleneck & Optimistic UI Debugging",
    trialMinutes: 15,
  },
  {
    id: "design",
    sparkLabel: "Human Experience & UX",
    sparkIcon: "🎨",
    discipline: "Design & Arts",
    careerTitle: "Digital Product & UX Designer",
    tagline: "Bridge human needs and digital systems through user research, wireframing, and accessible design.",
    slug: "product-ux-designer",
    dayInTheLifeSnippet: "Conduct usability tests on proposed workflows and design WCAG AA accessible interface prototypes in Figma.",
    essentialSkills: ["User Research", "UI Prototyping", "Visual Hierarchy"],
    trialName: "Hospital Patient Check-In Usability Audit",
    trialMinutes: 12,
  },
  {
    id: "finance",
    sparkLabel: "Capital, Margins & Strategy",
    sparkIcon: "📈",
    discipline: "Commerce & Business",
    careerTitle: "Financial Analyst & Valuation Associate",
    tagline: "Turn company performance data, financial filings, and market dynamics into capital decisions.",
    slug: "financial-analyst",
    dayInTheLifeSnippet: "Build dynamic 3-statement forecast models, conduct sensitivity analyses, and write crisp investment memos.",
    essentialSkills: ["Financial Modeling", "Corporate Accounting", "Quantitative Fluency"],
    trialName: "Retail Margin Compression & Sensitivity Model",
    trialMinutes: 15,
  },
  {
    id: "policy",
    sparkLabel: "Civic Policy & Law",
    sparkIcon: "⚖️",
    discipline: "Law & Public Service",
    careerTitle: "Public Policy & Governance Analyst",
    tagline: "Evaluate societal challenges, analyze legal frameworks, and design evidence-backed public programs.",
    slug: "public-policy-analyst",
    dayInTheLifeSnippet: "Synthesize legislative precedent, dissect government datasets, and draft actionable policy briefs for ministries.",
    essentialSkills: ["Policy Analysis", "Structured Written Communication", "Critical Reasoning"],
    trialName: "Electric Bus Subsidy Stakeholder Conflict",
    trialMinutes: 12,
  },
];

export function InteractiveCareerMap() {
  const [activePathwayId, setActivePathwayId] = useState<string>("tech");

  const currentPath = CAREER_PATHWAYS.find((p) => p.id === activePathwayId) || CAREER_PATHWAYS[0];

  return (
    <div className="w-full rounded-2xl bg-surface-card border border-border-subtle p-5 sm:p-7 shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border-subtle gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-brand" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-brand font-display">
              Interactive Path Discovery
            </span>
          </div>
          <p className="text-sm font-semibold text-text-primary mt-0.5">
            Tap a curiosity spark to see where it leads:
          </p>
        </div>
        <div className="text-[11px] text-text-muted flex items-center gap-1.5 bg-surface-secondary px-2.5 py-1 rounded-lg border border-border-subtle shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-brand shrink-0" />
          <span>Exploratory paths, not rigid destiny</span>
        </div>
      </div>

      {/* 4 Clean Curiosity Sparks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-5">
        {CAREER_PATHWAYS.map((path) => {
          const isSelected = path.id === activePathwayId;
          return (
            <button
              key={path.id}
              onClick={() => setActivePathwayId(path.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? "bg-amber-brand/10 border-amber-brand text-text-primary font-semibold shadow-sm"
                  : "bg-surface-secondary/70 border-border-subtle text-text-muted hover:border-border-medium hover:text-text-primary"
              }`}
            >
              <span className="text-xl mb-1">{path.sparkIcon}</span>
              <span className="text-xs font-bold leading-tight font-display">{path.sparkLabel}</span>
              <span className="text-[10px] text-text-muted mt-1">{path.discipline}</span>
            </button>
          );
        })}
      </div>

      {/* Pathway Reveal Card */}
      <div className="mt-5 p-5 sm:p-6 rounded-xl bg-surface-secondary/60 border border-border-subtle space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <Badge variant="amber" className="mb-1">{currentPath.discipline}</Badge>
            <h3 className="text-base sm:text-lg font-bold text-text-primary font-display">
              {currentPath.careerTitle}
            </h3>
          </div>
          <div className="text-xs font-medium text-amber-brand flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>{currentPath.trialMinutes}-min micro-trial available</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          {currentPath.tagline}
        </p>

        {/* Day-in-the-Life snippet */}
        <div className="p-3 rounded-lg bg-surface-card border border-border-subtle text-xs text-text-muted space-y-1">
          <span className="font-semibold text-text-primary block">
            Actual Day-to-Day Work:
          </span>
          <p className="leading-relaxed">{currentPath.dayInTheLifeSnippet}</p>
        </div>

        {/* Essential Skills */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Skills You Will Demonstrate:
          </span>
          <div className="flex flex-wrap gap-2">
            {currentPath.essentialSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-surface-card border border-border-subtle text-text-primary font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-brand shrink-0" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-border-subtle/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-text-muted">
            <strong>Reality Check:</strong> {currentPath.trialName}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link href={`/explore`} className="w-1/2 sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                View Role Details
              </Button>
            </Link>
            <Link href={`/trials?career=${currentPath.slug}`} className="w-1/2 sm:w-auto">
              <Button variant="primary" size="sm" className="w-full">
                <span>Try Work ({currentPath.trialMinutes} min)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
