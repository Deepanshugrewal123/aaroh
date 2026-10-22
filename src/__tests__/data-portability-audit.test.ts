import { describe, it, expect, beforeEach } from "vitest";
import {
  createStudentBackupSnapshot,
  validateAndParseBackup,
  containsPrototypePollution,
  generateBackupFilename,
  BACKUP_FORMAT_ID,
  BACKUP_SCHEMA_VERSION,
  MAX_BACKUP_SIZE_BYTES,
  AarohBackupPacket,
} from "../lib/backup-system";
import {
  DEFAULT_GUEST_PROFILE,
  EMPTY_PROFILE,
  generateInitialRoadmap,
} from "../lib/store";
import { computeSubmissionFingerprint } from "../lib/review-system";
import { UserProfile, Roadmap, ProjectSubmissionRecord, ProjectReviewRecord } from "../lib/types";

describe("Phase 8B: Student Data Portability, Safe Restore & Evidence Integrity Audit", () => {
  let samplePopulatedProfile: UserProfile;
  let sampleRoadmap: Roadmap;

  beforeEach(() => {
    const submissionFingerprint = computeSubmissionFingerprint({
      projectId: "proj-3",
      repoOrDemoUrl: "https://github.com/student/vertical-slice",
      checkedDeliverableIds: ["p3-deliv-1", "p3-deliv-2"],
      reflection: "Built fully responsive Next.js application with SQLite database.",
    });

    const sampleReview: ProjectReviewRecord = {
      reviewId: "rev-sample-101",
      projectId: "proj-3",
      projectSlug: "vertical-slice-inventory-system",
      submissionFingerprint,
      reviewerName: "Sunil Senior Engineer",
      reviewerRole: "mentor",
      trustLevel: "unauthenticated_mentor",
      criteriaEvaluations: [
        {
          criterionId: "p3-crit-1",
          passed: true,
          score: 85,
          feedback: "Solid system architecture and clean error boundaries.",
        },
      ],
      overallFeedback: "Approved horizontal slice with thorough verification.",
      overallDecision: "approved",
      artifactExamined: true,
      reviewedAt: new Date().toISOString(),
      isStale: false,
      trustDisclosure: "Local unauthenticated peer/mentor review.",
    };

    const sampleSubmission: ProjectSubmissionRecord = {
      projectId: "proj-3",
      projectSlug: "vertical-slice-inventory-system",
      careerSlug: "full-stack-systems-engineer",
      repoOrDemoUrl: "https://github.com/student/vertical-slice",
      reflection: "Built fully responsive Next.js application with SQLite database.",
      checkedDeliverableIds: ["p3-deliv-1", "p3-deliv-2"],
      status: "evaluated",
      overallScore: 88,
      criteriaScores: [
        {
          criterionId: "p3-crit-1",
          title: "System Architecture",
          associatedSkillId: "system-architecture",
          score: 88,
          weight: 50,
          passed: true,
          feedback: "Great modular code.",
        },
      ],
      upgradedSkillIds: ["system-architecture"],
      feedback: "Great submission meeting rubric standards.",
      actionableNextSteps: ["Add automated test suite"],
      isArtifactInspected: false,
      verificationLimitationNotice: "Remote artifacts not inspected.",
      verificationLevel: "student_attested",
      submissionFingerprint,
      review: sampleReview,
      submittedAt: new Date().toISOString(),
      evaluatedAt: new Date().toISOString(),
    };

    samplePopulatedProfile = {
      ...DEFAULT_GUEST_PROFILE,
      id: "student-aditi-2026",
      name: "Aditi Verma",
      stage: "first_second_year",
      discipline: "engineering",
      selectedWorkStyles: ["analytical", "practical_hands_on"],
      interests: ["Distributed Systems", "Cloud Infrastructure"],
      weeklyCapacityHours: 12,
      isExamMode: false,
      targetCareerSlug: "full-stack-systems-engineer",
      completedTrialIds: ["trial-systems-1"],
      trialReflections: {
        "trial-systems-1": {
          trialId: "trial-systems-1",
          rating: 5,
          reflection: "Loved analyzing the latency bottleneck.",
          score: 90,
          submittedAt: new Date().toISOString(),
        },
      },
      projectSubmissions: {
        "proj-3": sampleSubmission,
      },
      projectReviews: {
        "proj-3": sampleReview,
      },
      skillEvidence: {
        "system-architecture": {
          skillId: "system-architecture",
          state: "practically_demonstrated",
          sourceTitle: "Vertical Slice Starter",
          sourceUrl: "https://github.com/student/vertical-slice",
          verificationLevel: "artifact_examined",
          reviewerName: "Sunil Senior Engineer",
          reviewerRole: "mentor",
          reviewId: "rev-sample-101",
          updatedAt: new Date().toISOString(),
        },
        "formal-methods": {
          skillId: "formal-methods",
          state: "independently_verified",
          sourceTitle: "IIT Delhi Proctored Exam Verification",
          verificationLevel: "independently_verified",
          updatedAt: new Date().toISOString(),
        },
      },
      createdAt: "2026-09-01T10:00:00.000Z",
      updatedAt: "2026-10-22T10:00:00.000Z",
    };

    sampleRoadmap = generateInitialRoadmap(
      "full-stack-systems-engineer",
      12,
      false,
      ["trial-systems-1"],
      samplePopulatedProfile.projectSubmissions,
      samplePopulatedProfile.projectReviews || {}
    );
  });

  // --------------------------------------------------------------------------
  // 1. Export Snapshot Integrity
  // --------------------------------------------------------------------------
  describe("1. Export Snapshot Creation", () => {
    it("exports an empty but valid profile with compliant schema version and metadata", () => {
      const snapshot = createStudentBackupSnapshot(EMPTY_PROFILE, null);

      expect(snapshot.formatId).toBe(BACKUP_FORMAT_ID);
      expect(snapshot.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
      expect(snapshot.profile.id).toBe(EMPTY_PROFILE.id);
      expect(snapshot.roadmap).toBeNull();
      expect(snapshot.summary.completedTrialsCount).toBe(0);
      expect(snapshot.summary.projectSubmissionsCount).toBe(0);
      expect(snapshot.summary.roadmapCompletedTasksCount).toBe(0);
      expect(snapshot.securityNotice).toContain("unencrypted client-side student progress");
    });

    it("exports a complete profile with projects, reviews, trials, and roadmap state", () => {
      const snapshot = createStudentBackupSnapshot(samplePopulatedProfile, sampleRoadmap);

      expect(snapshot.profile.name).toBe("Aditi Verma");
      expect(snapshot.profile.completedTrialIds).toContain("trial-systems-1");
      expect(snapshot.profile.projectSubmissions["proj-3"]).toBeDefined();
      expect(snapshot.profile.projectReviews?.["proj-3"]).toBeDefined();
      expect(snapshot.roadmap).not.toBeNull();
      expect(snapshot.roadmap?.careerSlug).toBe("full-stack-systems-engineer");
      expect(snapshot.summary.completedTrialsCount).toBe(1);
      expect(snapshot.summary.projectSubmissionsCount).toBe(1);
      expect(snapshot.summary.projectReviewsCount).toBe(1);
    });

    it("generates a clean, sanitized, date-stamped filename", () => {
      const filename = generateBackupFilename(samplePopulatedProfile);
      expect(filename).toMatch(/^aaroh-backup-aditi-verma-\d{4}-\d{2}-\d{2}\.json$/);

      const emptyFilename = generateBackupFilename({ ...EMPTY_PROFILE, name: "   " });
      expect(emptyFilename).toMatch(/^aaroh-backup-student-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Round-Trip Export and Restore Equivalence
  // --------------------------------------------------------------------------
  describe("2. Round-Trip Export and Restore Equivalence", () => {
    it("preserves all supported profile fields, submissions, reviews, and roadmap milestones", () => {
      const snapshot = createStudentBackupSnapshot(samplePopulatedProfile, sampleRoadmap);
      const jsonString = JSON.stringify(snapshot, null, 2);

      const validation = validateAndParseBackup(jsonString, samplePopulatedProfile);
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();

      const restored = validation.sanitizedBackup!;
      expect(restored.profile.id).toBe(samplePopulatedProfile.id);
      expect(restored.profile.name).toBe(samplePopulatedProfile.name);
      expect(restored.profile.stage).toBe(samplePopulatedProfile.stage);
      expect(restored.profile.discipline).toBe(samplePopulatedProfile.discipline);
      expect(restored.profile.weeklyCapacityHours).toBe(samplePopulatedProfile.weeklyCapacityHours);
      expect(restored.profile.completedTrialIds).toEqual(samplePopulatedProfile.completedTrialIds);
      expect(restored.profile.projectSubmissions["proj-3"].overallScore).toBe(88);
      expect(restored.profile.projectReviews?.["proj-3"].reviewerName).toBe("Sunil Senior Engineer");
      expect(restored.roadmap?.careerSlug).toBe("full-stack-systems-engineer");
    });
  });

  // --------------------------------------------------------------------------
  // 3. Input Validation & Malformed Payloads
  // --------------------------------------------------------------------------
  describe("3. Input Validation & Malformed Payload Handling", () => {
    it("rejects oversized backup files (> 2MB) before expensive processing", () => {
      // Create a 2.5MB payload
      const largePayload = "a".repeat(MAX_BACKUP_SIZE_BYTES + 1024);
      const result = validateAndParseBackup(largePayload);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("exceeds maximum allowed size of 2MB");
    });

    it("rejects invalid or non-JSON strings", () => {
      const malformed = "{ this is definitely not valid json }";
      const result = validateAndParseBackup(malformed);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("not valid JSON");
    });

    it("rejects non-object payloads (arrays, null, primitives)", () => {
      expect(validateAndParseBackup("[]").isValid).toBe(false);
      expect(validateAndParseBackup("12345").isValid).toBe(false);
      expect(validateAndParseBackup("null").isValid).toBe(false);
    });

    it("rejects files with unsupported or missing formatId", () => {
      const invalidFormat = {
        formatId: "unsupported_foreign_format",
        schemaVersion: "1.0",
        profile: samplePopulatedProfile,
      };
      const result = validateAndParseBackup(JSON.stringify(invalidFormat));
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Unsupported format identifier");
    });

    it("rejects files with unsupported schema versions", () => {
      const unsupportedVersion = {
        formatId: BACKUP_FORMAT_ID,
        schemaVersion: "99.0",
        profile: samplePopulatedProfile,
      };
      const result = validateAndParseBackup(JSON.stringify(unsupportedVersion));
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Unsupported backup schema version");
    });

    it("rejects backups missing a profile or with invalid profile ID", () => {
      const noProfile = {
        formatId: BACKUP_FORMAT_ID,
        schemaVersion: "1.0",
      };
      expect(validateAndParseBackup(JSON.stringify(noProfile)).isValid).toBe(false);

      const invalidProfileId = {
        formatId: BACKUP_FORMAT_ID,
        schemaVersion: "1.0",
        profile: { name: "Bob" },
      };
      expect(validateAndParseBackup(JSON.stringify(invalidProfileId)).isValid).toBe(false);
    });

    it("sanitizes invalid enum values gracefully to safe defaults", () => {
      const packet = createStudentBackupSnapshot(samplePopulatedProfile, null);
      // Inject unknown discipline and unknown stage
      (packet.profile as any).discipline = "astrology_alchemy";
      (packet.profile as any).stage = "tenth_century_scholar";

      const result = validateAndParseBackup(JSON.stringify(packet));
      expect(result.isValid).toBe(true);
      expect(result.sanitizedBackup?.profile.discipline).toBe("undecided");
      expect(result.sanitizedBackup?.profile.stage).toBe("first_second_year");
    });
  });

  // --------------------------------------------------------------------------
  // 4. Security & Prototype Pollution Protection
  // --------------------------------------------------------------------------
  describe("4. Security & Prototype Pollution Hardening", () => {
    it("detects prototype pollution keys via containsPrototypePollution", () => {
      expect(containsPrototypePollution({ normal: "value" })).toBe(false);
      expect(containsPrototypePollution({ __proto__: { admin: true } })).toBe(true);
      expect(containsPrototypePollution({ nested: { constructor: "exploit" } })).toBe(true);
      expect(containsPrototypePollution({ deep: { level: { prototype: {} } } })).toBe(true);
    });

    it("rejects JSON payloads containing __proto__ manipulation", () => {
      const maliciousJson = `{"formatId":"aaroh_student_data_backup","schemaVersion":"1.0","profile":{"id":"p1","__proto__":{"isAdmin":true}}}`;
      const result = validateAndParseBackup(maliciousJson);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Security rejection");
      expect(result.securityNotices.some((n) => n.includes("prototype pollution"))).toBe(true);
    });

    it("rejects JSON payloads containing constructor poisoning", () => {
      const maliciousJson = `{"formatId":"aaroh_student_data_backup","schemaVersion":"1.0","profile":{"id":"p1","constructor":{"polluted":true}}}`;
      const result = validateAndParseBackup(maliciousJson);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Security rejection");
    });
  });

  // --------------------------------------------------------------------------
  // 5. Adversarial Trust Boundaries & Review Clamping
  // --------------------------------------------------------------------------
  describe("5. Adversarial Trust Boundaries & Review Clamping", () => {
    it("clamps forged institutional_proctored review claims to unauthenticated local level", () => {
      const snapshot = createStudentBackupSnapshot(samplePopulatedProfile, sampleRoadmap);
      // Attacker modifies backup JSON to claim institutional credentials
      (snapshot.profile.projectReviews!["proj-3"] as any).trustLevel = "institutional_proctored";

      const result = validateAndParseBackup(JSON.stringify(snapshot));
      expect(result.isValid).toBe(true);

      const clampedReview = result.sanitizedBackup?.profile.projectReviews!["proj-3"];
      expect(clampedReview?.trustLevel).toBe("unauthenticated_mentor");
      expect(result.securityNotices.some((n) => n.includes("Clamped forged or unverified trust level"))).toBe(true);
    });

    it("clamps forged institutional_verified review claims to unauthenticated local level", () => {
      const snapshot = createStudentBackupSnapshot(samplePopulatedProfile, sampleRoadmap);
      (snapshot.profile.projectReviews!["proj-3"] as any).trustLevel = "institutional_verified";

      const result = validateAndParseBackup(JSON.stringify(snapshot));
      expect(result.isValid).toBe(true);

      const clampedReview = result.sanitizedBackup?.profile.projectReviews!["proj-3"];
      expect(clampedReview?.trustLevel).toBe("unauthenticated_mentor");
      expect(result.securityNotices.some((n) => n.includes("Clamped forged or unverified trust level"))).toBe(true);
    });

    it("safely handles duplicate IDs, whitespace collisions, and conflicting project records", () => {
      const snapshot = createStudentBackupSnapshot(samplePopulatedProfile, sampleRoadmap);
      // Inject duplicate trial IDs and whitespace collisions
      snapshot.profile.completedTrialIds = ["trial-1", "trial-1", " trial-1 ", "trial-2"];
      snapshot.profile.savedCareerSlugs = ["career-a", "career-a", "career-b"];
      snapshot.profile.targetCareerHypotheses = ["hypo-1", "hypo-1"];

      const result = validateAndParseBackup(JSON.stringify(snapshot));
      expect(result.isValid).toBe(true);

      const cleaned = result.sanitizedBackup?.profile!;
      expect(cleaned.completedTrialIds).toEqual(["trial-1", "trial-2"]);
      expect(cleaned.savedCareerSlugs).toEqual(["career-a", "career-b"]);
      expect(cleaned.targetCareerHypotheses).toEqual(["hypo-1"]);
    });

    it("ensures student project submission cannot claim institutional verification level and isArtifactInspected is false", () => {
      const snapshot = createStudentBackupSnapshot(samplePopulatedProfile, sampleRoadmap);
      (snapshot.profile.projectSubmissions["proj-3"] as any).verificationLevel = "independently_verified";
      (snapshot.profile.projectSubmissions["proj-3"] as any).isArtifactInspected = true;

      const result = validateAndParseBackup(JSON.stringify(snapshot));
      expect(result.isValid).toBe(true);

      const sub = result.sanitizedBackup?.profile.projectSubmissions["proj-3"]!;
      expect(sub.verificationLevel).toBe("student_attested");
      expect(sub.isArtifactInspected).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Cryptographic Fingerprint & Staleness Verification
  // --------------------------------------------------------------------------
  describe("6. Cryptographic Fingerprint & Staleness Verification", () => {
    it("flags review as STALE when submission deliverables or URL have changed", () => {
      const snapshot = createStudentBackupSnapshot(samplePopulatedProfile, sampleRoadmap);
      // Attacker or student modified the code URL in the backup without obtaining a new review
      snapshot.profile.projectSubmissions["proj-3"].repoOrDemoUrl =
        "https://github.com/student/completely-different-code";

      const result = validateAndParseBackup(JSON.stringify(snapshot));
      expect(result.isValid).toBe(true);

      const rev = result.sanitizedBackup?.profile.projectReviews!["proj-3"];
      expect(rev?.isStale).toBe(true);
      expect(result.stalenessNotices.length).toBeGreaterThan(0);
      expect(result.stalenessNotices.some((n) => n.includes("STALE"))).toBe(true);
    });

    it("resets Roadmap Task 4 to available if the backup lacks an active valid non-stale review", () => {
      const snapshot = createStudentBackupSnapshot(samplePopulatedProfile, sampleRoadmap);
      // Invalidate review fingerprint
      snapshot.profile.projectSubmissions["proj-3"].checkedDeliverableIds = ["tampered-del"];

      // Verify task-4 in roadmap was initially marked completed
      const task4 = snapshot.roadmap?.tasks.find((t) => t.id === "task-4");
      expect(task4?.status).toBe("completed");

      const result = validateAndParseBackup(JSON.stringify(snapshot));
      expect(result.isValid).toBe(true);

      const restoredTask4 = result.sanitizedBackup?.roadmap?.tasks.find((t) => t.id === "task-4");
      expect(restoredTask4?.status).toBe("available");
      expect(result.stalenessNotices.some((n) => n.includes("Reset Roadmap Task 4"))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Evidence Integrity & Non-Erasure Protection
  // --------------------------------------------------------------------------
  describe("7. Evidence Integrity & Non-Erasure Protection", () => {
    it("enforces Non-Erasure Rule: preserves current independently_verified skills even if omitted or downgraded in backup", () => {
      // Current profile has "formal-methods" verified by IIT Delhi
      const currentStudent = { ...samplePopulatedProfile };
      expect(currentStudent.skillEvidence["formal-methods"].state).toBe("independently_verified");

      // Attacker imports a backup that attempts to wipe or downgrade "formal-methods" to "not_assessed"
      const incomingBackup = createStudentBackupSnapshot(samplePopulatedProfile, null);
      incomingBackup.profile.skillEvidence["formal-methods"] = {
        skillId: "formal-methods",
        state: "not_assessed",
        updatedAt: new Date().toISOString(),
      };

      const result = validateAndParseBackup(JSON.stringify(incomingBackup), currentStudent);
      expect(result.isValid).toBe(true);

      // Non-erasure rule must guarantee "formal-methods" remains independently_verified
      const preservedSkill = result.sanitizedBackup?.profile.skillEvidence["formal-methods"];
      expect(preservedSkill?.state).toBe("independently_verified");
      expect(preservedSkill?.sourceTitle).toBe("IIT Delhi Proctored Exam Verification");
      expect(result.securityNotices.some((n) => n.includes("Non-erasure rule applied"))).toBe(true);
    });

    it("clamps unverified attempts to mint independently_verified skills via JSON import", () => {
      // Incoming backup claims a brand new skill is independently_verified without prior institutional record
      const incomingBackup = createStudentBackupSnapshot(EMPTY_PROFILE, null);
      incomingBackup.profile.skillEvidence["quantum-computing"] = {
        skillId: "quantum-computing",
        state: "independently_verified",
        updatedAt: new Date().toISOString(),
      };

      const result = validateAndParseBackup(JSON.stringify(incomingBackup), EMPTY_PROFILE);
      expect(result.isValid).toBe(true);

      // Must be clamped to practically_demonstrated
      const clampedSkill = result.sanitizedBackup?.profile.skillEvidence["quantum-computing"];
      expect(clampedSkill?.state).toBe("practically_demonstrated");
      expect(result.securityNotices.some((n) => n.includes("institutional verification cannot be minted"))).toBe(true);
    });
  });
});
