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
  AlertTriangle,
  UploadCloud,
  RotateCcw,
  BookOpen,
  Download,
  Share2,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAarohStore } from "@/lib/store";
import { PROJECT_BRIEFS } from "@/lib/projects-data";
import { SKILLS_CATALOG } from "@/lib/skills-data";
import { ProjectBrief, ProjectSubmissionRecord, ProjectReviewRecord } from "@/lib/types";
import { getDisciplineLabel, sanitizeExternalUrl } from "@/lib/utils";
import { validateProjectUrl } from "@/lib/project-evaluation";
import { createReviewPacket, generateCompletedReview } from "@/lib/review-system";

export default function ProjectStudioPage() {
  const { profile, recordProjectSubmission, importProjectReview } = useAarohStore();

  const [selectedProject, setSelectedProject] = useState<ProjectBrief | null>(null);
  const [isReadmeModalOpen, setIsReadmeModalOpen] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [isPublicPortfolio, setIsPublicPortfolio] = useState(false);

  // Review Packet Hub Modal State
  const [reviewingProject, setReviewingProject] = useState<ProjectBrief | null>(null);
  const [reviewTab, setReviewTab] = useState<"export" | "import" | "conduct">("export");
  const [copiedReviewPacket, setCopiedReviewPacket] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    promotedSkills: string[];
    isStale?: boolean;
  } | null>(null);

  // Fast Conduct Review Form State
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerRole, setReviewerRole] = useState<"peer" | "mentor" | "community">("peer");
  const [artifactExamined, setArtifactExamined] = useState(true);
  const [overallDecision, setOverallDecision] = useState<"approved" | "changes_requested">("approved");
  const [overallFeedback, setOverallFeedback] = useState("");
  const [conductPassedCritIds, setConductPassedCritIds] = useState<string[]>([]);

  // Submission Drawer / Modal State
  const [submittingProject, setSubmittingProject] = useState<ProjectBrief | null>(null);
  const [repoOrDemoUrl, setRepoOrDemoUrl] = useState("");
  const [checkedDeliverableIds, setCheckedDeliverableIds] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Evaluation Result Modal
  const [evaluationResult, setEvaluationResult] = useState<ProjectSubmissionRecord | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Filter tab
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const openReviewModal = (proj: ProjectBrief) => {
    setReviewingProject(proj);
    setReviewTab("export");
    setCopiedReviewPacket(false);
    setImportJsonText("");
    setImportResult(null);
    setReviewerName("");
    setReviewerRole("peer");
    setArtifactExamined(true);
    setOverallDecision("approved");
    setOverallFeedback("");
    setConductPassedCritIds((proj.rubricCriteria || []).map((c) => c.id));
  };

  const handleCopyReviewPacket = (proj: ProjectBrief) => {
    const sub = profile.projectSubmissions[proj.id];
    if (!sub) return;
    const packet = createReviewPacket(sub, proj, profile.name);
    navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
    setCopiedReviewPacket(true);
    setTimeout(() => setCopiedReviewPacket(false), 2000);
  };

  const handleDownloadReviewPacket = (proj: ProjectBrief) => {
    const sub = profile.projectSubmissions[proj.id];
    if (!sub) return;
    const packet = createReviewPacket(sub, proj, profile.name);
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aaroh-review-packet-${proj.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportReviewJson = () => {
    if (!reviewingProject) return;
    try {
      const res = importProjectReview(reviewingProject.id, importJsonText.trim());
      setImportResult(res);
    } catch (e: any) {
      setImportResult({
        success: false,
        message: e.message || "Failed to parse and import review.",
        promotedSkills: [],
      });
    }
  };

  const handleConductReviewSubmit = () => {
    if (!reviewingProject) return;
    const sub = profile.projectSubmissions[reviewingProject.id];
    if (!sub) return;

    if (!reviewerName.trim()) {
      setImportResult({
        success: false,
        message: "Please provide a reviewer name or handle.",
        promotedSkills: [],
      });
      return;
    }

    const criteriaScores: Record<string, { passed: boolean; score: number; feedback: string }> = {};
    (reviewingProject.rubricCriteria || []).forEach((c) => {
      const isPassed = conductPassedCritIds.includes(c.id);
      criteriaScores[c.id] = {
        passed: isPassed,
        score: isPassed ? 90 : 45,
        feedback: isPassed
          ? `Verified criterion: ${c.title}`
          : `Criterion needs improvement: ${c.title}`,
      };
    });

    const completedReview = generateCompletedReview(reviewingProject, sub, {
      reviewerName: reviewerName.trim(),
      reviewerRole,
      overallDecision,
      overallFeedback: overallFeedback.trim() || undefined,
      artifactExamined,
      criteriaScores,
    });

    const res = importProjectReview(reviewingProject.id, completedReview);
    setImportResult(res);
  };

  const openReadmeTemplate = (proj: ProjectBrief) => {
    setSelectedProject(proj);
    setIsReadmeModalOpen(true);
    setCopiedReadme(false);
  };

  const openSubmissionModal = (proj: ProjectBrief) => {
    const existing = profile.projectSubmissions[proj.id];
    setSubmittingProject(proj);
    setSubmissionError(null);

    if (existing) {
      setRepoOrDemoUrl(existing.repoOrDemoUrl || "");
      setCheckedDeliverableIds(existing.checkedDeliverableIds || []);
      setReflection(existing.reflection || "");
    } else {
      setRepoOrDemoUrl("");
      setCheckedDeliverableIds([]);
      setReflection("");
    }
  };

  const handleToggleDeliverable = (delivId: string) => {
    setCheckedDeliverableIds((prev) =>
      prev.includes(delivId) ? prev.filter((id) => id !== delivId) : [...prev, delivId]
    );
  };

  const handleSelectAllDeliverables = (proj: ProjectBrief) => {
    const allIds = (proj.deliverables || []).map((d) => d.id);
    if (checkedDeliverableIds.length === allIds.length) {
      setCheckedDeliverableIds([]);
    } else {
      setCheckedDeliverableIds(allIds);
    }
  };

  const handleSubmitDeliverable = () => {
    if (!submittingProject) return;

    // Fast-fail local validation for empty URL
    const urlCheck = validateProjectUrl(repoOrDemoUrl);
    if (!urlCheck.isValid) {
      setSubmissionError(urlCheck.error || "Please provide a valid repository or demo URL.");
      return;
    }

    if (reflection.trim().length === 0) {
      setSubmissionError("Please provide an architecture reflection explaining your design decisions.");
      return;
    }

    setSubmissionError(null);

    try {
      const result = recordProjectSubmission(submittingProject.id, {
        repoOrDemoUrl: repoOrDemoUrl.trim(),
        checkedDeliverableIds,
        reflection: reflection.trim(),
      });

      setEvaluationResult(result);
      setSubmittingProject(null);
      setIsResultModalOpen(true);
    } catch (e: any) {
      setSubmissionError(e.message || "Failed to evaluate submission.");
    }
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

  const filteredProjects = PROJECT_BRIEFS.filter((proj) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "target") return proj.careerSlug === profile.targetCareerSlug;
    return proj.discipline === activeFilter;
  });

  const renderStatusBadge = (submission?: ProjectSubmissionRecord) => {
    if (!submission) {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-surface-secondary text-text-muted border border-border-subtle">
          Not Started
        </span>
      );
    }

    switch (submission.status) {
      case "evaluated":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-300" />
            Evaluated • {submission.overallScore}%
          </span>
        );
      case "needs_improvement":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-amber-400" />
            Needs Revision • {submission.overallScore}%
          </span>
        );
      case "evaluation_incomplete":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Incomplete Milestones
          </span>
        );
      case "rejected":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            Invalid Reference
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-surface-secondary text-text-muted border border-border-subtle">
            Submitted
          </span>
        );
    }
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
              <span className="text-xs text-text-muted">Vertical-Slice Briefs & Rubrics</span>
            </div>
            <h1 className="text-2xl font-black font-display text-text-primary tracking-tight">
              Project Studio & Practical Proof
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5 leading-relaxed">
              Move beyond tutorial copies. Build genuine deliverables with problem statements, milestone checklists, and structured reflection rubrics that log student-attested evidence.
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

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border-subtle pb-2 text-xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeFilter === "all"
                ? "bg-amber-brand text-neutral-950 font-bold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            All Briefs ({PROJECT_BRIEFS.length})
          </button>
          {profile.targetCareerSlug && (
            <button
              onClick={() => setActiveFilter("target")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeFilter === "target"
                  ? "bg-amber-brand text-neutral-950 font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              My Target Career
            </button>
          )}
          <span className="text-border-subtle">|</span>
          <button
            onClick={() => setActiveFilter("engineering")}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              activeFilter === "engineering"
                ? "bg-surface-interactive text-text-primary border border-border-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Engineering
          </button>
          <button
            onClick={() => setActiveFilter("arts_design")}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              activeFilter === "arts_design"
                ? "bg-surface-interactive text-text-primary border border-border-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Design
          </button>
          <button
            onClick={() => setActiveFilter("commerce_business")}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              activeFilter === "commerce_business"
                ? "bg-surface-interactive text-text-primary border border-border-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Commerce
          </button>
          <button
            onClick={() => setActiveFilter("law_public_service")}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              activeFilter === "law_public_service"
                ? "bg-surface-interactive text-text-primary border border-border-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Policy & Law
          </button>
          <button
            onClick={() => setActiveFilter("science_research")}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              activeFilter === "science_research"
                ? "bg-surface-interactive text-text-primary border border-border-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Science & Climate
          </button>
          <button
            onClick={() => setActiveFilter("healthcare")}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              activeFilter === "healthcare"
                ? "bg-surface-interactive text-text-primary border border-border-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Healthcare
          </button>
          <button
            onClick={() => setActiveFilter("media_communication")}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
              activeFilter === "media_communication"
                ? "bg-surface-interactive text-text-primary border border-border-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Media
          </button>
        </div>

        {/* Project Briefs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const submission = profile.projectSubmissions[project.id];
            const isEvaluated = submission?.status === "evaluated";

            return (
              <div
                key={project.id}
                className={`p-5 rounded-2xl bg-surface-card border transition-all flex flex-col justify-between space-y-4 ${
                  isEvaluated
                    ? "border-amber-500/30 bg-amber-950/10"
                    : "border-border-subtle hover:border-border-medium"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="neutral">{getDisciplineLabel(project.discipline)}</Badge>
                      {project.careerSlug === profile.targetCareerSlug && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
                          Target Path
                        </span>
                      )}
                    </div>
                    {renderStatusBadge(submission)}
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
                    <div className="flex items-center justify-between text-[11px] font-semibold text-text-primary">
                      <span>Key Milestones:</span>
                      <span className="text-text-muted font-normal">
                        ~{project.estimatedEffortHours} hrs • {project.difficulty}
                      </span>
                    </div>
                    <ul className="space-y-0.5 text-text-muted">
                      {project.milestones.slice(0, 2).map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-brand">•</span>
                          <span>{m.title}</span>
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

                  {/* Review Status pill if review exists */}
                  {submission && submission.review && (
                    <div
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        submission.review.isStale
                          ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                          : submission.review.overallDecision === "approved"
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                          : "bg-surface-secondary border-border-subtle text-text-muted"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold truncate">
                          {submission.review.isStale
                            ? "Review Superseded (Code modified)"
                            : `${submission.review.reviewerRole === "mentor" ? "Mentor" : "Peer"} Reviewed: ${submission.review.reviewerName} (Unauthenticated Attestation)`}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface-secondary border border-border-subtle shrink-0">
                        {submission.review.isStale ? "Stale" : submission.review.overallDecision === "approved" ? "Artifact Examined" : "Revision"}
                      </span>
                    </div>
                  )}

                  {/* Previous submission link if evaluated */}
                  {submission && submission.repoOrDemoUrl && (() => {
                    const safeUrl = sanitizeExternalUrl(submission.repoOrDemoUrl);
                    return (
                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        {safeUrl ? (
                          <a
                            href={safeUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-amber-brand hover:underline flex items-center gap-1 truncate max-w-[200px]"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span>{safeUrl}</span>
                          </a>
                        ) : (
                          <span className="text-text-muted truncate max-w-[200px] font-mono text-[10px]" title="Non-web URL">
                            {submission.repoOrDemoUrl}
                          </span>
                        )}
                        <span className="text-text-muted">
                          Score: {submission.overallScore}%
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center gap-1.5 w-full sm:w-1/2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReadmeTemplate(project)}
                      className="w-1/2 text-xs px-2"
                      title="Copy README Template"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      README
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                      className="w-1/2 text-xs px-2"
                      title="View Full Brief Details"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Brief
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-1/2">
                    {submission && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewModal(project)}
                        className={`text-xs px-2 ${
                          submission.review && !submission.review.isStale && submission.review.overallDecision === "approved"
                            ? "border-emerald-500/40 text-emerald-300"
                            : ""
                        }`}
                        title="Export, import, or conduct peer/mentor review"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-brand" />
                        {submission.review ? "Review" : "Review"}
                      </Button>
                    )}
                    <Button
                      variant={isEvaluated ? "outline" : "primary"}
                      size="sm"
                      onClick={() => openSubmissionModal(project)}
                      className="w-full text-xs"
                    >
                      <UploadCloud className="w-3.5 h-3.5 mr-1" />
                      {isEvaluated ? "Revise Submission" : submission ? "Update & Re-evaluate" : "Submit Deliverable"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Submit Deliverable & Evaluate */}
        {submittingProject && (
          <Modal
            isOpen={!!submittingProject}
            onClose={() => setSubmittingProject(null)}
            title={`Submit Deliverable: ${submittingProject.title}`}
            description="Submit your public repository or demo reference and self-attest completed deliverables. External artifacts are not inspected."
            maxWidth="xl"
          >
            <div className="space-y-4 text-xs">
              {/* Trust & Verification Boundary Notice */}
              <div className="p-3 rounded-xl bg-surface-secondary/90 border border-border-subtle space-y-1 text-[11px] text-text-muted">
                <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-brand" />
                  <span>Verification Boundary Notice</span>
                </div>
                <p>
                  Aaroh validates your link reference syntax and evaluates your self-reflection against the brief rubric. External repository files or deployed applications are <strong>not inspected, fetched, or executed</strong>. Evaluated submissions log skills as <strong>Student-Attested</strong>.
                </p>
              </div>

              {/* Existing submission status if revising */}
              {profile.projectSubmissions[submittingProject.id] && (
                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-text-primary block">Previous Evaluation:</span>
                    <p className="text-text-muted">
                      {profile.projectSubmissions[submittingProject.id].feedback}
                    </p>
                  </div>
                  {renderStatusBadge(profile.projectSubmissions[submittingProject.id])}
                </div>
              )}

              {/* URL Input */}
              <div className="space-y-1">
                <label className="block font-bold text-text-primary">
                  1. Public Repository or Live Demo URL <span className="text-amber-brand">*</span>
                </label>
                <input
                  type="url"
                  value={repoOrDemoUrl}
                  onChange={(e) => setRepoOrDemoUrl(e.target.value)}
                  placeholder="https://github.com/username/project or https://demo.vercel.app"
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand font-mono"
                />
                <p className="text-[11px] text-text-muted">
                  Must be an accessible HTTP/HTTPS link (GitHub, GitLab, deployed web app, or document). Localhost and private IPs are rejected.
                </p>
              </div>

              {/* Deliverables Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-text-primary">
                    2. Deliverables Checklist ({checkedDeliverableIds.length} of {(submittingProject.deliverables || []).length} claimed) <span className="text-amber-brand">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSelectAllDeliverables(submittingProject)}
                    className="text-[11px] text-amber-brand hover:underline font-medium"
                  >
                    {checkedDeliverableIds.length === (submittingProject.deliverables || []).length
                      ? "Uncheck All"
                      : "Check All"}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-2 max-h-[180px] overflow-y-auto">
                  {(submittingProject.deliverables || []).map((deliv) => {
                    const isChecked = checkedDeliverableIds.includes(deliv.id);
                    return (
                      <label
                        key={deliv.id}
                        className="flex items-start gap-2.5 cursor-pointer text-text-primary hover:text-amber-brand transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleDeliverable(deliv.id)}
                          className="mt-0.5 rounded border-border-medium text-amber-brand focus:ring-amber-brand"
                        />
                        <span className={`leading-tight ${isChecked ? "font-semibold" : "text-text-muted"}`}>
                          {deliv.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Architecture & Trade-offs Reflection */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-text-primary">
                    3. Technical Reflection & Architecture Rationale <span className="text-amber-brand">*</span>
                  </label>
                  <span className="text-[10px] text-text-muted">
                    {reflection.trim().split(/\s+/).filter(Boolean).length} words (min 15 recommended)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Explain your technical decisions, concurrency/validation trade-offs, and lessons learned while completing this deliverable..."
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                />
              </div>

              {/* Validation Error banner if any */}
              {submissionError && (
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start gap-2 text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-tight">{submissionError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSubmittingProject(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSubmitDeliverable}>
                  <UploadCloud className="w-3.5 h-3.5 mr-1" />
                  Submit for Evaluation
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal: Evaluation Result */}
        {evaluationResult && (
          <Modal
            isOpen={isResultModalOpen}
            onClose={() => setIsResultModalOpen(false)}
            title="Project Rubric Evaluation"
            description={`Evaluation for ${evaluationResult.projectSlug}`}
            maxWidth="xl"
          >
            <div className="space-y-4 text-xs">
              {/* Overall Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  evaluationResult.status === "evaluated"
                    ? "bg-amber-950/20 border-amber-500/40 text-amber-300"
                    : evaluationResult.status === "needs_improvement"
                    ? "bg-amber-950/20 border-amber-500/40 text-amber-300"
                    : "bg-surface-secondary border-border-medium text-text-primary"
                }`}
              >
                <div>
                  <span className="font-bold text-sm block">
                    {evaluationResult.status === "evaluated"
                      ? "Submission Evaluated (Student-Attested)"
                      : evaluationResult.status === "needs_improvement"
                      ? "Submission Needs Revision"
                      : evaluationResult.status === "evaluation_incomplete"
                      ? "Evaluation Incomplete"
                      : "Submission Rejected"}
                  </span>
                  <p className="text-text-muted mt-0.5 leading-relaxed">{evaluationResult.feedback}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-2xl font-black font-display block">
                    {evaluationResult.overallScore}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-text-muted">
                    Completeness Score
                  </span>
                </div>
              </div>

              {/* Evaluation Basis & Boundary Disclosure */}
              <div className="p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle text-[11px] text-text-muted space-y-1">
                <span className="font-semibold text-text-primary block">Evaluation Basis & Boundaries:</span>
                <p>{evaluationResult.verificationLimitationNotice}</p>
              </div>

              {/* Upgraded Skills Notification */}
              {evaluationResult.upgradedSkillIds.length > 0 && (
                <div className="p-3.5 rounded-xl bg-surface-secondary border border-amber-500/30 space-y-2">
                  <span className="font-bold text-amber-brand flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-brand" />
                    Skills Updated to Student-Attested in Your Skill Matrix:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluationResult.upgradedSkillIds.map((skillId) => (
                      <span
                        key={skillId}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold"
                      >
                        {SKILLS_CATALOG[skillId]?.name || skillId}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-text-muted">
                    External artifacts remain uninspected. Complete Milestone 4 (Peer & Mentor Verification) to elevate skills to Verified.
                  </p>
                </div>
              )}

              {/* Criteria Breakdown */}
              <div className="space-y-2">
                <span className="font-bold text-text-primary block">
                  Criterion-by-Criterion Rubric Breakdown:
                </span>
                <div className="space-y-2">
                  {evaluationResult.criteriaScores.map((c) => (
                    <div
                      key={c.criterionId}
                      className="p-3 rounded-lg bg-surface-card border border-border-subtle space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary">{c.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            c.passed
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {c.score}% • {c.passed ? "Passed" : "Below Threshold"}
                        </span>
                      </div>
                      <p className="text-text-muted leading-relaxed">{c.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Next Steps */}
              {evaluationResult.actionableNextSteps.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-text-primary block">Actionable Next Steps:</span>
                  <ul className="space-y-1 text-text-muted pl-2">
                    {evaluationResult.actionableNextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-brand">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modal footer */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
                <Link href="/skills">
                  <Button variant="outline" size="sm">
                    View in Skill Matrix →
                  </Button>
                </Link>
                <Button variant="primary" size="sm" onClick={() => setIsResultModalOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </Modal>
        )}

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
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const proj = selectedProject;
                    setSelectedProject(null);
                    openSubmissionModal(proj);
                  }}
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1" />
                  Submit Deliverable
                </Button>
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

        {/* Modal: Peer & Mentor Review Hub */}
        {reviewingProject && profile.projectSubmissions[reviewingProject.id] && (
          <Modal
            isOpen={!!reviewingProject}
            onClose={() => setReviewingProject(null)}
            title={`Review Hub: ${reviewingProject.title}`}
            description="Milestone 4: Peer & Mentor Evidence Verification. Local-first artifact examination."
            maxWidth="xl"
          >
            <div className="space-y-4 text-xs">
              {/* Trust & Boundary Disclosure Notice */}
              <div className="p-3 rounded-xl bg-surface-secondary/80 border border-border-subtle space-y-1 text-[11px] text-text-muted">
                <div className="flex items-center gap-1.5 font-bold text-text-primary">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-brand" />
                  <span>Verification Boundary & Trust Disclosure</span>
                </div>
                <p>
                  Peer and mentor reviews in Aaroh examine actual code repositories and live demonstrations against the brief rubric. In this local-first architecture, reviewer identities are self-reported. Verified reviews advance skills to <strong>Demonstrated (Artifact Examined)</strong> in your Skill Matrix, but cannot claim institutional PKI certification.
                </p>
              </div>

              {/* Sub-Tabs: Export / Import / Conduct */}
              <div className="flex items-center gap-1.5 border-b border-border-subtle pb-2">
                <button
                  onClick={() => { setReviewTab("export"); setImportResult(null); }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    reviewTab === "export"
                      ? "bg-amber-brand text-neutral-950 font-bold"
                      : "text-text-muted hover:text-text-primary bg-surface-secondary"
                  }`}
                >
                  1. Export Review Packet
                </button>
                <button
                  onClick={() => { setReviewTab("import"); setImportResult(null); }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    reviewTab === "import"
                      ? "bg-amber-brand text-neutral-950 font-bold"
                      : "text-text-muted hover:text-text-primary bg-surface-secondary"
                  }`}
                >
                  2. Import Review Feedback
                </button>
                <button
                  onClick={() => { setReviewTab("conduct"); setImportResult(null); }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    reviewTab === "conduct"
                      ? "bg-amber-brand text-neutral-950 font-bold"
                      : "text-text-muted hover:text-text-primary bg-surface-secondary"
                  }`}
                >
                  3. Live Review Form
                </button>
              </div>

              {/* TAB 1: EXPORT */}
              {reviewTab === "export" && (
                <div className="space-y-3">
                  <p className="text-text-muted leading-relaxed">
                    Export your portable review packet. Give this JSON to a peer student, club lead, or industry mentor. It encapsulates your submission reference link, attested checklist, reflection, and the rubric criteria they must inspect.
                  </p>

                  <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-between font-mono text-[11px]">
                    <span className="text-text-muted">Submission Fingerprint:</span>
                    <span className="font-bold text-amber-brand">
                      {profile.projectSubmissions[reviewingProject.id].submissionFingerprint || "Generating..."}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCopyReviewPacket(reviewingProject)}
                      className="text-xs"
                    >
                      {copiedReviewPacket ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      <span>{copiedReviewPacket ? "Copied Packet to Clipboard!" : "Copy Review Packet JSON"}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReviewPacket(reviewingProject)}
                      className="text-xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      <span>Download .json</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 2: IMPORT */}
              {reviewTab === "import" && (
                <div className="space-y-3">
                  <p className="text-text-muted leading-relaxed">
                    Paste the completed review JSON from your reviewer. Aaroh validates the packet schema and verifies that the review is bound to your current submission fingerprint.
                  </p>

                  <textarea
                    rows={6}
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder="Paste review JSON packet here..."
                    className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium font-mono text-[11px] text-text-primary focus:outline-none focus:border-amber-brand"
                  />

                  {importResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        importResult.success && !importResult.isStale
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                          : importResult.isStale
                          ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                          : "bg-red-950/20 border-red-500/30 text-red-300"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        {importResult.success && !importResult.isStale ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                        <span>{importResult.message}</span>
                      </div>
                      {importResult.promotedSkills.length > 0 && (
                        <p className="text-[11px] mt-1 text-emerald-400">
                          Elevated skills: {importResult.promotedSkills.join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleImportReviewJson}
                      disabled={!importJsonText.trim()}
                      className="text-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      Validate & Import Review
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 3: CONDUCT LIVE REVIEW FORM */}
              {reviewTab === "conduct" && (
                <div className="space-y-3">
                  <p className="text-text-muted leading-relaxed">
                    Conducting an in-person, lab, or screen-share review? The peer or mentor can complete this evaluation checklist directly on this device.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-text-primary mb-1">
                        Reviewer Name / Handle <span className="text-amber-brand">*</span>
                      </label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="e.g. Priya Sharma or Dr. Rao"
                        className="w-full p-2 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-text-primary mb-1">Reviewer Role</label>
                      <select
                        value={reviewerRole}
                        onChange={(e) => setReviewerRole(e.target.value as any)}
                        className="w-full p-2 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                      >
                        <option value="peer">Peer Student / Co-Learner</option>
                        <option value="mentor">Senior / Industry Mentor</option>
                        <option value="community">Open-Source Community Evaluator</option>
                      </select>
                    </div>
                  </div>

                  {/* Artifact Inspection Attestation */}
                  <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="crit-artifact-inspected"
                      checked={artifactExamined}
                      onChange={(e) => setArtifactExamined(e.target.checked)}
                      className="mt-0.5 accent-amber-brand rounded"
                    />
                    <label htmlFor="crit-artifact-inspected" className="text-[11px] text-text-primary font-medium cursor-pointer">
                      I attest that I have directly inspected the submitted repository code, commits, or running live demonstration against the project brief rubric.
                    </label>
                  </div>

                  {/* Rubric Criteria Checklist */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-text-primary block">Rubric Criteria Evaluation:</span>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {(reviewingProject.rubricCriteria || []).map((crit) => {
                        const isChecked = conductPassedCritIds.includes(crit.id);
                        return (
                          <div
                            key={crit.id}
                            onClick={() => {
                              setConductPassedCritIds((prev) =>
                                prev.includes(crit.id) ? prev.filter((id) => id !== crit.id) : [...prev, crit.id]
                              );
                            }}
                            className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                              isChecked
                                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                                : "bg-surface-secondary border-border-subtle text-text-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="accent-emerald-brand rounded pointer-events-none"
                              />
                              <div>
                                <span className="font-semibold block text-text-primary">{crit.title}</span>
                                <span className="text-[10px] text-text-muted">{crit.description}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-card">
                              {isChecked ? "Pass" : "Revise"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Overall Decision & Feedback */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-text-primary mb-1">Overall Outcome</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOverallDecision("approved")}
                          className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                            overallDecision === "approved"
                              ? "bg-emerald-brand text-neutral-950 border-emerald-brand"
                              : "bg-surface-secondary text-text-muted border-border-subtle"
                          }`}
                        >
                          Approve Evidence
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverallDecision("changes_requested")}
                          className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                            overallDecision === "changes_requested"
                              ? "bg-amber-brand text-neutral-950 border-amber-brand"
                              : "bg-surface-secondary text-text-muted border-border-subtle"
                          }`}
                        >
                          Request Changes
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-text-primary mb-1">Reviewer Feedback Notes</label>
                      <input
                        type="text"
                        value={overallFeedback}
                        onChange={(e) => setOverallFeedback(e.target.value)}
                        placeholder="Actionable notes on code quality or architecture..."
                        className="w-full p-2 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                      />
                    </div>
                  </div>

                  {importResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs ${
                        importResult.success && !importResult.isStale
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                          : "bg-red-950/20 border-red-500/30 text-red-300"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        {importResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                        <span>{importResult.message}</span>
                      </div>
                      {importResult.promotedSkills.length > 0 && (
                        <p className="text-[11px] mt-1 text-emerald-400">
                          Elevated skills: {importResult.promotedSkills.join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleConductReviewSubmit}
                      className="text-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      Record Verified Review Decision
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border-subtle text-right">
                <Button variant="outline" size="sm" onClick={() => setReviewingProject(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
