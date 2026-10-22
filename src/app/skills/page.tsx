"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle2,
  HelpCircle,
  Plus,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  GitBranch,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAarohStore } from "@/lib/store";
import { SKILLS_CATALOG } from "@/lib/skills-data";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { EvidenceState, Skill } from "@/lib/types";
import { getEvidenceStateLabel, sanitizeExternalUrl } from "@/lib/utils";

export default function SkillIntelligencePage() {
  const { profile, updateSkillEvidence } = useAarohStore();

  const targetCareer = CAREERS_CATALOG.find((c) => c.slug === profile.targetCareerSlug) || CAREERS_CATALOG[2];

  // Evidence Logging Modal State
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [selectedState, setSelectedState] = useState<EvidenceState>("self_reported");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [reflection, setReflection] = useState("");

  const [activeCategory, setActiveCategory] = useState<string>("target");

  const openLogEvidenceModal = (skill: Skill) => {
    const existing = profile.skillEvidence[skill.id];
    setEditingSkill(skill);
    setSelectedState(existing ? existing.state : "self_reported");
    setSourceTitle(existing?.sourceTitle || "");
    setSourceUrl(existing?.sourceUrl || "");
    setReflection(existing?.reflection || "");
  };

  const handleSaveEvidence = () => {
    if (!editingSkill) return;
    updateSkillEvidence(
      editingSkill.id,
      selectedState,
      sourceTitle.trim() || undefined,
      sourceUrl.trim() || undefined,
      reflection.trim() || undefined
    );
    setEditingSkill(null);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="amber">Skill Evidence</Badge>
              <span className="text-text-muted">•</span>
              <span className="text-xs text-text-muted">Target: {targetCareer.title}</span>
            </div>
            <h1 className="text-2xl font-black font-display text-text-primary tracking-tight">
              Skill Intelligence & Evidence
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5 leading-relaxed">
              Track what you know and what you can prove. We distinguish unknown skills from demonstrated abilities—an unassessed skill never means you are a beginner.
            </p>
          </div>

          <Link href="/explore">
            <Button variant="outline" size="sm" className="text-xs shrink-0">
              Change Target Role
            </Button>
          </Link>
        </div>

        {/* 6 Evidence States Plain-Language Guide */}
        <div className="p-4 rounded-xl bg-surface-card border border-border-subtle space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
            How Aaroh Measures Capability (In Plain Language):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-surface-secondary border border-border-subtle">
              <span className="font-bold text-neutral-400 block mb-0.5">1. Unassessed</span>
              <p className="text-text-muted leading-tight">Not evaluated yet. Unexplored ground, not lack of ability.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-secondary border border-border-subtle">
              <span className="font-bold text-purple-400 block mb-0.5">2. Self-Reported</span>
              <p className="text-text-muted leading-tight">Studied independently or familiar with fundamentals.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-secondary border border-border-subtle">
              <span className="font-bold text-blue-400 block mb-0.5">3. Coursework</span>
              <p className="text-text-muted leading-tight">Completed college syllabus, lab, or structured course.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-secondary border border-border-subtle">
              <span className="font-bold text-amber-brand block mb-0.5">4. Attested Project</span>
              <p className="text-text-muted leading-tight">Submitted brief with attested milestones (uninspected artifact).</p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-secondary border border-border-subtle">
              <span className="font-bold text-emerald-400 block mb-0.5">5. Demonstrated</span>
              <p className="text-text-muted leading-tight">Artifact examined by peer/mentor against rubric criteria.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-secondary border border-border-subtle">
              <span className="font-bold text-teal-400 block mb-0.5">6. Verified</span>
              <p className="text-text-muted leading-tight">Proctored exam or accredited institutional authority.</p>
            </div>
          </div>
        </div>

        {/* Category Tabs: Target Skills vs All Skills */}
        <div className="flex items-center gap-2 border-b border-border-subtle pb-2 text-xs">
          <button
            onClick={() => setActiveCategory("target")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeCategory === "target"
                ? "bg-amber-brand text-brand-text"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Required for {targetCareer.title.split(" ")[0]} ({targetCareer.skillsRequired.length})
          </button>
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeCategory === "all"
                ? "bg-amber-brand text-brand-text"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            All Explored Skills ({Object.keys(SKILLS_CATALOG).length})
          </button>
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {(activeCategory === "target"
            ? targetCareer.skillsRequired.map((req) => ({
                skill: SKILLS_CATALOG[req.skillId],
                importance: req.importance,
              }))
            : Object.values(SKILLS_CATALOG).map((skill) => ({
                skill,
                importance: undefined,
              }))
          ).map(({ skill, importance }) => {
            if (!skill) return null;
            const evidence = profile.skillEvidence[skill.id];
            const state = evidence ? evidence.state : "not_assessed";
            const stateInfo = getEvidenceStateLabel(state);

            return (
              <div
                key={skill.id}
                className="p-4 rounded-xl bg-surface-card border border-border-subtle flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={stateInfo.badgeClass + " text-[10px] px-2 py-0.5 rounded-full font-semibold"}>
                      {stateInfo.label}
                    </span>
                    {importance && (
                      <span className="text-[10px] uppercase font-bold text-text-muted">
                        {importance}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-text-primary font-display">
                    {skill.name}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {skill.description}
                  </p>

                  {evidence && evidence.state !== "not_assessed" && evidence.sourceTitle && (
                    <div className="p-2.5 rounded-lg bg-surface-secondary/70 border border-border-subtle text-[11px] space-y-1 mt-1">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-text-primary truncate font-semibold">
                          {evidence.sourceTitle}
                        </span>
                        {evidence.assessedScore !== undefined && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30 text-[10px]">
                            {evidence.assessedScore}% Completeness
                          </span>
                        )}
                      </div>
                      {evidence.sourceUrl && (() => {
                        const safeUrl = sanitizeExternalUrl(evidence.sourceUrl);
                        return safeUrl ? (
                          <a
                            href={safeUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-amber-brand hover:underline flex items-center gap-1 truncate text-[10px]"
                          >
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            <span>Submitted Link: {safeUrl}</span>
                          </a>
                        ) : (
                          <span className="text-text-muted truncate text-[10px] font-mono">
                            Link: {evidence.sourceUrl}
                          </span>
                        );
                      })()}
                      {evidence.reviewerName && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold pt-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>
                            {evidence.reviewerRole === "mentor" ? "Mentor" : "Peer"} Examined: {evidence.reviewerName} (Unauthenticated Attestation)
                          </span>
                        </div>
                      )}
                      {evidence.reflection && (
                        <p className="text-text-muted italic line-clamp-2 text-[10px] pt-0.5">
                          &ldquo;{evidence.reflection}&rdquo;
                        </p>
                      )}
                      {evidence.unverifiedNotice && (
                        <p className="text-[10px] text-amber-400/80 italic pt-0.5">
                          Notice: {evidence.unverifiedNotice}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
                  <span className="text-[11px] text-text-muted">
                    {evidence?.updatedAt ? `Logged ${new Date(evidence.updatedAt).toLocaleDateString()}` : "Not recorded"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openLogEvidenceModal(skill)}
                    className="text-xs"
                  >
                    {state === "not_assessed" ? "+ Log Proof" : "Update Proof"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Log Evidence */}
        {editingSkill && (
          <Modal
            isOpen={!!editingSkill}
            onClose={() => setEditingSkill(null)}
            title={`Log Proof: ${editingSkill.name}`}
            description="Record authentic coursework, project attestation, or practical demonstration."
            maxWidth="md"
          >
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Evidence Level:
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value as EvidenceState)}
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                >
                  <option value="self_reported">Self-Reported (Studied independently or familiar with basics)</option>
                  <option value="coursework">Coursework (Completed college course or syllabus lab)</option>
                  <option value="student_attested">Attested Project (Completed project brief with self-attested deliverables)</option>
                  <option value="practically_demonstrated">Demonstrated (Examined artifact meeting explicit rubric criteria)</option>
                  <option value="independently_verified">Verified (Proctored exam or accredited institutional authority)</option>
                  <option value="not_assessed">Not Assessed (Reset to unassessed baseline)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Project, Repository, or Course Name:
                </label>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="e.g. CS201 Algorithms Lab or Inventory Repo"
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Public URL (GitHub repo, demo link, or paper):
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Reflection or Implementation Note:
                </label>
                <textarea
                  rows={2}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What specifically did you build or analyze?"
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                />
              </div>

              <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-3">
                <Button variant="ghost" size="sm" onClick={() => setEditingSkill(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveEvidence}>
                  Save Proof
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
