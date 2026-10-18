"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Clock,
  CheckCircle2,
  ExternalLink,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { PROJECT_BRIEFS } from "@/lib/projects-data";
import { SKILLS_CATALOG } from "@/lib/skills-data";
import { ProjectBrief } from "@/lib/types";
import { getDisciplineLabel } from "@/lib/utils";

export default function ProjectStudioPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectBrief | null>(null);
  const [isReadmeModalOpen, setIsReadmeModalOpen] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [isPublicPortfolio, setIsPublicPortfolio] = useState(false);

  const openReadmeTemplate = (proj: ProjectBrief) => {
    setSelectedProject(proj);
    setIsReadmeModalOpen(true);
    setCopiedReadme(false);
  };

  const generateReadmeMarkdown = (proj: ProjectBrief): string => {
    return `# ${proj.title}

## 1. Problem Statement
${proj.problemStatement}

## 2. Target Users
${proj.targetUsers}

## 3. Architecture & Features
${proj.scopeAndFeatures.map((f) => `- ${f}`).join("\n")}

## 4. Key Skills Demonstrated
${proj.requiredSkills.map((s) => `- ${SKILLS_CATALOG[s]?.name || s}`).join("\n")}

## 5. Testing & Verification Checklist
${proj.testingChecklist.map((t) => `- [ ] ${t}`).join("\n")}

## 6. Deployment & Demonstration
- Live Demo: [Add URL]
- Author Contribution: [Describe your specific role and architectural decisions]

## 7. Trade-offs & Limitations
- What would you improve with more time?
`;
  };

  const handleCopyReadme = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReadme(true);
    setTimeout(() => setCopiedReadme(false), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="amber">Practical Deliverables</Badge>
              <span className="text-text-muted">•</span>
              <span className="text-xs text-text-muted">Vertical-Slice Briefs</span>
            </div>
            <h1 className="text-2xl font-black font-display text-text-primary tracking-tight">
              Project Studio & Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5 leading-relaxed">
              Move beyond tutorial copies. Build genuine deliverables with problem statements, testing criteria, and structured README documentation.
            </p>
          </div>

          {/* Opt-in Public Portfolio Toggle */}
          <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div>
              <span className="text-xs font-semibold text-text-primary block">
                Public Portfolio
              </span>
              <span className="text-[10px] text-text-muted">
                {isPublicPortfolio ? "Public link active" : "Private by default (Opt-in)"}
              </span>
            </div>
            <button
              onClick={() => setIsPublicPortfolio(!isPublicPortfolio)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                isPublicPortfolio
                  ? "bg-emerald-brand text-neutral-950 border-emerald-brand font-bold"
                  : "bg-surface-interactive text-text-muted hover:text-text-primary border-border-subtle"
              }`}
            >
              {isPublicPortfolio ? "Public" : "Make Public"}
            </button>
          </div>
        </div>

        {/* Project Briefs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECT_BRIEFS.map((project) => (
            <div
              key={project.id}
              className="p-5 rounded-2xl bg-surface-card border border-border-subtle hover:border-border-medium transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral">{getDisciplineLabel(project.discipline)}</Badge>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="capitalize text-amber-brand font-semibold">
                      {project.difficulty}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{project.estimatedEffortHours} hrs
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-text-primary font-display">
                    {project.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    {project.problemStatement}
                  </p>
                </div>

                {/* Scope Preview */}
                <div className="p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle text-xs space-y-1">
                  <span className="font-semibold text-text-primary block text-[11px]">
                    Key Deliverables:
                  </span>
                  <ul className="space-y-0.5 text-text-muted">
                    {project.scopeAndFeatures.slice(0, 2).map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-brand">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills Tested */}
                <div className="flex flex-wrap gap-1">
                  {project.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-0.5 rounded bg-surface-secondary text-text-muted border border-border-subtle"
                    >
                      {SKILLS_CATALOG[s]?.name || s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openReadmeTemplate(project)}
                  className="w-1/2 text-xs"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  README Guide
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedProject(project)}
                  className="w-1/2 text-xs"
                >
                  View Brief Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Full Project Specification */}
        {selectedProject && !isReadmeModalOpen && (
          <Modal
            isOpen={!!selectedProject && !isReadmeModalOpen}
            onClose={() => setSelectedProject(null)}
            title={selectedProject.title}
            description={`Estimated effort: ${selectedProject.estimatedEffortHours} hours • ${getDisciplineLabel(selectedProject.discipline)}`}
            maxWidth="xl"
          >
            <div className="space-y-5 text-xs">
              {/* Problem & Users */}
              <div className="p-3.5 rounded-xl bg-surface-secondary border border-border-subtle space-y-1">
                <span className="font-bold text-text-primary block">Problem Statement</span>
                <p className="text-text-muted leading-relaxed">{selectedProject.problemStatement}</p>
                <p className="text-amber-brand font-medium pt-0.5">Target Users: {selectedProject.targetUsers}</p>
              </div>

              {/* Milestones */}
              <div className="space-y-2">
                <span className="font-bold text-text-primary block">Milestones & Deliverables</span>
                <div className="space-y-2">
                  {selectedProject.milestones.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-surface-card border border-border-subtle space-y-1">
                      <div className="flex items-center justify-between font-semibold text-text-primary">
                        <span>Milestone {idx + 1}: {m.title}</span>
                        <Badge variant="amber">Deliverable</Badge>
                      </div>
                      <ul className="space-y-0.5 text-text-muted pl-2">
                        {m.deliverables.map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))}
                      </ul>
                      <p className="text-emerald-400 text-[11px] pt-0.5">Criteria: {m.criteria}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testing Checklist */}
              <div className="space-y-1.5">
                <span className="font-bold text-text-primary block">Testing Checklist</span>
                <div className="p-3 rounded-lg bg-surface-secondary/60 border border-border-subtle space-y-1 text-text-muted">
                  {selectedProject.testingChecklist.map((test, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-brand shrink-0 mt-0.5" />
                      <span>{test}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReadmeModalOpen(true)}
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  README Template
                </Button>
                <Link href="/skills">
                  <Button variant="primary" size="sm">
                    Log Completed Evidence
                  </Button>
                </Link>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal: README Template Generator */}
        {selectedProject && isReadmeModalOpen && (
          <Modal
            isOpen={isReadmeModalOpen}
            onClose={() => setIsReadmeModalOpen(false)}
            title={`README Template: ${selectedProject.title}`}
            description="Copy this structured markdown template into your GitHub repository"
            maxWidth="xl"
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
                <span className="text-text-muted">Markdown Template:</span>
                <button
                  onClick={() => handleCopyReadme(generateReadmeMarkdown(selectedProject))}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-interactive text-text-primary border border-border-subtle hover:border-amber-brand transition-colors font-medium text-xs"
                >
                  {copiedReadme ? <Check className="w-3.5 h-3.5 text-emerald-brand" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReadme ? "Copied!" : "Copy Markdown"}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-surface-secondary border border-border-medium font-mono text-[11px] leading-relaxed text-text-primary overflow-x-auto max-h-[320px]">
                {generateReadmeMarkdown(selectedProject)}
              </pre>

              <div className="pt-2 text-right">
                <Button variant="outline" size="sm" onClick={() => setIsReadmeModalOpen(false)}>
                  Back
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
