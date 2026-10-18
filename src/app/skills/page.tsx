"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  GitBranch,
  BookOpen,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Progress } from "@/components/ui/Progress";
import { useAarohStore } from "@/lib/store";
import { SKILLS_CATALOG } from "@/lib/skills-data";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { EvidenceState, Skill, SkillCategory } from "@/lib/types";
import { getEvidenceStateLabel } from "@/lib/utils";

export default function SkillIntelligencePage() {
  const { profile, updateSkillEvidence } = useAarohStore();

  const targetCareer = CAREERS_CATALOG.find((c) => c.slug === profile.targetCareerSlug) || CAREERS_CATALOG[2];

  // Evidence Logging Modal State
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [selectedState, setSelectedState] = useState<EvidenceState>("self_reported");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [reflection, setReflection] = useState("");

  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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

  // Calculate transparent coverage for target career
  let totalPoints = 0;
  let earnedPoints = 0;
  targetCareer.skillsRequired.forEach((req) => {
    const weight = req.importance === "essential" ? 3 : req.importance === "advantageous" ? 2 : 1;
    totalPoints += weight;
    const ev = profile.skillEvidence[req.skillId];
    if (ev) {
      if (ev.state === "independently_verified") earnedPoints += weight * 1.0;
      else if (ev.state === "practically_demonstrated") earnedPoints += weight * 0.9;
      else if (ev.state === "coursework") earnedPoints += weight * 0.6;
      else if (ev.state === "self_reported") earnedPoints += weight * 0.35;
    }
  });
  const coveragePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  const allSkills = Object.values(SKILLS_CATALOG);
  const filteredSkills = allSkills.filter((s) => {
    if (categoryFilter === "all") return true;
    return s.category === categoryFilter;
  });

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border-subtle gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="amber">Evidence Over Claims</Badge>
              <span className="text-text-muted">•</span>
              <span className="text-xs text-text-muted">5 Verified Evidence States</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary tracking-tight">
              Skill Intelligence & Gap Analyzer
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
              Track what you know and what you can prove. Unknown skills are distinguished from unassessed skills. Missing uploads never mean you lack an ability.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle text-xs text-text-muted flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-brand shrink-0" />
            <span>Coverage is a learning diagnostic, never a hiring probability.</span>
          </div>
        </div>

        {/* Target Career Skill Gap Analysis Card */}
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <div>
              <span className="text-xs text-text-muted font-medium">Target Role Diagnostic:</span>
              <h2 className="text-lg font-bold font-display text-text-primary">
                {targetCareer.title}
              </h2>
            </div>
            <Link href="/explore">
              <Button variant="ghost" size="sm">
                Change Target Role
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            <Progress
              value={coveragePercent}
              label="Role Skill Requirement Coverage"
              helperText="Formula: (Demonstrated × 1.0 + Coursework × 0.6 + Self-Reported × 0.35) / Total Skill Weight × 100"
            />
          </div>

          {/* Role specific skills list with current evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
            {targetCareer.skillsRequired.map((req) => {
              const skill = SKILLS_CATALOG[req.skillId];
              const evidence = profile.skillEvidence[req.skillId];
              const state = evidence ? evidence.state : "not_assessed";
              const stateInfo = getEvidenceStateLabel(state);

              return (
                <div
                  key={req.skillId}
                  className="p-3.5 rounded-xl bg-surface-secondary/70 border border-border-subtle flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={stateInfo.badgeClass + " text-[10px] px-2 py-0.5 rounded-full"}>
                        {stateInfo.label}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-text-muted">
                        {req.importance}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-text-primary">
                      {skill?.name || req.skillId}
                    </h4>

                    <p className="text-xs text-text-muted line-clamp-2">
                      {skill?.description}
                    </p>

                    {evidence?.sourceTitle && (
                      <p className="text-[11px] text-amber-brand truncate pt-1">
                        Proof: {evidence.sourceTitle}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => skill && openLogEvidenceModal(skill)}
                    className="w-full text-xs"
                  >
                    {state === "not_assessed" ? "Log Proof of Work" : "Update Evidence"}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Global Skill Taxonomy & Evidence States */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-text-primary">
                Multi-Disciplinary Skill Taxonomy
              </h3>
              <p className="text-xs text-text-muted">
                Filter by category and log coursework or demonstrated evidence
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { id: "all", label: "All Skills" },
                { id: "foundational", label: "Foundational" },
                { id: "technical", label: "Technical" },
                { id: "applied", label: "Applied" },
                { id: "communication", label: "Communication" },
                { id: "domain_knowledge", label: "Domain" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    categoryFilter === tab.id
                      ? "bg-amber-brand text-neutral-950 font-bold"
                      : "bg-surface-interactive text-text-muted hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSkills.map((skill) => {
              const evidence = profile.skillEvidence[skill.id];
              const state = evidence ? evidence.state : "not_assessed";
              const stateInfo = getEvidenceStateLabel(state);

              return (
                <div
                  key={skill.id}
                  className="p-4 rounded-xl bg-surface-card border border-border-subtle space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={stateInfo.badgeClass + " text-[10px] px-2 py-0.5 rounded-full"}>
                        {stateInfo.label}
                      </span>
                      <Badge variant="neutral" className="capitalize">
                        {skill.category.replace("_", " ")}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-sm text-text-primary font-display">
                      {skill.name}
                    </h4>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {skill.description}
                    </p>

                    {skill.prerequisites && (
                      <div className="text-[11px] text-text-muted flex items-center gap-1 pt-1">
                        <GitBranch className="w-3.5 h-3.5 text-amber-brand" />
                        <span>Prerequisites: {skill.prerequisites.map((p) => SKILLS_CATALOG[p]?.name || p).join(", ")}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
                    <span className="text-[11px] text-text-muted">
                      {evidence?.updatedAt ? `Updated ${new Date(evidence.updatedAt).toLocaleDateString()}` : "Not yet recorded"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openLogEvidenceModal(skill)}
                    >
                      {state === "not_assessed" ? "+ Add Proof" : "Edit Proof"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal: Log Evidence Record */}
        {editingSkill && (
          <Modal
            isOpen={!!editingSkill}
            onClose={() => setEditingSkill(null)}
            title={`Log Proof of Skill: ${editingSkill.name}`}
            description="Record authentic coursework or practical demonstration. Never fabricate project accomplishments."
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Evidence State:
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value as EvidenceState)}
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                >
                  <option value="self_reported">Self-Reported (I have studied/used this independently)</option>
                  <option value="coursework">Coursework (Completed university course or syllabus lab)</option>
                  <option value="practically_demonstrated">Practically Demonstrated (Built a working project or deliverable)</option>
                  <option value="independently_verified">Independently Verified (Peer-reviewed or verified artifact)</option>
                  <option value="not_assessed">Not Assessed (Reset to unassessed baseline)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Artifact / Project / Course Title:
                </label>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="e.g. CS201 Algorithms Course or Full-Stack Inventory Repo"
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Public URL (GitHub repo, live demo, or published document):
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://github.com/... or https://..."
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Personal Reflection or Technical Note:
                </label>
                <textarea
                  rows={3}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What specifically did you build or analyze? What was the hardest part?"
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSkill(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveEvidence}
                >
                  Save Evidence
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
