"use client";

import React, { useState, useRef } from "react";
import {
  Download,
  Upload,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Lock,
  Unlock,
  Trash2,
} from "lucide-react";
import { useAarohStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  createStudentBackupSnapshot,
  generateBackupFilename,
  generateEncryptedBackupFilename,
  validateAndParseBackup,
  encryptStudentBackup,
  decryptStudentBackup,
  AarohBackupPacket,
  AarohEncryptedBackupPacket,
  BackupValidationResult,
  MAX_BACKUP_SIZE_BYTES,
} from "@/lib/backup-system";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { getDisciplineLabel } from "@/lib/utils";

export function DataPortabilityCard() {
  const { profile, roadmap, restoreBackup, resetProfile } = useAarohStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isDecryptModalOpen, setIsDecryptModalOpen] = useState(false);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);

  // State for password operations
  const [exportPassword, setExportPassword] = useState("");
  const [decryptPassword, setDecryptPassword] = useState("");
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [pendingEncryptedPacket, setPendingEncryptedPacket] = useState<AarohEncryptedBackupPacket | null>(null);

  // State for pending restore validation
  const [pendingValidation, setPendingValidation] = useState<BackupValidationResult | null>(null);

  // 1. Export Workflows
  const handlePlaintextExport = () => {
    try {
      const snapshot = createStudentBackupSnapshot(profile, roadmap);
      const jsonString = JSON.stringify(snapshot, null, 2);
      const filename = generateBackupFilename(profile);

      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExportModalOpen(false);
      setStatusMessage({
        type: "success",
        text: `Plaintext backup exported: "${filename}". Store this file in a safe personal folder.`,
      });
    } catch (err) {
      console.error("Export error:", err);
      setStatusMessage({
        type: "error",
        text: "Failed to generate plaintext backup. Please try again.",
      });
    }
  };

  const handleEncryptedExport = async () => {
    if (!exportPassword || exportPassword.length < 6) {
      setStatusMessage({
        type: "error",
        text: "Encryption password must be at least 6 characters long.",
      });
      return;
    }

    try {
      const snapshot = createStudentBackupSnapshot(profile, roadmap);
      const encryptedPacket = await encryptStudentBackup(snapshot, exportPassword);
      const jsonString = JSON.stringify(encryptedPacket, null, 2);
      const filename = generateEncryptedBackupFilename(profile);

      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExportModalOpen(false);
      setExportPassword("");
      setStatusMessage({
        type: "success",
        text: `Password-encrypted backup (AES-256-GCM) exported: "${filename}". Keep your password safe!`,
      });
    } catch (err: any) {
      console.error("Encrypted export error:", err);
      setStatusMessage({
        type: "error",
        text: err?.message || "Failed to encrypt backup. Please check your browser Web Crypto support.",
      });
    }
  };

  // 2. File Selection & Validation Workflow
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    if (file.size > MAX_BACKUP_SIZE_BYTES) {
      setStatusMessage({
        type: "error",
        text: `Selected file exceeds the 2MB safety limit (${(file.size / 1024 / 1024).toFixed(2)}MB).`,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== "string") {
        setStatusMessage({
          type: "error",
          text: "Unable to read backup file contents as text.",
        });
        return;
      }

      const result = validateAndParseBackup(content, profile);

      // Handle Password-Protected Backup
      if (result.isEncrypted) {
        try {
          const parsed = JSON.parse(content) as AarohEncryptedBackupPacket;
          setPendingEncryptedPacket(parsed);
          setDecryptPassword("");
          setDecryptError(null);
          setIsDecryptModalOpen(true);
          return;
        } catch {
          setStatusMessage({
            type: "error",
            text: "Corrupted encrypted backup file structure.",
          });
          return;
        }
      }

      if (!result.isValid || !result.sanitizedBackup) {
        setStatusMessage({
          type: "error",
          text: result.error || "The backup file is invalid or corrupted.",
        });
        return;
      }

      // Valid plaintext backup -> open confirmation preview modal
      setPendingValidation(result);
      setIsRestoreModalOpen(true);
      setStatusMessage(null);
    };

    reader.onerror = () => {
      setStatusMessage({
        type: "error",
        text: "Error reading the selected backup file.",
      });
    };

    reader.readAsText(file);
  };

  // 3. Decrypt Encrypted Backup
  const handleDecryptAndPreview = async () => {
    if (!pendingEncryptedPacket || !decryptPassword) {
      setDecryptError("Please enter your backup password.");
      return;
    }

    try {
      setDecryptError(null);
      const decryptedSnapshot = await decryptStudentBackup(pendingEncryptedPacket, decryptPassword);
      const validationResult = validateAndParseBackup(decryptedSnapshot, profile);

      if (!validationResult.isValid || !validationResult.sanitizedBackup) {
        setDecryptError(validationResult.error || "Decrypted backup failed integrity validation.");
        return;
      }

      // Successfully decrypted and validated!
      setIsDecryptModalOpen(false);
      setPendingEncryptedPacket(null);
      setDecryptPassword("");
      setPendingValidation(validationResult);
      setIsRestoreModalOpen(true);
    } catch (err: any) {
      setDecryptError(err?.message || "Incorrect password or corrupted backup file.");
    }
  };

  // 4. Confirm Restore
  const handleConfirmRestore = () => {
    if (!pendingValidation?.sanitizedBackup) return;

    const res = restoreBackup(pendingValidation.sanitizedBackup);
    setIsRestoreModalOpen(false);
    setPendingValidation(null);

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: res.message,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.message,
      });
    }
  };

  // 5. Cancel Restore
  const handleCancelRestore = () => {
    setIsRestoreModalOpen(false);
    setPendingValidation(null);
    setStatusMessage({
      type: "info",
      text: "Restore cancelled. Your current progress remains completely unchanged.",
    });
  };

  // 6. Wipe Local Data (Shared PC protection)
  const handleConfirmWipe = () => {
    resetProfile();
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("aaroh_mentor_offline_only");
        localStorage.removeItem("aaroh_cloud_ai_consent");
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn("Storage wipe notice:", e);
    }
    setIsWipeModalOpen(false);
    setStatusMessage({
      type: "info",
      text: "All local student data, progress, and chat history have been wiped from this browser.",
    });
  };

  const previewSummary = pendingValidation?.summary;
  const targetCareerTitle = previewSummary?.targetCareer
    ? CAREERS_CATALOG.find((c) => c.slug === previewSummary.targetCareer)?.title || previewSummary.targetCareer
    : "Not Selected";

  return (
    <>
      <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-text-primary">
                Student Data Portability & Backup
              </h3>
              <p className="text-xs text-text-muted">
                Export your progress, restore a backup, or safely clear local storage on shared computers.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              className="text-xs font-semibold"
              title="Export progress (encrypted or plaintext)"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Export Backup</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold"
              title="Restore progress from an Aaroh backup file"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              <span>Restore Data</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWipeModalOpen(true)}
              className="text-xs font-semibold text-accent-rose hover:bg-accent-rose/10 hover:border-accent-rose/30"
              title="Wipe data from this shared browser"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Wipe Local Data</span>
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
              aria-label="Upload Aaroh backup JSON file"
            />
          </div>
        </div>

        {/* Local Storage Architecture & Security Disclosure */}
        <div className="p-3.5 rounded-xl bg-surface-secondary/50 border border-border-subtle flex items-start gap-2.5 text-xs text-text-muted leading-relaxed">
          <Info className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>
              <strong className="text-text-primary">Local-First Storage Notice:</strong> Aaroh operates entirely inside your web browser. No student data, career reflections, or project submissions are stored on central cloud databases.
            </p>
            <p className="text-[11px]">
              If you clear browser data or switch devices, your progress will be reset unless you have exported a backup. For maximum privacy on shared or lab computers, choose the <strong>Password-Encrypted Backup</strong> option.
            </p>
          </div>
        </div>

        {/* Status Toast / Alert Banner */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-fade-in ${
              statusMessage.type === "success"
                ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald"
                : statusMessage.type === "error"
                ? "bg-accent-rose/10 border-accent-rose/30 text-accent-rose"
                : "bg-surface-secondary border-border-subtle text-text-muted"
            }`}
            role="status"
          >
            {statusMessage.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
            {statusMessage.type === "error" && <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            {statusMessage.type === "info" && <Info className="w-4 h-4 shrink-0 mt-0.5" />}
            <span className="flex-1">{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs opacity-70 hover:opacity-100"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* EXPORT OPTIONS MODAL */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Student Progress Backup"
        description="Select an export method. Encrypted export protects your career reflections and skill notes at rest."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-text-muted">
          {/* Option A: Encrypted (Recommended) */}
          <div className="p-4 rounded-xl border border-brand-primary/30 bg-surface-card space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-primary" />
              <span className="font-bold text-text-primary text-sm">
                Password-Encrypted Backup (Recommended)
              </span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Encrypts your complete profile using AES-256-GCM. Protects your data on shared college computers, shared flash drives, or cloud storage.
            </p>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-text-primary">
                Choose a Backup Password:
              </label>
              <input
                type="password"
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle bg-surface-secondary text-text-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleEncryptedExport}
              className="w-full font-semibold"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              <span>Download Encrypted Backup</span>
            </Button>
          </div>

          {/* Option B: Plaintext JSON */}
          <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-secondary/40 space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-text-muted" />
              <span className="font-bold text-text-primary">
                Unencrypted Plaintext JSON Export
              </span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Exports raw JSON. <span className="text-accent-rose font-medium">Privacy Notice:</span> Anyone with filesystem access to the downloaded file can view your reflections and notes in plain text.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlaintextExport}
              className="w-full text-xs font-medium"
            >
              <span>Download Plaintext Backup (.json)</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* UNLOCK ENCRYPTED BACKUP MODAL */}
      <Modal
        isOpen={isDecryptModalOpen}
        onClose={() => {
          setIsDecryptModalOpen(false);
          setPendingEncryptedPacket(null);
        }}
        title="Unlock Encrypted Backup"
        description="This backup file is encrypted with AES-256-GCM. Enter your password to inspect and restore it."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-text-muted">
          <div className="p-3 rounded-xl bg-surface-secondary/60 border border-border-subtle flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-primary shrink-0" />
            <span>Encrypted snapshot for: <strong>{pendingEncryptedPacket?.summary?.studentName || "Student Explorer"}</strong></span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-text-primary">
              Enter Backup Password:
            </label>
            <input
              type="password"
              value={decryptPassword}
              onChange={(e) => {
                setDecryptPassword(e.target.value);
                setDecryptError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDecryptAndPreview();
              }}
              placeholder="Enter password..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle bg-surface-secondary text-text-primary focus:outline-none focus:border-brand-primary"
              autoFocus
            />
          </div>

          {decryptError && (
            <div className="p-2.5 rounded-lg bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-[11px]">
              {decryptError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDecryptModalOpen(false);
                setPendingEncryptedPacket(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDecryptAndPreview}
              className="font-semibold"
            >
              <Unlock className="w-3.5 h-3.5 mr-1.5" />
              <span>Unlock & Inspect</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* WIPE LOCAL DATA CONFIRMATION MODAL */}
      <Modal
        isOpen={isWipeModalOpen}
        onClose={() => setIsWipeModalOpen(false)}
        title="Wipe Local Data from Browser?"
        description="Safely removes your student profile, roadmap, and chat history from this computer."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-text-muted">
          <div className="p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-accent-rose space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Warning: Unrecoverable Action</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If you have not exported a backup, all your skill evaluations, project submissions, and notes will be permanently lost.
            </p>
          </div>

          <p className="text-[11px]">
            Recommended when finishing a session on a shared college library computer or shared workstation.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWipeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmWipe}
              className="bg-accent-rose hover:bg-accent-rose/90 text-white border-accent-rose font-bold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Yes, Wipe Local Data</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* INTERACTIVE RESTORE PREVIEW MODAL */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={handleCancelRestore}
        title="Inspect Backup Before Restoring"
        description="Verify the student data in this backup file before applying it to your browser storage."
        maxWidth="xl"
      >
        {previewSummary && (
          <div className="space-y-5">
            {/* Student Overview Header Card */}
            <div className="p-4 rounded-xl bg-surface-secondary/70 border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold font-display text-text-primary">
                    {previewSummary.studentName}
                  </h4>
                  <p className="text-xs text-text-muted">
                    {getDisciplineLabel(previewSummary.discipline)} • Stage: {previewSummary.stage.replace(/_/g, " ")}
                  </p>
                </div>
                <Badge variant="primary">Target: {targetCareerTitle}</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-subtle text-center">
                <div className="p-2 rounded-lg bg-surface-card border border-border-subtle">
                  <span className="text-[10px] text-text-muted block">Completed Trials</span>
                  <span className="text-sm font-bold text-text-primary">
                    {previewSummary.completedTrialsCount}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-surface-card border border-border-subtle">
                  <span className="text-[10px] text-text-muted block">Project Submissions</span>
                  <span className="text-sm font-bold text-text-primary">
                    {previewSummary.projectSubmissionsCount}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-surface-card border border-border-subtle">
                  <span className="text-[10px] text-text-muted block">Peer/Mentor Reviews</span>
                  <span className="text-sm font-bold text-text-primary">
                    {previewSummary.projectReviewsCount}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-surface-card border border-border-subtle">
                  <span className="text-[10px] text-text-muted block">Roadmap Tasks Done</span>
                  <span className="text-sm font-bold text-text-primary">
                    {previewSummary.roadmapCompletedTasksCount}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted pt-1">
                <span>Skills Tracked: {previewSummary.totalSkillsTracked}</span>
                <span>Exam Mode: {previewSummary.examModeEnabled ? "Active" : "Standard"}</span>
                <span>Exported: {new Date(previewSummary.exportedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Evidence Integrity & Security Warnings */}
            {pendingValidation && pendingValidation.securityNotices.length > 0 && (
              <div className="p-3.5 rounded-xl bg-accent-amber/10 border border-accent-amber/30 text-xs text-accent-amber space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Evidence Integrity & Trust Adjustments</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11px] opacity-90">
                  {pendingValidation.securityNotices.map((notice, idx) => (
                    <li key={idx}>{notice}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Staleness Notices */}
            {pendingValidation && pendingValidation.stalenessNotices.length > 0 && (
              <div className="p-3.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-xs text-accent-cyan space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Staleness & Superseded Review Notices</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11px] opacity-90">
                  {pendingValidation.stalenessNotices.map((notice, idx) => (
                    <li key={idx}>{notice}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Destructive Replacement Warning */}
            <div className="p-3.5 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-xs text-accent-rose space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Destructive Local Replacement Warning</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Confirming this restore will <strong>completely replace</strong> your current in-browser profile, roadmap, and project submissions with the data in this backup file. Any un-exported changes made on this browser will be overwritten.
              </p>
            </div>

            {/* Explicit Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <Button
                variant="outline"
                size="md"
                onClick={handleCancelRestore}
                className="font-medium text-xs sm:text-sm"
              >
                <span>Cancel (Keep Current Data)</span>
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmRestore}
                className="font-bold text-xs sm:text-sm bg-accent-rose hover:bg-accent-rose/90 text-white border-accent-rose"
              >
                <Upload className="w-4 h-4 mr-1.5" />
                <span>Confirm & Replace Progress</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
