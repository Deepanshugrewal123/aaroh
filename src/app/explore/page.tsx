"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Compass,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Scale,
  ShieldCheck,
  HelpCircle,
  X,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAarohStore } from "@/lib/store";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { SKILLS_CATALOG } from "@/lib/skills-data";
import { CareerRole } from "@/lib/types";
import { getDisciplineLabel } from "@/lib/utils";

export default function CareerExplorerPage() {
  const { profile, toggleSaveCareer, setTargetCareer } = useAarohStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [onlyWithTrials, setOnlyWithTrials] = useState<boolean>(false);

  // Comparison State (up to 3 careers)
  const [comparisonSlugs, setComparisonSlugs] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Detail Modal State
  const [inspectedCareer, setInspectedCareer] = useState<CareerRole | null>(null);

  const toggleCompare = (slug: string) => {
    if (comparisonSlugs.includes(slug)) {
      setComparisonSlugs(comparisonSlugs.filter((s) => s !== slug));
    } else {
      if (comparisonSlugs.length < 3) {
        setComparisonSlugs([...comparisonSlugs, slug]);
      }
    }
  };

  const filteredCareers = CAREERS_CATALOG.filter((career) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      career.title.toLowerCase().includes(q) ||
      career.summary.toLowerCase().includes(q) ||
      career.skillsRequired.some((s) => SKILLS_CATALOG[s.skillId]?.name.toLowerCase().includes(q));

    const matchesDiscipline = selectedDiscipline === "all" || career.discipline === selectedDiscipline;
    const matchesTrialOnly = !onlyWithTrials || ["product-ux-designer", "financial-analyst", "full-stack-systems-engineer", "public-policy-analyst"].includes(career.slug);

    return matchesSearch && matchesDiscipline && matchesTrialOnly;
  });

  const comparedCareerObjects = CAREERS_CATALOG.filter((c) => comparisonSlugs.includes(c.slug));

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="amber">Career Discovery</Badge>
              <span className="text-text-muted">•</span>
              <span className="text-xs text-text-muted">7 Multi-Disciplinary Fields</span>
            </div>
            <h1 className="text-2xl font-black font-display text-text-primary tracking-tight">
              Explore Career Paths
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5 leading-relaxed">
              Understand actual day-to-day work, entry pathways, and required skills without salary hype or false promises.
            </p>
          </div>

          {/* Floating or Top Compare Banner */}
          {comparisonSlugs.length > 0 && (
            <div className="flex items-center gap-2 bg-surface-secondary px-3 py-1.5 rounded-xl border border-border-medium self-start sm:self-auto">
              <span className="text-xs font-semibold text-text-primary">
                {comparisonSlugs.length}/3 selected
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCompareModalOpen(true)}
                className="text-xs"
              >
                <Scale className="w-3.5 h-3.5 mr-1" />
                Compare Side-by-Side
              </Button>
            </div>
          )}
        </div>

        {/* Search & Simple Plain Language Filter */}
        <div className="p-4 rounded-xl bg-surface-card border border-border-subtle space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search careers, skills (e.g. SQL, Figma, Accounting), or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-secondary border border-border-medium text-text-primary placeholder:text-text-muted/60 text-xs sm:text-sm focus:outline-none focus:border-amber-brand transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex flex-wrap gap-1.5 items-center">
              {[
                { id: "all", label: "All Paths" },
                { id: "engineering", label: "Tech & Systems" },
                { id: "commerce_business", label: "Commerce" },
                { id: "arts_design", label: "Design & UX" },
                { id: "law_public_service", label: "Policy & Law" },
                { id: "healthcare", label: "Healthcare" },
                { id: "science_research", label: "Sciences" },
                { id: "media_communication", label: "Media" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDiscipline(tab.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    selectedDiscipline === tab.id
                      ? "bg-amber-brand text-neutral-950 font-bold"
                      : "bg-surface-secondary text-text-muted hover:text-text-primary border border-border-subtle"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setOnlyWithTrials(!onlyWithTrials)}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors flex items-center gap-1 ${
                onlyWithTrials
                  ? "bg-amber-brand/10 border-amber-brand text-amber-brand font-bold"
                  : "bg-surface-secondary text-text-muted border-border-subtle hover:text-text-primary"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>With 12-Min Micro-Trial</span>
            </button>
          </div>
        </div>

        {/* Clean Career Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCareers.map((career) => {
            const isSaved = profile.savedCareerSlugs.includes(career.slug);
            const isTarget = profile.targetCareerSlug === career.slug;
            const isCompared = comparisonSlugs.includes(career.slug);
            const hasTrial = ["product-ux-designer", "financial-analyst", "full-stack-systems-engineer", "public-policy-analyst"].includes(career.slug);

            return (
              <div
                key={career.id}
                className={`p-5 rounded-2xl bg-surface-card border transition-all flex flex-col justify-between space-y-4 ${
                  isTarget
                    ? "border-amber-brand/50 shadow-sm"
                    : "border-border-subtle hover:border-border-medium"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={isTarget ? "amber" : "neutral"}>
                      {isTarget ? "Target Path" : getDisciplineLabel(career.discipline)}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleCompare(career.slug)}
                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                          isCompared
                            ? "bg-amber-brand/20 text-amber-brand border-amber-brand font-semibold"
                            : "bg-surface-interactive text-text-muted hover:text-text-primary border-border-subtle"
                        }`}
                      >
                        {isCompared ? "✓ Selected" : "+ Compare"}
                      </button>
                      <button
                        onClick={() => toggleSaveCareer(career.slug)}
                        className="p-1 text-text-muted hover:text-amber-brand transition-colors"
                        aria-label="Bookmark career"
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-brand" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-text-primary font-display">
                      {career.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      {career.tagline}
                    </p>
                  </div>

                  {/* Day in Life Preview */}
                  <div className="p-2.5 rounded-lg bg-surface-secondary/70 border border-border-subtle text-xs text-text-muted space-y-0.5">
                    <span className="font-semibold text-text-primary block text-[11px]">
                      Daily Reality:
                    </span>
                    <p className="line-clamp-2">{career.dayInTheLife.coreActivities[0]}</p>
                  </div>

                  {/* 3 Core Skills */}
                  <div className="flex flex-wrap gap-1">
                    {career.skillsRequired.slice(0, 3).map((req) => (
                      <span
                        key={req.skillId}
                        className="text-[11px] px-2 py-0.5 rounded bg-surface-secondary text-text-muted border border-border-subtle"
                      >
                        {SKILLS_CATALOG[req.skillId]?.name || req.skillId}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInspectedCareer(career)}
                    className="w-1/2 text-xs"
                  >
                    View Realities & Paths
                  </Button>
                  {hasTrial ? (
                    <Link href={`/trials?career=${career.slug}`} className="w-1/2">
                      <Button variant="primary" size="sm" className="w-full text-xs">
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        Try 12-Min Work
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setTargetCareer(career.slug)}
                      className="w-1/2 text-xs"
                    >
                      Set as Target
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Detailed Career Information */}
        {inspectedCareer && (
          <Modal
            isOpen={!!inspectedCareer}
            onClose={() => setInspectedCareer(null)}
            title={inspectedCareer.title}
            description={inspectedCareer.tagline}
            maxWidth="xl"
          >
            <div className="space-y-5 text-xs">
              {/* Day in the Life */}
              <div className="p-4 rounded-xl bg-surface-secondary/60 border border-border-subtle space-y-2">
                <span className="font-bold text-text-primary text-sm font-display block">
                  Day-in-the-Life & Hours
                </span>
                <p className="text-text-muted">
                  Schedule: <strong>{inspectedCareer.dayInTheLife.typicalHours}</strong>
                </p>
                <div className="space-y-1 pt-1">
                  <span className="font-semibold text-text-primary block">Recurring Work:</span>
                  <ul className="space-y-1 text-text-muted">
                    {inspectedCareer.dayInTheLife.coreActivities.map((act, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-brand mt-0.5">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Entry Pathways */}
              <div className="space-y-2">
                <span className="font-bold text-text-primary text-sm font-display block">
                  Entry-Level Pathways & Beginner Projects
                </span>
                <div className="space-y-2">
                  {inspectedCareer.entryPathways.map((path, i) => (
                    <div key={i} className="p-3 rounded-lg bg-surface-card border border-border-subtle space-y-1">
                      <div className="flex items-center justify-between font-semibold text-text-primary">
                        <span>{path.pathTitle}</span>
                        <Badge variant="amber">{path.timelineMonths}</Badge>
                      </div>
                      <p className="text-text-muted">{path.description}</p>
                      <p className="text-amber-brand font-medium pt-0.5">First project: {path.firstProject}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Misconceptions */}
              <div className="p-3.5 rounded-lg bg-surface-secondary/80 border border-border-subtle space-y-1 text-text-muted">
                <span className="font-semibold text-amber-brand block">
                  Common Industry Misconceptions Debunked:
                </span>
                {inspectedCareer.tradeoffsAndRealities.commonMisconceptions.map((m, i) => (
                  <p key={i} className="leading-relaxed">{m}</p>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setTargetCareer(inspectedCareer.slug);
                    setInspectedCareer(null);
                  }}
                  className="w-1/2"
                >
                  Set as Target Path
                </Button>
                <Link href={`/trials?career=${inspectedCareer.slug}`} className="w-1/2">
                  <Button variant="primary" size="md" className="w-full">
                    <span>Try 12-Min Micro-Trial</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal: Side-by-Side Comparison */}
        {isCompareModalOpen && (
          <Modal
            isOpen={isCompareModalOpen}
            onClose={() => setIsCompareModalOpen(false)}
            title="Side-by-Side Career Path Comparison"
            description="Compare day-to-day work, pace, and core skills"
            maxWidth="xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {comparedCareerObjects.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <Badge variant="amber">{getDisciplineLabel(c.discipline)}</Badge>
                    <h4 className="font-bold text-sm text-text-primary font-display">{c.title}</h4>
                    <p className="text-text-muted line-clamp-2">{c.tagline}</p>

                    <div className="pt-2 border-t border-border-subtle space-y-0.5">
                      <span className="font-semibold text-text-primary block">Work Hours:</span>
                      <p className="text-text-muted">{c.dayInTheLife.typicalHours}</p>
                    </div>

                    <div className="pt-2 border-t border-border-subtle space-y-0.5">
                      <span className="font-semibold text-text-primary block">Top Skills:</span>
                      <ul className="space-y-0.5 text-text-muted">
                        {c.skillsRequired.slice(0, 3).map((r) => (
                          <li key={r.skillId}>• {SKILLS_CATALOG[r.skillId]?.name || r.skillId}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        setTargetCareer(c.slug);
                        setIsCompareModalOpen(false);
                      }}
                    >
                      Select as Target
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
