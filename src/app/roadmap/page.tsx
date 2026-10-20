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
  FolderGit2,
  FileCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAarohStore } from "@/lib/store";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { RoadmapTask } from "@/lib/types";

export default function AdaptiveRoadmapPage() {
  const { profile, roadmap, updateProfile, toggleExamMode, updateTaskStatus } = useAarohStore();

  const targetCareer = CAREERS_CATALOG.find((c) => c.slug === profile.targetCareerSlug) || CAREERS_CATALOG[2];

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

  const tasks = roadmap?.tasks || [];
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="amber">Step-by-Step Plan</Badge>
              <span className="text-text-muted">•</span>
              <span className="text-xs text-text-muted">Target: {targetCareer.title}</span>
            </div>
            <h1 className="text-2xl font-black font-display text-text-primary tracking-tight">
              Adaptive Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5 leading-relaxed">
              Sequenced milestones calibrated to your weekly capacity. No artificial urgency or broken streaks.
            </p>
          </div>

          <Link href="/projects">
            <Button variant="outline" size="sm" className="text-xs shrink-0">
              <FolderGit2 className="w-3.5 h-3.5 mr-1" />
              <span>Project Studio</span>
            </Button>
          </Link>
        </div>

        {/* Schedule & College Exam Mode Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary">
                Weekly Learning Capacity:
              </span>
              <span className="text-xs font-bold text-amber-brand font-display">
                {profile.isExamMode ? "3 hours / week (Exam Mode Throttled)" : `${profile.weeklyCapacityHours} hours / week`}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              disabled={profile.isExamMode}
              value={profile.weeklyCapacityHours}
              onChange={(e) => updateProfile({ weeklyCapacityHours: Number(e.target.value) })}
              className="w-full accent-amber-brand cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>Light (2-4 hrs)</span>
              <span>Balanced (6-8 hrs)</span>
              <span>Deep Focus (10-16 hrs)</span>
            </div>
          </div>

          {/* Exam Mode Toggle */}
          <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-between gap-3 shrink-0">
            <div>
              <span className="text-xs font-bold text-text-primary flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-brand" />
                <span>College Exam Mode</span>
              </span>
              <span className="text-[10px] text-text-muted block mt-0.5">
                {profile.isExamMode ? "Light plan active (3h/wk)" : "Midterms coming? Switch to light plan"}
              </span>
            </div>
            <button
              onClick={toggleExamMode}
              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors shrink-0 ${
                profile.isExamMode
                  ? "bg-amber-brand text-neutral-950 border-amber-brand font-bold"
                  : "bg-surface-interactive text-text-muted hover:text-text-primary border-border-subtle"
              }`}
            >
              {profile.isExamMode ? "Exam Mode ON" : "Turn ON"}
            </button>
          </div>
        </div>

        {/* Milestones Sequence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold text-text-primary">
              Progress: {completedCount} of {tasks.length} Milestones Completed
            </span>
            <span>Tasks unlock as practical evidence is verified</span>
          </div>

          <div className="space-y-3">
            {tasks.map((task, idx) => {
              const isLocked = task.status === "locked";
              const isCompleted = task.status === "completed";
              const isAvailable = task.status === "available" || task.status === "in_progress";

              return (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isCompleted
                      ? "bg-surface-secondary/50 border-emerald-500/30"
                      : isAvailable
                      ? "bg-surface-card border-amber-brand/50 shadow-sm"
                      : "bg-surface-secondary/20 border-border-subtle opacity-75"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-display text-amber-brand">
                          Milestone {idx + 1}
                        </span>
                        <Badge variant={isCompleted ? "emerald" : isAvailable ? "amber" : "neutral"}>
                          {task.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-brand" />
                          ~{task.estimatedHours} hrs
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-text-primary font-display flex items-center gap-2">
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-brand shrink-0" />}
                        {isLocked && <Lock className="w-4 h-4 text-text-muted shrink-0" />}
                        <span>{task.title}</span>
                      </h3>

                      <p className="text-xs text-text-muted leading-relaxed">
                        <strong>Purpose:</strong> {task.purpose}
                      </p>

                      <p className="text-xs text-amber-brand/90 font-medium">
                        Why it matters: {task.whyItMatters}
                      </p>

                      {/* Instructions */}
                      <ul className="space-y-1 text-xs text-text-muted pt-1">
                        {task.instructions.map((inst, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-brand">•</span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Submitted Evidence */}
                      {task.submittedEvidence && (
                        <div className="p-2.5 rounded-lg bg-surface-card border border-border-medium text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-amber-brand block">
                              Evidence Logged ({task.id === "task-3" ? "Student-Attested" : task.id === "task-4" ? "Demonstrated • Artifact Examined (Unauthenticated Reviewer)" : "Verified"}):
                            </span>
                          </div>
                          <p className="text-text-primary font-mono text-[11px] truncate">
                            {task.submittedEvidence.urlOrText}
                          </p>
                          {task.submittedEvidence.notes && (
                            <p className="text-text-muted text-[10px]">
                              {task.submittedEvidence.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 self-start sm:self-center">
                      {isAvailable && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openTaskModal(task)}
                          className="font-bold text-xs"
                        >
                          <FileCheck className="w-3.5 h-3.5 mr-1" />
                          <span>Submit Proof</span>
                        </Button>
                      )}

                      {isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTaskModal(task)}
                          className="text-xs"
                        >
                          Edit Proof
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal: Task Evidence Submission */}
        {selectedTask && (
          <Modal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            title={`Submit Proof: ${selectedTask.title}`}
            description="Provide a link to your repository, working demo, or written reflection"
            maxWidth="md"
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle space-y-1">
                <span className="font-semibold text-text-primary">Completion Checklist:</span>
                <ul className="space-y-0.5 text-text-muted">
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
                  Deliverable URL (GitHub repo, live link, or summary text):
                </label>
                <input
                  type="text"
                  value={evidenceUrlOrText}
                  onChange={(e) => setEvidenceUrlOrText(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs font-mono focus:outline-none focus:border-amber-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Reflection Note (What was the hardest trade-off?):
                </label>
                <textarea
                  rows={2}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="Notes on what you learned or decisions made..."
                  className="w-full p-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary text-xs focus:outline-none focus:border-amber-brand"
                />
              </div>

              <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleCompleteTask}>
                  Confirm & Unlock Next Milestone
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
