"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Clock,
  CheckCircle2,
  ExternalLink,
  Code2,
  FileText,
  Share2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
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
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border-subtle gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="amber">Proof Over Claims</Badge>
              <span className="text-text-muted">•</span>
              <span className="text-xs text-text-muted">Rigorous Real-World Project Briefs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary tracking-tight">
              Project Studio & Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
              Move beyond generic tutorial clones. Build vertical-slice deliverables with clear problem statements, testing criteria, and structured README documentation.
            </p>
          </div>

          {/* Opt-in Public Portfolio Toggle */}
          <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-center gap-3">
            <div>
              <span className="text-xs font-semibold text-text-primary block">
                Public Portfolio Sharing
              </span>
              <span className="text-[11px] text-text-muted">
                {isPublicPortfolio ? "Public link active" : "Private by default (Opt-in only)"}
              </span>
            </div>
            <button
              onClick={() => setIsPublicPortfolio(!isPublicPortfolio)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                isPublicPortfolio
                  ? "bg-emerald-brand text-neutral-950 border-emerald-brand"
                  : "bg-surface-interactive text-text-muted hover:text-text-primary border-border-subtle"
              }`}
            >
              {isPublicPortfolio ? "Public" : "Make Public"}
            </button>
          </div>
        </div>

        {/* Project Briefs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECT_BRIEFS.map((project) => (
            <Card key={project.id} hoverEffect className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral">{getDisciplineLabel(project.discipline)}</Badge>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="capitalize text-amber-brand font-medium">
                      {project.difficulty}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      ~{project.estimatedEffortHours} hrs
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-text-primary font-display">
                    {project.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                    {project.problemStatement}
                  </p>
                </div>

                {/* Scope Preview */}
                <div className="p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle text-xs space-y-1.5">
                  <span className="font-semibold text-text-primary block">
                    Core Architectural Scope:
                  </span>
                  <ul className="space-y-1 text-text-muted">
                    {project.scopeAndFeatures.slice(0, 2).map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-brand mt-0.5">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills Tested */}
                <div className="flex flex-wrap gap-1 pt-1">
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

              {/* Actions */}
              <div className="pt-3 border-t border-border-subtle/70 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openReadmeTemplate(project)}
                  className="w-1/2"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  README Guide
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedProject(project)}
                  className="w-1/2"
                >
                  Full Specification
                </Button>
              </div>
            </Card>
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
            <div className="space-y-6 text-xs">
              {/* Problem & Users */}
              <div className="space-y-2 p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle">
                <h4 className="font-bold text-text-primary text-sm font-display">
                  Problem Statement & Target Audience
                </h4>
                <p className="text-text-muted leading-relaxed">{selectedProject.problemStatement}</p>
                <p className="text-amber-brand font-medium pt-1">
                  Target Users: {selectedProject.targetUsers}
                </p>
              </div>

              {/* Milestones & Deliverables */}
              <div className="space-y-3">
                <h4 className="font-bold text-text-primary text-sm font-display">
                  Milestones & Deliverable Artifacts
                </h4>
                <div className="space-y-2">
                  {selectedProject.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface-card border border-border-subtle space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-text-primary">
                        <span>Milestone {idx + 1}: {m.title}</span>
                        <Badge variant="amber">Deliverable</Badge>
                      </div>
                      <ul className="space-y-0.5 text-text-muted pl-2">
                        {m.deliverables.map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))}
                      </ul>
                      <p className="text-emerald-400 text-[11px] pt-1">
                        Success criteria: {m.criteria}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testing Criteria */}
              <div className="space-y-2">
                <h4 className="font-bold text-text-primary text-sm font-display">
                  Testing & Verification Checklist
                </h4>
                <div className="p-3.5 rounded-xl bg-surface-secondary/50 border border-border-subtle space-y-1 text-text-muted">
                  {selectedProject.testingChecklist.map((test, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-brand shrink-0 mt-0.5" />
                      <span>{test}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deployment & Demonstration */}
              <div className="space-y-2">
                <h4 className="font-bold text-text-primary text-sm font-display">
                  Proof of Work Verification Checklist
                </h4>
                <div className="p-3.5 rounded-xl bg-surface-secondary/50 border border-border-subtle space-y-1 text-text-muted">
                  {selectedProject.deploymentAndDemoChecklist.map((dep, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-brand mt-0.5">•</span>
                      <span>{dep}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReadmeModalOpen(true)}
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Generate README Template
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
            description="Copy this structured markdown template into your GitHub repository or project documentation"
            maxWidth="xl"
          >
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="text-text-muted">Markdown Specification:</span>
                <button
                  onClick={() => handleCopyReadme(generateReadmeMarkdown(selectedProject))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-interactive text-text-primary border border-border-subtle hover:border-amber-brand transition-colors font-medium"
                >
                  {copiedReadme ? <Check className="w-3.5 h-3.5 text-emerald-brand" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReadme ? "Copied!" : "Copy Markdown"}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-surface-secondary/90 border border-border-medium font-mono text-[11px] leading-relaxed text-text-primary overflow-x-auto max-h-[350px]">
                {generateReadmeMarkdown(selectedProject)}
              </pre>

              <div className="pt-2 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReadmeModalOpen(false)}
                >
                  Back to Specification
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
