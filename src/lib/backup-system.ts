import {
  UserProfile,
  Roadmap,
  EducationalDiscipline,
  EducationStage,
  WorkStyle,
  EvidenceState,
  ProjectSubmissionRecord,
  ProjectReviewRecord,
  UserSkillEvidence,
  ReviewTrustLevel,
} from "./types";
import { computeSubmissionFingerprint, LOCAL_REVIEW_DISCLOSURE } from "./review-system";

export const BACKUP_FORMAT_ID = "aaroh_student_data_backup" as const;
export const BACKUP_SCHEMA_VERSION = "1.0" as const;
export const CURRENT_APP_VERSION = "1.0.3";
export const MAX_BACKUP_SIZE_BYTES = 2 * 1024 * 1024; // 2MB safety threshold

export const VALID_DISCIPLINES: readonly EducationalDiscipline[] = [
  "engineering",
  "commerce_business",
  "arts_design",
  "science_research",
  "healthcare",
  "law_public_service",
  "media_communication",
  "undecided",
] as const;

export const VALID_STAGES: readonly EducationStage[] = [
  "high_school",
  "first_second_year",
  "pre_final_year",
  "final_year",
  "recent_graduate",
  "career_changer",
] as const;

export const VALID_WORK_STYLES: readonly WorkStyle[] = [
  "analytical",
  "creative",
  "collaborative",
  "independent",
  "practical_hands_on",
  "strategic",
] as const;

export const VALID_EVIDENCE_STATES: readonly EvidenceState[] = [
  "not_assessed",
  "self_reported",
  "coursework",
  "student_attested",
  "practically_demonstrated",
  "independently_verified",
] as const;

export interface BackupPreviewSummary {
  studentName: string;
  stage: string;
  discipline: string;
  targetCareer?: string;
  totalSkillsTracked: number;
  completedTrialsCount: number;
  projectSubmissionsCount: number;
  projectReviewsCount: number;
  roadmapCompletedTasksCount: number;
  examModeEnabled: boolean;
  weeklyCapacityHours: number;
  exportedAt: string;
}

export interface AarohBackupPacket {
  formatId: typeof BACKUP_FORMAT_ID;
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  appVersion: string;
  exportedAt: string;
  profile: UserProfile;
  roadmap: Roadmap | null;
  summary: BackupPreviewSummary;
  securityNotice: string;
}

export interface BackupValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedBackup?: AarohBackupPacket;
  summary?: BackupPreviewSummary;
  securityNotices: string[];
  stalenessNotices: string[];
}

/**
 * Creates a clean, versioned, portable student data backup snapshot.
 * Excludes transient session storage (AI chat), DOM state, and environment secrets.
 */
export function createStudentBackupSnapshot(
  profile: UserProfile,
  roadmap: Roadmap | null
): AarohBackupPacket {
  const exportedAt = new Date().toISOString();

  // Calculate high-level summary metrics for display during restore preview
  const roadmapCompletedTasksCount = roadmap
    ? roadmap.tasks.filter((t) => t.status === "completed").length
    : 0;

  const projectReviewsCount = Object.keys(profile.projectReviews || {}).length;
  const projectSubmissionsCount = Object.keys(profile.projectSubmissions || {}).length;
  const completedTrialsCount = (profile.completedTrialIds || []).length;
  const totalSkillsTracked = Object.keys(profile.skillEvidence || {}).length;

  const summary: BackupPreviewSummary = {
    studentName: profile.name || "Student Explorer",
    stage: profile.stage || "first_second_year",
    discipline: profile.discipline || "undecided",
    targetCareer: profile.targetCareerSlug,
    totalSkillsTracked,
    completedTrialsCount,
    projectSubmissionsCount,
    projectReviewsCount,
    roadmapCompletedTasksCount,
    examModeEnabled: Boolean(profile.isExamMode),
    weeklyCapacityHours: profile.weeklyCapacityHours || 6,
    exportedAt,
  };

  // Strip any transient fields that may have leaked into in-memory profile
  const sanitizedProfile: UserProfile = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    stage: profile.stage,
    discipline: profile.discipline,
    customDisciplineText: profile.customDisciplineText,
    selectedWorkStyles: Array.isArray(profile.selectedWorkStyles)
      ? [...profile.selectedWorkStyles]
      : [],
    interests: Array.isArray(profile.interests) ? [...profile.interests] : [],
    weeklyCapacityHours: profile.weeklyCapacityHours,
    isExamMode: profile.isExamMode,
    targetCareerSlug: profile.targetCareerSlug,
    targetCareerHypotheses: Array.isArray(profile.targetCareerHypotheses)
      ? [...profile.targetCareerHypotheses]
      : [],
    skillEvidence: { ...(profile.skillEvidence || {}) },
    completedTrialIds: Array.isArray(profile.completedTrialIds)
      ? [...profile.completedTrialIds]
      : [],
    trialReflections: { ...(profile.trialReflections || {}) },
    projectSubmissions: { ...(profile.projectSubmissions || {}) },
    projectReviews: { ...(profile.projectReviews || {}) },
    savedCareerSlugs: Array.isArray(profile.savedCareerSlugs)
      ? [...profile.savedCareerSlugs]
      : [],
    hasCompletedOnboarding: profile.hasCompletedOnboarding,
    currentSituation: profile.currentSituation,
    actualExperience: profile.actualExperience,
    thingsToAvoid: profile.thingsToAvoid,
    goalsAndConstraints: profile.goalsAndConstraints,
    uncertainties: Array.isArray(profile.uncertainties)
      ? [...profile.uncertainties]
      : [],
    createdAt: profile.createdAt || exportedAt,
    updatedAt: profile.updatedAt || exportedAt,
  };

  const sanitizedRoadmap: Roadmap | null = roadmap
    ? {
        id: roadmap.id,
        careerSlug: roadmap.careerSlug,
        weeklyCapacityHours: roadmap.weeklyCapacityHours,
        isExamMode: roadmap.isExamMode,
        tasks: Array.isArray(roadmap.tasks)
          ? roadmap.tasks.map((task) => ({ ...task }))
          : [],
        generatedAt: roadmap.generatedAt || exportedAt,
        lastAdjustedAt: roadmap.lastAdjustedAt || exportedAt,
      }
    : null;

  return {
    formatId: BACKUP_FORMAT_ID,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion: CURRENT_APP_VERSION,
    exportedAt,
    profile: sanitizedProfile,
    roadmap: sanitizedRoadmap,
    summary,
    securityNotice:
      "Aaroh local backup packet. Contains unencrypted client-side student progress. Do not share publicly if containing private notes.",
  };
}

/**
 * Generates a clean, date-stamped file name for user downloads.
 */
export function generateBackupFilename(profile: UserProfile): string {
  const sanitizedName = (profile.name || "aaroh-student")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const dateStr = new Date().toISOString().split("T")[0];
  return `aaroh-backup-${sanitizedName || "student"}-${dateStr}.json`;
}

/**
 * Detects dangerous prototype pollution keys (__proto__, constructor, prototype) recursively.
 */
export function containsPrototypePollution(obj: unknown, depth = 0): boolean {
  if (!obj || typeof obj !== "object" || depth > 20) {
    return false;
  }

  // Check if object prototype has been manipulated away from default Object / Array prototype
  const proto = Object.getPrototypeOf(obj);
  if (proto !== Object.prototype && proto !== Array.prototype && proto !== null) {
    return true;
  }

  // Check own properties and symbol keys
  const keys = Object.getOwnPropertyNames(obj);
  for (const key of keys) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return true;
    }
    const val = (obj as Record<string, unknown>)[key];
    if (val && typeof val === "object") {
      if (containsPrototypePollution(val, depth + 1)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validates, defensively sanitizes, and verifies trust boundaries for imported backup data.
 * Protects against:
 * 1. Oversized inputs (> 2MB).
 * 2. Corrupt or non-JSON payloads.
 * 3. Prototype pollution attempts.
 * 4. Schema version mismatch.
 * 5. Review trust-level forgery (clamps any institutional claims to unauthenticated local).
 * 6. Submission tampering & digest mismatch (flags stale reviews if code/reflection changed).
 * 7. Evidence state escalation (clamps unverified attempts to claim institutional verification).
 * 8. Non-erasure violation (guarantees existing independently_verified skills are never deleted or downgraded).
 */
export function validateAndParseBackup(
  rawInput: unknown,
  currentProfile?: UserProfile
): BackupValidationResult {
  const securityNotices: string[] = [];
  const stalenessNotices: string[] = [];

  // 1. File Size & Raw String Security Verification
  if (typeof rawInput === "string") {
    if (rawInput.length > MAX_BACKUP_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Backup file exceeds maximum allowed size of 2MB (received ${(rawInput.length / 1024 / 1024).toFixed(2)}MB).`,
        securityNotices,
        stalenessNotices,
      };
    }

    if (/"(?:__proto__|constructor|prototype)"\s*:/i.test(rawInput)) {
      return {
        isValid: false,
        error: "Security rejection: The backup payload contains forbidden prototype manipulation keys (__proto__, constructor, prototype).",
        securityNotices: ["Malicious prototype pollution attempt detected and rejected."],
        stalenessNotices,
      };
    }
  }

  // 2. Safe Parsing
  let parsed: any;
  if (typeof rawInput === "string") {
    try {
      parsed = JSON.parse(rawInput);
    } catch {
      return {
        isValid: false,
        error: "The provided file is not valid JSON. Please check the file and try again.",
        securityNotices,
        stalenessNotices,
      };
    }
  } else if (rawInput && typeof rawInput === "object") {
    parsed = rawInput;
  } else {
    return {
      isValid: false,
      error: "Invalid backup input: expected JSON string or parsed object.",
      securityNotices,
      stalenessNotices,
    };
  }

  // 3. Prototype Pollution Detection
  if (containsPrototypePollution(parsed)) {
    return {
      isValid: false,
      error: "Security rejection: The backup payload contains forbidden prototype manipulation keys (__proto__, constructor, prototype).",
      securityNotices: ["Malicious prototype pollution attempt detected and rejected."],
      stalenessNotices,
    };
  }

  // 4. Format Identifier and Version Check
  if (!parsed || typeof parsed !== "object") {
    return {
      isValid: false,
      error: "Invalid backup format: root element must be a valid JSON object.",
      securityNotices,
      stalenessNotices,
    };
  }

  if (parsed.formatId !== BACKUP_FORMAT_ID) {
    return {
      isValid: false,
      error: `Unsupported format identifier: expected "${BACKUP_FORMAT_ID}", received "${parsed.formatId}".`,
      securityNotices,
      stalenessNotices,
    };
  }

  if (parsed.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    return {
      isValid: false,
      error: `Unsupported backup schema version: expected "${BACKUP_SCHEMA_VERSION}", received "${parsed.schemaVersion}".`,
      securityNotices,
      stalenessNotices,
    };
  }

  // 5. Profile Validation & Field Sanitization
  const rawProfile = parsed.profile;
  if (!rawProfile || typeof rawProfile !== "object") {
    return {
      isValid: false,
      error: "Missing or malformed 'profile' object in backup packet.",
      securityNotices,
      stalenessNotices,
    };
  }

  if (!rawProfile.id || typeof rawProfile.id !== "string") {
    return {
      isValid: false,
      error: "Backup profile must contain a valid string 'id'.",
      securityNotices,
      stalenessNotices,
    };
  }

  const sanitizedStage: EducationStage = VALID_STAGES.includes(rawProfile.stage)
    ? rawProfile.stage
    : "first_second_year";

  const sanitizedDiscipline: EducationalDiscipline = VALID_DISCIPLINES.includes(rawProfile.discipline)
    ? rawProfile.discipline
    : "undecided";

  const sanitizedWorkStyles: WorkStyle[] = Array.isArray(rawProfile.selectedWorkStyles)
    ? rawProfile.selectedWorkStyles.filter((w: any): w is WorkStyle => VALID_WORK_STYLES.includes(w))
    : [];

  const sanitizedInterests: string[] = Array.isArray(rawProfile.interests)
    ? rawProfile.interests.filter((i: any): i is string => typeof i === "string" && i.trim().length > 0)
    : [];

  const weeklyCapacityHours =
    typeof rawProfile.weeklyCapacityHours === "number" &&
    rawProfile.weeklyCapacityHours >= 1 &&
    rawProfile.weeklyCapacityHours <= 80
      ? rawProfile.weeklyCapacityHours
      : 6;

  // 6. Project Submissions & Fingerprint Integrity Verification
  const sanitizedSubmissions: Record<string, ProjectSubmissionRecord> = {};
  const rawSubmissions = rawProfile.projectSubmissions;

  if (rawSubmissions && typeof rawSubmissions === "object") {
    for (const [projectId, sub] of Object.entries(rawSubmissions)) {
      if (sub && typeof sub === "object") {
        const s = sub as any;
        const normProjectId = String(s.projectId || projectId).trim();
        if (!normProjectId) continue;
        const normUrl = String(s.repoOrDemoUrl || "").trim();
        const normDeliverables = Array.isArray(s.checkedDeliverableIds)
          ? s.checkedDeliverableIds.map((d: any) => String(d).trim()).filter(Boolean)
          : [];
        const normReflection = String(s.reflection || "");

        // Compute deterministic SHA-256 digest of submission deliverables & code
        const computedFingerprint = computeSubmissionFingerprint({
          projectId: normProjectId,
          repoOrDemoUrl: normUrl,
          checkedDeliverableIds: normDeliverables,
          reflection: normReflection,
        });

        sanitizedSubmissions[normProjectId] = {
          projectId: normProjectId,
          projectSlug: String(s.projectSlug || normProjectId),
          careerSlug: String(s.careerSlug || ""),
          repoOrDemoUrl: normUrl,
          reflection: normReflection,
          checkedDeliverableIds: normDeliverables,
          status: s.status === "demonstrated" ? "evaluated" : (s.status || "not_started"),
          overallScore: typeof s.overallScore === "number" ? Math.max(0, Math.min(100, s.overallScore)) : 0,
          criteriaScores: Array.isArray(s.criteriaScores) ? s.criteriaScores : [],
          upgradedSkillIds: Array.isArray(s.upgradedSkillIds) ? s.upgradedSkillIds : [],
          feedback: String(s.feedback || ""),
          actionableNextSteps: Array.isArray(s.actionableNextSteps) ? s.actionableNextSteps : [],
          isArtifactInspected: false, // Architectural guarantee: client does not execute external code
          verificationLimitationNotice:
            "Artifact at external URL was not fetched or inspected by Aaroh.",
          verificationLevel: s.verificationLevel === "independently_verified"
            ? "student_attested" // Project submission cannot self-elevate to institutional
            : (s.verificationLevel || "student_attested"),
          submissionFingerprint: computedFingerprint,
          submittedAt: String(s.submittedAt || new Date().toISOString()),
          evaluatedAt: String(s.evaluatedAt || new Date().toISOString()),
        };
      }
    }
  }

  // 7. Project Reviews & Adversarial Trust Boundary Clamping
  const sanitizedReviews: Record<string, ProjectReviewRecord> = {};
  const rawReviews = rawProfile.projectReviews;

  if (rawReviews && typeof rawReviews === "object") {
    for (const [projectId, rev] of Object.entries(rawReviews)) {
      if (rev && typeof rev === "object") {
        const r = rev as any;
        const normProjectId = String(r.projectId || projectId).trim();
        if (!normProjectId) continue;
        const matchingSubmission = sanitizedSubmissions[normProjectId];

        // Fingerprint check: detect if code was modified after review was conducted
        let isStale = Boolean(r.isStale);
        if (matchingSubmission) {
          if (r.submissionFingerprint !== matchingSubmission.submissionFingerprint) {
            isStale = true;
            stalenessNotices.push(
              `Review for project '${projectId}' was marked STALE because submission deliverables or URL do not match the review's cryptographic fingerprint.`
            );
          }
        } else {
          isStale = true;
          stalenessNotices.push(
            `Review for project '${projectId}' has no corresponding project submission and is marked STALE.`
          );
        }

        // Trust Level Clamping:
        // Aaroh's trust model mandates that imported local files CANNOT claim institutional_proctored credentials.
        let clampedTrustLevel: ReviewTrustLevel = "unauthenticated_peer";
        if (r.reviewerRole === "mentor" || r.trustLevel === "unauthenticated_mentor") {
          clampedTrustLevel = "unauthenticated_mentor";
        }
        if (r.trustLevel === "institutional_proctored" || r.trustLevel === "institutional_verified") {
          securityNotices.push(
            `Clamped forged or unverified trust level '${r.trustLevel}' for review on project '${projectId}' to '${clampedTrustLevel}'.`
          );
        }

        sanitizedReviews[projectId] = {
          reviewId: String(r.reviewId || `rev-${projectId}-${Date.now()}`),
          projectId: String(r.projectId || projectId),
          projectSlug: String(r.projectSlug || projectId),
          submissionFingerprint: String(r.submissionFingerprint || ""),
          reviewerName: String(r.reviewerName || "Peer Reviewer").trim(),
          reviewerRole: r.reviewerRole === "mentor" ? "mentor" : (r.reviewerRole === "community" ? "community" : "peer"),
          trustLevel: clampedTrustLevel,
          criteriaEvaluations: Array.isArray(r.criteriaEvaluations) ? r.criteriaEvaluations : [],
          overallFeedback: String(r.overallFeedback || "").trim(),
          overallDecision: r.overallDecision === "approved" ? "approved" : "changes_requested",
          artifactExamined: Boolean(r.artifactExamined),
          reviewedAt: String(r.reviewedAt || new Date().toISOString()),
          isStale,
          trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
        };

        // Also synchronize attached review onto matching submission
        if (matchingSubmission) {
          matchingSubmission.review = sanitizedReviews[projectId];
        }
      }
    }
  }

  // 8. Skill Evidence & Non-Erasure Protection
  const sanitizedSkillEvidence: Record<string, UserSkillEvidence> = {};
  const rawSkillEvidence = rawProfile.skillEvidence;

  if (rawSkillEvidence && typeof rawSkillEvidence === "object") {
    for (const [skillId, ev] of Object.entries(rawSkillEvidence)) {
      if (ev && typeof ev === "object") {
        const e = ev as any;
        const normSkillId = String(e.skillId || skillId).trim();
        if (!normSkillId) continue;
        let evidenceState: EvidenceState = VALID_EVIDENCE_STATES.includes(e.state)
          ? e.state
          : "not_assessed";

        // Check against pre-existing institutional verification
        const existingInstitutional =
          currentProfile?.skillEvidence?.[normSkillId]?.state === "independently_verified";

        // If the import claims independently_verified, but the current student does NOT have pre-existing institutional verification:
        // Clamp to practically_demonstrated or student_attested to prevent forging institutional evidence via JSON import.
        if (evidenceState === "independently_verified" && !existingInstitutional) {
          evidenceState = "practically_demonstrated";
          securityNotices.push(
            `Clamped unverified evidence state for skill '${normSkillId}' from 'independently_verified' to 'practically_demonstrated' (institutional verification cannot be minted via local JSON backup).`
          );
        }

        sanitizedSkillEvidence[normSkillId] = {
          skillId: normSkillId,
          state: evidenceState,
          updatedAt: String(e.updatedAt || new Date().toISOString()),
          sourceTitle: e.sourceTitle ? String(e.sourceTitle) : undefined,
          sourceUrl: e.sourceUrl ? String(e.sourceUrl) : undefined,
          reflection: e.reflection ? String(e.reflection) : undefined,
          assessedScore: typeof e.assessedScore === "number" ? Math.max(0, Math.min(100, e.assessedScore)) : undefined,
          verificationLevel:
            evidenceState === "independently_verified"
              ? "independently_verified"
              : evidenceState === "practically_demonstrated"
              ? "artifact_examined"
              : "student_attested",
          evaluationBasis: e.evaluationBasis ? String(e.evaluationBasis) : undefined,
          unverifiedNotice:
            evidenceState === "student_attested"
              ? "Artifact at external URL was not inspected by Aaroh."
              : e.unverifiedNotice ? String(e.unverifiedNotice) : undefined,
          isArtifactInspected: false,
          reviewerName: e.reviewerName ? String(e.reviewerName) : undefined,
          reviewerRole: e.reviewerRole,
          reviewId: e.reviewId ? String(e.reviewId) : undefined,
          reviewedAt: e.reviewedAt ? String(e.reviewedAt) : undefined,
        };
      }
    }
  }

  // Non-Erasure Rule:
  // If the current student profile already has independently_verified skills,
  // NEVER allow an imported backup to erase or downgrade them!
  if (currentProfile?.skillEvidence) {
    for (const [skillId, existingEv] of Object.entries(currentProfile.skillEvidence)) {
      if (existingEv.state === "independently_verified") {
        if (!sanitizedSkillEvidence[skillId] || sanitizedSkillEvidence[skillId].state !== "independently_verified") {
          sanitizedSkillEvidence[skillId] = { ...existingEv };
          securityNotices.push(
            `Non-erasure rule applied: Preserved pre-existing independently verified skill '${skillId}'.`
          );
        }
      }
    }
  }

  // 9. Completed Trials & Reflections
  const sanitizedCompletedTrialIds: string[] = Array.isArray(rawProfile.completedTrialIds)
    ? Array.from(new Set(rawProfile.completedTrialIds.map((t: any) => String(t).trim()).filter(Boolean)))
    : [];

  const sanitizedTrialReflections: Record<string, any> = {};
  if (rawProfile.trialReflections && typeof rawProfile.trialReflections === "object") {
    for (const [trialId, tr] of Object.entries(rawProfile.trialReflections)) {
      if (tr && typeof tr === "object") {
        const t = tr as any;
        sanitizedTrialReflections[trialId] = {
          trialId: String(t.trialId || trialId),
          rating: typeof t.rating === "number" ? Math.max(1, Math.min(5, t.rating)) : 3,
          reflection: String(t.reflection || ""),
          selectedOptionId: t.selectedOptionId ? String(t.selectedOptionId) : undefined,
          score: typeof t.score === "number" ? Math.max(0, Math.min(100, t.score)) : undefined,
          criteriaScores: Array.isArray(t.criteriaScores) ? t.criteriaScores : undefined,
          feedback: t.feedback ? String(t.feedback) : undefined,
          submittedAt: String(t.submittedAt || new Date().toISOString()),
        };
      }
    }
  }

  // 10. Assemble Sanitized Profile
  const sanitizedProfile: UserProfile = {
    id: String(rawProfile.id),
    name: String(rawProfile.name || "").trim(),
    email: rawProfile.email ? String(rawProfile.email) : undefined,
    stage: sanitizedStage,
    discipline: sanitizedDiscipline,
    customDisciplineText: rawProfile.customDisciplineText ? String(rawProfile.customDisciplineText) : undefined,
    selectedWorkStyles: sanitizedWorkStyles,
    interests: sanitizedInterests,
    weeklyCapacityHours,
    isExamMode: Boolean(rawProfile.isExamMode),
    targetCareerSlug: rawProfile.targetCareerSlug ? String(rawProfile.targetCareerSlug) : undefined,
    targetCareerHypotheses: Array.isArray(rawProfile.targetCareerHypotheses)
      ? Array.from(new Set(rawProfile.targetCareerHypotheses.map((h: any) => String(h).trim()).filter(Boolean)))
      : [],
    skillEvidence: sanitizedSkillEvidence,
    completedTrialIds: sanitizedCompletedTrialIds,
    trialReflections: sanitizedTrialReflections,
    projectSubmissions: sanitizedSubmissions,
    projectReviews: sanitizedReviews,
    savedCareerSlugs: Array.isArray(rawProfile.savedCareerSlugs)
      ? Array.from(new Set(rawProfile.savedCareerSlugs.map((s: any) => String(s).trim()).filter(Boolean)))
      : [],
    hasCompletedOnboarding: rawProfile.hasCompletedOnboarding !== false,
    currentSituation: rawProfile.currentSituation ? String(rawProfile.currentSituation) : undefined,
    actualExperience: rawProfile.actualExperience ? String(rawProfile.actualExperience) : undefined,
    thingsToAvoid: rawProfile.thingsToAvoid ? String(rawProfile.thingsToAvoid) : undefined,
    goalsAndConstraints: rawProfile.goalsAndConstraints ? String(rawProfile.goalsAndConstraints) : undefined,
    uncertainties: Array.isArray(rawProfile.uncertainties)
      ? rawProfile.uncertainties.map((u: any) => String(u)).filter(Boolean)
      : [],
    createdAt: String(rawProfile.createdAt || new Date().toISOString()),
    updatedAt: new Date().toISOString(),
  };

  // 11. Roadmap Validation & Sanitization
  let sanitizedRoadmap: Roadmap | null = null;
  const rawRoadmap = parsed.roadmap;
  if (rawRoadmap && typeof rawRoadmap === "object") {
    const tasks = Array.isArray(rawRoadmap.tasks)
      ? rawRoadmap.tasks.map((task: any) => {
          let status = task.status;
          // Protect Milestone 4: if review is stale or unapproved, task-4 cannot be completed
          if (task.id === "task-4") {
            const hasValidReview = Object.values(sanitizedReviews).some(
              (rev) => !rev.isStale && rev.overallDecision === "approved" && rev.artifactExamined
            );
            if (!hasValidReview && status === "completed") {
              status = "available";
              stalenessNotices.push(
                "Reset Roadmap Task 4 to 'available' because the backup lacks an active, non-stale approved review."
              );
            }
          }

          return {
            id: String(task.id),
            title: String(task.title || ""),
            purpose: String(task.purpose || ""),
            whyItMatters: String(task.whyItMatters || ""),
            category: task.category || "verify",
            skillId: task.skillId ? String(task.skillId) : undefined,
            estimatedHours: typeof task.estimatedHours === "number" ? task.estimatedHours : 2,
            prerequisites: Array.isArray(task.prerequisites) ? task.prerequisites.map(String) : [],
            instructions: Array.isArray(task.instructions) ? task.instructions.map(String) : [],
            learningResources: Array.isArray(task.learningResources) ? task.learningResources : [],
            completionCriteria: Array.isArray(task.completionCriteria) ? task.completionCriteria.map(String) : [],
            requiredEvidenceType: task.requiredEvidenceType || "reflection",
            status: ["locked", "available", "in_progress", "completed", "deferred"].includes(status)
              ? status
              : "available",
            dueDate: task.dueDate ? String(task.dueDate) : undefined,
            completedAt: status === "completed" ? String(task.completedAt || new Date().toISOString()) : undefined,
            submittedEvidence: task.submittedEvidence,
          };
        })
      : [];

    sanitizedRoadmap = {
      id: String(rawRoadmap.id || `roadmap-${sanitizedProfile.targetCareerSlug || "general"}`),
      careerSlug: String(rawRoadmap.careerSlug || sanitizedProfile.targetCareerSlug || ""),
      weeklyCapacityHours: typeof rawRoadmap.weeklyCapacityHours === "number" ? rawRoadmap.weeklyCapacityHours : weeklyCapacityHours,
      isExamMode: Boolean(rawRoadmap.isExamMode),
      tasks,
      generatedAt: String(rawRoadmap.generatedAt || new Date().toISOString()),
      lastAdjustedAt: new Date().toISOString(),
    };
  }

  // 12. Build Preview Summary
  const summary: BackupPreviewSummary = {
    studentName: sanitizedProfile.name || "Unnamed Student",
    stage: sanitizedProfile.stage,
    discipline: sanitizedProfile.discipline,
    targetCareer: sanitizedProfile.targetCareerSlug,
    totalSkillsTracked: Object.keys(sanitizedProfile.skillEvidence).length,
    completedTrialsCount: sanitizedProfile.completedTrialIds.length,
    projectSubmissionsCount: Object.keys(sanitizedProfile.projectSubmissions).length,
    projectReviewsCount: Object.keys(sanitizedProfile.projectReviews || {}).length,
    roadmapCompletedTasksCount: sanitizedRoadmap
      ? sanitizedRoadmap.tasks.filter((t) => t.status === "completed").length
      : 0,
    examModeEnabled: sanitizedProfile.isExamMode,
    weeklyCapacityHours: sanitizedProfile.weeklyCapacityHours,
    exportedAt: String(parsed.exportedAt || new Date().toISOString()),
  };

  const finalPacket: AarohBackupPacket = {
    formatId: BACKUP_FORMAT_ID,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion: String(parsed.appVersion || CURRENT_APP_VERSION),
    exportedAt: summary.exportedAt,
    profile: sanitizedProfile,
    roadmap: sanitizedRoadmap,
    summary,
    securityNotice:
      "Aaroh local backup packet. Contains unencrypted client-side student progress. Do not share publicly if containing private notes.",
  };

  return {
    isValid: true,
    sanitizedBackup: finalPacket,
    summary,
    securityNotices,
    stalenessNotices,
  };
}
