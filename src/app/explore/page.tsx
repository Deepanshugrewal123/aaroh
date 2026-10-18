"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Compass,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
  Layers,
  ChevronRight,
  BookOpen,
  Scale,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Progress } from "@/components/ui/Progress";
import { useAarohStore } from "@/lib/store";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { SKILLS_CATALOG } from "@/lib/skills-data";
import { CareerRole, EducationalDiscipline } from "@/lib/types";
import { getDisciplineLabel } from "@/lib/utils";

export default function CareerExplorerPage() {
  const { profile, toggleSaveCareer, setTargetCareer } = useAarohStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [selectedWorkstyle, setSelectedWorkstyle] = useState<string>("all");
  const [accessibilityFilter, setAccessibilityFilter] = useState<string>("all");

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
    // Search query match
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      career.title.toLowerCase().includes(q) ||
      career.summary.toLowerCase().includes(q) ||
      career.skillsRequired.some((s) => SKILLS_CATALOG[s.skillId]?.name.toLowerCase().includes(q));

    // Discipline filter
    const matchesDiscipline = selectedDiscipline === "all" || career.discipline === selectedDiscipline;

    // Workstyle filter
    const matchesWorkstyle = selectedWorkstyle === "all" || career.workStyle.includes(selectedWorkstyle as any);

    // Accessibility filter
    const matchesAccessibility = accessibilityFilter === "all" || career.beginnerAccessibility === accessibilityFilter;

    return matchesSearch && matchesDiscipline && matchesWorkstyle && matchesAccessibility;
  });

  const comparedCareerObjects = CAREERS_CATALOG.filter((c) => comparisonSlugs.includes(c.slug));

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border-subtle gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-amber-brand uppercase tracking-wider">
                Discover
              </span>
              <span className="text-text-muted">•</span>
              <span className="text-xs text-text-muted">{CAREERS_CATALOG.length} Realistic Disciplines</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary tracking-tight">
              Career Explorer
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
              Explore authentic day-in-the-life realities, entry-level pathways, and required skills across technology, commerce, design, sciences, healthcare, and law.
            </p>
          </div>

          {/* Comparison Action Trigger */}
          {comparisonSlugs.length > 0 && (
            <div className="flex items-center gap-3 bg-surface-secondary px-4 py-2 rounded-xl border border-border-medium shadow-sm animate-fade-in">
              <span className="text-xs font-semibold text-text-primary">
                {comparisonSlugs.length} / 3 selected to compare
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCompareModalOpen(true)}
              >
                <Scale className="w-4 h-4 mr-1" />
                Compare Now
              </Button>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-xl bg-surface-card border border-border-subtle space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by career title, skill (e.g. SQL, Figma, Accounting), or interest..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-secondary/70 border border-border-medium text-text-primary placeholder:text-text-muted/60 text-sm focus:outline-none focus:border-amber-brand transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Discipline Pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="font-semibold text-text-muted mr-1">Field:</span>
              {[
                { id: "all", label: "All Disciplines" },
                { id: "engineering", label: "Tech & Systems" },
                { id: "commerce_business", label: "Commerce" },
                { id: "arts_design", label: "Design & UX" },
                { id: "science_research", label: "Science & Research" },
                { id: "healthcare", label: "Healthcare" },
                { id: "law_public_service", label: "Policy & Law" },
                { id: "media_communication", label: "Media & Journalism" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDiscipline(tab.id)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedDiscipline === tab.id
                      ? "bg-amber-brand text-neutral-950 font-bold"
                      : "bg-surface-interactive text-text-muted hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Beginner Accessibility Filter */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-muted">Accessibility:</span>
              <select
                value={accessibilityFilter}
                onChange={(e) => setAccessibilityFilter(e.target.value)}
                className="px-2.5 py-1 rounded-md bg-surface-interactive border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-amber-brand"
              >
                <option value="all">Any Accessibility</option>
                <option value="high">High (No prerequisites)</option>
                <option value="medium">Medium (Foundational baseline)</option>
                <option value="rigorous">Rigorous (Specific credentials)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Careers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((career) => {
            const isSaved = profile.savedCareerSlugs.includes(career.slug);
            const isTarget = profile.targetCareerSlug === career.slug;
            const isCompared = comparisonSlugs.includes(career.slug);

            return (
              <Card
                key={career.id}
                hoverEffect
                className={`flex flex-col justify-between ${
                  isTarget ? "border-amber-brand/60 shadow-amber-subtle" : ""
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="neutral">{getDisciplineLabel(career.discipline)}</Badge>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleCompare(career.slug)}
                        title={isCompared ? "Remove from comparison" : "Add to comparison (up to 3)"}
                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                          isCompared
                            ? "bg-amber-brand/20 text-amber-brand border-amber-brand"
                            : "bg-surface-interactive text-text-muted hover:text-text-primary border-border-subtle"
                        }`}
                      >
                        {isCompared ? "✓ Comparing" : "+ Compare"}
                      </button>
                      <button
                        onClick={() => toggleSaveCareer(career.slug)}
                        className="p-1 text-text-muted hover:text-amber-brand transition-colors"
                        aria-label={isSaved ? "Saved career" : "Bookmark career"}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-brand" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-text-primary font-display leading-snug">
                      {career.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {career.tagline}
                    </p>
                  </div>

                  {/* Key Skills Tags */}
                  <div className="space-y-1.5 pt-2 border-t border-border-subtle/70">
                    <span className="text-[11px] font-semibold text-text-primary uppercase tracking-wider block">
                      Core Skills:
                    </span>
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

                  {/* Day in Life Preview */}
                  <div className="p-2.5 rounded-lg bg-surface-secondary/60 border border-border-subtle text-[11px] text-text-muted space-y-1">
                    <p className="font-semibold text-text-primary">Typical Hours & Pace:</p>
                    <p>{career.dayInTheLife.typicalHours}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-border-subtle/70 flex items-center justify-between gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInspectedCareer(career)}
                    className="w-1/2"
                  >
                    View Details
                  </Button>
                  <Link href={`/trials?career=${career.slug}`} className="w-1/2">
                    <Button variant="primary" size="sm" className="w-full">
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      Try Work
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Detailed Career Modal */}
        {inspectedCareer && (
          <Modal
            isOpen={!!inspectedCareer}
            onClose={() => setInspectedCareer(null)}
            title={inspectedCareer.title}
            description={inspectedCareer.tagline}
            maxWidth="xl"
          >
            <div className="space-y-6 text-sm">
              {/* Summary & Discipline */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle">
                <div>
                  <span className="text-xs text-text-muted">Field: </span>
                  <span className="font-semibold text-text-primary">
                    {getDisciplineLabel(inspectedCareer.discipline)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-text-muted">Accessibility: </span>
                  <span className="font-semibold text-amber-brand capitalize">
                    {inspectedCareer.beginnerAccessibility} Accessibility
                  </span>
                </div>
              </div>

              {/* Day in the Life */}
              <div className="space-y-2">
                <h4 className="font-bold text-text-primary font-display flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-brand" />
                  <span>Day-to-Day Responsibilities & Real Work Examples</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Typical work schedule: <strong>{inspectedCareer.dayInTheLife.typicalHours}</strong>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-surface-secondary/50 border border-border-subtle space-y-1.5">
                    <p className="text-xs font-semibold text-text-primary">Core Recurring Activities:</p>
                    <ul className="space-y-1 text-xs text-text-muted">
                      {inspectedCareer.dayInTheLife.coreActivities.map((act, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-brand mt-0.5">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-secondary/50 border border-border-subtle space-y-1.5">
                    <p className="text-xs font-semibold text-text-primary">Real Work Project Examples:</p>
                    <ul className="space-y-1 text-xs text-text-muted">
                      {inspectedCareer.dayInTheLife.realWorkExamples.map((ex, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-brand shrink-0 mt-0.5" />
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Entry Pathways */}
              <div className="space-y-2">
                <h4 className="font-bold text-text-primary font-display flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-brand" />
                  <span>Entry-Level Pathways & Beginner Projects</span>
                </h4>
                <div className="space-y-2">
                  {inspectedCareer.entryPathways.map((path, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-surface-secondary/50 border border-border-subtle text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-text-primary">
                        <span>{path.pathTitle}</span>
                        <Badge variant="amber">{path.timelineMonths}</Badge>
                      </div>
                      <p className="text-text-muted">{path.description}</p>
                      <p className="text-amber-brand font-medium pt-1">
                        Recommended first project: {path.firstProject}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trade-offs & Common Misconceptions */}
              <div className="space-y-2">
                <h4 className="font-bold text-text-primary font-display flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-brand" />
                  <span>Realities, Trade-offs & Misconceptions</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-surface-secondary/50 border border-border-subtle space-y-1">
                    <p className="font-semibold text-emerald-brand">What Practitioners Value:</p>
                    <ul className="space-y-1 text-text-muted">
                      {inspectedCareer.tradeoffsAndRealities.positives.map((p, i) => (
                        <li key={i}>+ {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-secondary/50 border border-border-subtle space-y-1">
                    <p className="font-semibold text-rose-brand">Common Challenges:</p>
                    <ul className="space-y-1 text-text-muted">
                      {inspectedCareer.tradeoffsAndRealities.challenges.map((c, i) => (
                        <li key={i}>- {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-card border border-border-subtle text-xs text-text-muted space-y-1">
                  <p className="font-semibold text-amber-brand">Common Industry Misconceptions Debunked:</p>
                  {inspectedCareer.tradeoffsAndRealities.commonMisconceptions.map((m, i) => (
                    <p key={i} className="leading-relaxed">{m}</p>
                  ))}
                </div>
              </div>

              {/* Verified Sources */}
              <div className="p-3 rounded-lg bg-surface-secondary/30 border border-border-subtle text-xs text-text-muted flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-brand shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-text-primary">Verified Curated Source:</p>
                  <p>
                    {inspectedCareer.verifiedSources[0]?.title} ({inspectedCareer.verifiedSources[0]?.retrievedYear}).{" "}
                    {inspectedCareer.verifiedSources[0]?.notes}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border-subtle gap-3">
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
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Modal>
        )}

        {/* 2-3 Career Comparison Modal */}
        {isCompareModalOpen && (
          <Modal
            isOpen={isCompareModalOpen}
            onClose={() => setIsCompareModalOpen(false)}
            title="Side-by-Side Career Path Comparison"
            description="Evaluate day-to-day realities, required skills, and beginner entry accessibility side-by-side"
            maxWidth="2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs overflow-x-auto pb-4">
              {comparedCareerObjects.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <Badge variant="amber">{getDisciplineLabel(c.discipline)}</Badge>
                    <h4 className="font-bold text-sm text-text-primary font-display">
                      {c.title}
                    </h4>
                    <p className="text-text-muted line-clamp-2">{c.tagline}</p>

                    <div className="pt-2 border-t border-border-subtle space-y-1">
                      <span className="font-semibold text-text-primary block">Work Pace & Hours:</span>
                      <p className="text-text-muted">{c.dayInTheLife.typicalHours}</p>
                    </div>

                    <div className="pt-2 border-t border-border-subtle space-y-1">
                      <span className="font-semibold text-text-primary block">Accessibility:</span>
                      <Badge variant="neutral" className="capitalize">
                        {c.beginnerAccessibility}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-border-subtle space-y-1">
                      <span className="font-semibold text-text-primary block">Essential Skills:</span>
                      <ul className="space-y-1 text-text-muted">
                        {c.skillsRequired.slice(0, 3).map((r) => (
                          <li key={r.skillId}>• {SKILLS_CATALOG[r.skillId]?.name || r.skillId}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-subtle">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setTargetCareer(c.slug);
                        setIsCompareModalOpen(false);
                      }}
                    >
                      Select as Active Path
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
