"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Upload,
  AlertCircle,
  HelpCircle,
  FolderGit2,
  FileCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAarohStore } from "@/lib/store";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { RoadmapTask } from "@/lib/types";

export default function AdaptiveRoadmapPage() {
  const { profile, roadmap, updateProfile, toggleExamMode, updateTaskStatus } = useAarohStore();

  const targetCareer = CAREERS_CATALOG.find((c) => c.slug === profile.targetCareerSlug) || CAREERS_CATALOG[2];

  // Task Evidence Submission Modal
  const [selectedTask, setSelectedTask] = useState<RoadmapTask | null>(null);
  const [evidenceUrlOrText, setEvidenceUrlOrText] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");

  const openTaskModal = (task: RoadmapTask) => {
    setSelectedTask(task);
    setEvidenceUrlOrText(task.submittedEvidence?.urlOrText || "");
    setEvidenceNotes(task.submittedEvidence?.notes || "");
  };

  const handleCompleteTask = () => {
    if (!selectedTask) return;
    updateTaskStatus(selectedTask.id, "completed", {
      type: selectedTask.requiredEvidenceType,
      urlOrText: evidenceUrlOrText.trim() || "Completed and verified",
      notes: evidenceNotes.trim() || undefined,
      submittedAt: new Date().toISOString(),
    });
    setSelectedTask(null);
  };

  const handleDeferTask = (taskId: string) => {
    updateTaskStatus(taskId, "deferred");
  };

  const tasks = roadmap?.tasks || [];
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border-subtle gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="amber">Adaptive Schedule</Badge>
              <span className="text-text-muted">•</span>
              <span className="text-xs text-text-muted">Target: {targetCareer.title}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary tracking-tight">
              Adaptive Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
              A dynamic, evidence-grounded action plan. No artificial urgency or broken streak penalties. You can adjust capacity or switch to exam mode anytime.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/projects">
              <Button variant="outline" size="sm">
                <FolderGit2 className="w-4 h-4 mr-1.5" />
                <span>Project Studio</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Schedule Controls & Exam Mode Banner */}
        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Weekly Learning Capacity
              </span>
              <span className="text-sm font-bold text-amber-brand">
                {profile.isExamMode ? "3 hours / week (Exam Mode Throttled)" : `${profile.weeklyCapacityHours} hours / week`}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              disabled={profile.isExamMode}
              value={profile.weeklyCapacityHours}
              onChange={(e) => updateProfile({ weeklyCapacityHours: Number(e.target.value) })}
              className="w-full accent-amber-brand cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-[11px] text-text-muted">
              <span>Light Maintenance (2-4 hrs)</span>
              <span>Standard (6-10 hrs)</span>
              <span>Deep Focus (12-20 hrs)</span>
            </div>
          </div>

          <div className="md:col-span-4 p-4 rounded-xl bg-surface-secondary/80 border border-border-subtle flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                <Calendar className="w-3.5 h-3.5 text-amber-brand" />
                <span>College Exam Mode</span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                {profile.isExamMode
                  ? "Light plan active. Defers lower-priority tasks."
                  : "Exam approaching? Switch to light plan."}
              </p>
            </div>
            <button
              onClick={toggleExamMode}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all shrink-0 ${
                profile.isExamMode
                  ? "bg-amber-brand text-neutral-950 border-amber-brand shadow-sm"
                  : "bg-surface-interactive text-text-muted hover:text-text-primary border-border-subtle"
              }`}
            >
              {profile.isExamMode ? "Exam Mode ON" : "Turn ON"}
            </button>
          </div>
        </div>

        {/* Task Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold font-display text-text-primary">
              Milestone Sequence ({completedCount} of {tasks.length} Completed)
            </h2>
            <span className="text-xs text-text-muted">
              Tasks unlock sequentially as evidence is verified
            </span>
          </div>

          <div className="space-y-4">
            {tasks.map((task, idx) => {
              const isLocked = task.status === "locked";
              const isCompleted = task.status === "completed";
              const isAvailable = task.status === "available" || task.status === "in_progress";

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCompleted
                      ? "bg-surface-secondary/40 border-emerald-500/30"
                      : isAvailable
                      ? "bg-surface-card border-amber-brand/50 shadow-amber-subtle"
                      : "bg-surface-secondary/20 border-border-subtle opacity-75"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-3 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black font-display text-amber-brand">
                          Milestone {idx + 1}
                        </span>
                        <Badge
                          variant={
                            isCompleted ? "emerald" : isAvailable ? "amber" : "neutral"
                          }
                        >
                          {task.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          ~{task.estimatedHours} hrs
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {task.category}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-text-primary font-display flex items-center gap-2">
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-brand shrink-0" />}
                          {isLocked && <Lock className="w-4 h-4 text-text-muted shrink-0" />}
                          <span>{task.title}</span>
                        </h3>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          <strong>Purpose:</strong> {task.purpose}
                        </p>
                      </div>

                      {/* Why it matters */}
                      <p className="text-xs text-amber-brand/90 font-medium leading-relaxed">
                        Why it matters: {task.whyItMatters}
                      </p>

                      {/* Instructions */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-semibold uppercase text-text-muted block">
                          Action Instructions:
                        </span>
                        <ul className="space-y-1 text-xs text-text-muted">
                          {task.instructions.map((inst, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-brand mt-0.5">•</span>
                              <span>{inst}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Submitted Evidence preview if completed */}
                      {task.submittedEvidence && (
                        <div className="p-3 rounded-lg bg-surface-card border border-emerald-500/30 text-xs text-emerald-400 space-y-0.5">
                          <p className="font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Submitted Proof of Work:</span>
                          </p>
                          <p className="text-text-primary truncate font-mono text-[11px]">
                            {task.submittedEvidence.urlOrText}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Task Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-0">
                      {isAvailable && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openTaskModal(task)}
                          className="w-full sm:w-auto"
                        >
                          <FileCheck className="w-4 h-4 mr-1.5" />
                          <span>Submit Evidence</span>
                        </Button>
                      )}

                      {isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTaskModal(task)}
                          className="w-full sm:w-auto"
                        >
                          Edit Evidence
                        </Button>
                      )}

                      {isAvailable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeferTask(task.id)}
                          className="text-xs"
                        >
                          Defer Task
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal: Task Detail & Evidence Submission */}
        {selectedTask && (
          <Modal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            title={`Submit Proof of Work: ${selectedTask.title}`}
            description="Submit an authentic artifact link (GitHub repository, live preview, document, or reflection). We do not accept fabricated claims."
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-1">
                <span className="font-semibold text-text-primary">Completion Criteria:</span>
                <ul className="space-y-1 text-text-muted">
                  {selectedTask.completionCriteria.map((crit, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-brand shrink-0 mt-0.5" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Deliverable Artifact URL or Text:
                </label>
                <input
                  type="text"
                  value={evidenceUrlOrText}
                  onChange={(e) => setEvidenceUrlOrText(e.target.value)}
                  placeholder="https://github.com/your-username/project or brief statement..."
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Notes & Reflection (What trade-offs did you make?):
                </label>
                <textarea
                  rows={3}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="Explain your approach, choices, and tests performed..."
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTask(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCompleteTask}
                >
                  Confirm & Unlock Next Step
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
