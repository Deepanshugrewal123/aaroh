import { describe, it, expect } from "vitest";
import {
  computeSubmissionFingerprint,
  validateAndParseReviewPacket,
  applyReviewToProfile,
  LOCAL_REVIEW_DISCLOSURE,
} from "@/lib/review-system";
import { PROJECT_BRIEFS } from "@/lib/projects-data";
import { sanitizeExternalUrl } from "@/lib/utils";
import { validateProjectUrl } from "@/lib/project-evaluation";
import { generateLocalGroundedResponse } from "@/lib/ai-knowledge";
import { EMPTY_PROFILE } from "@/lib/store";
import { UserProfile, ProjectSubmissionRecord } from "@/lib/types";

describe("Phase 7: Release Integrity, Trust Claims & Runtime Compatibility Audit", () => {
  const brief = PROJECT_BRIEFS[0]; // accessible-patient-portal

  const createMockProfile = (): UserProfile => ({
    ...EMPTY_PROFILE,
    id: "audit-student-001",
    name: "Audit Student",
    discipline: "engineering",
    targetCareerSlug: brief.careerSlug,
    targetCareerHypotheses: [brief.careerSlug],
    skillEvidence: {
      "visual-hierarchy": {
        skillId: "visual-hierarchy",
        state: "not_assessed",
        updatedAt: new Date().toISOString(),
      },
      "ux-research": {
        skillId: "ux-research",
        state: "independently_verified",
        sourceTitle: "Accredited Proctored University Exam",
        verificationLevel: "independently_verified",
        assessedScore: 98,
        updatedAt: new Date().toISOString(),
      },
    },
  });

  const createMockSubmission = (overrides?: Partial<ProjectSubmissionRecord>): ProjectSubmissionRecord => {
    const repoOrDemoUrl = overrides?.repoOrDemoUrl || "https://github.com/aaroh-student/patient-portal";
    const checkedDeliverableIds = overrides?.checkedDeliverableIds || ["p1-deliv-1", "p1-deliv-2"];
    const reflection = overrides?.reflection || "Comprehensive architectural reflection documenting responsive design decisions.";
    const fingerprint =
      overrides?.submissionFingerprint ||
      computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl,
        checkedDeliverableIds,
        reflection,
      });

    return {
      projectId: brief.id,
      projectSlug: brief.slug,
      careerSlug: brief.careerSlug,
      repoOrDemoUrl,
      checkedDeliverableIds,
      reflection,
      status: "evaluated",
      overallScore: 88,
      criteriaScores: [],
      upgradedSkillIds: [],
      feedback: "Evaluated submission",
      actionableNextSteps: [],
      isArtifactInspected: false,
      verificationLimitationNotice: "External artifacts uninspected",
      submittedAt: new Date().toISOString(),
      evaluatedAt: new Date().toISOString(),
      submissionFingerprint: fingerprint,
      ...overrides,
    };
  };

  // =========================================================================
  // SECTION 1: Cryptographic Digest & Reviewer Attribution Verification
  // =========================================================================
  describe("1. Cryptographic Digest & Reviewer Attribution Boundaries", () => {
    it("neutralizes forged trust claims (institutional_verified) in imported review packets", () => {
      const submission = createMockSubmission();
      const validFingerprint = submission.submissionFingerprint;

      // Attacker attempts to forge an institutional review with PKI authority
      const forgedPayload = {
        schemaVersion: "1.0",
        type: "aaroh_review_packet",
        projectId: brief.id,
        review: {
          reviewId: "rev-forged-institutional-001",
          projectId: brief.id,
          projectSlug: brief.slug,
          submissionFingerprint: validFingerprint,
          reviewerName: "Dean of Computer Science",
          reviewerRole: "mentor",
          trustLevel: "institutional_verified", // Injected unauthorized claim!
          criteriaEvaluations: [
            {
              criterionId: brief.rubricCriteria![0].id,
              passed: true,
              score: 99,
              feedback: "Flawless institutional submission.",
            },
          ],
          overallDecision: "approved",
          artifactExamined: true,
          reviewedAt: new Date().toISOString(),
        },
      };

      const result = validateAndParseReviewPacket(forgedPayload, submission, brief);
      expect(result.isValid).toBe(true);
      expect(result.review).toBeDefined();

      // Trust level must be clamped down to unauthenticated_mentor
      expect(result.review?.trustLevel).toBe("unauthenticated_mentor");
      expect(result.review?.trustDisclosure).toBe(LOCAL_REVIEW_DISCLOSURE);
      expect(result.review?.trustDisclosure).toContain("identity not authenticated");
      expect(result.review?.trustDisclosure).toContain("Not an institutionally verified PKI credential");
    });

    it("elevates skills to practically_demonstrated only, never to independently_verified", () => {
      const profile = createMockProfile();
      const submission = createMockSubmission();
      profile.projectSubmissions[brief.id] = submission;

      const reviewPayload = {
        reviewId: "rev-valid-peer-001",
        projectId: brief.id,
        projectSlug: brief.slug,
        submissionFingerprint: submission.submissionFingerprint!,
        reviewerName: "Sunil Peer Lead",
        reviewerRole: "peer" as const,
        trustLevel: "unauthenticated_peer" as const,
        criteriaEvaluations: [
          {
            criterionId: brief.rubricCriteria![0].id, // visual-hierarchy
            passed: true,
            score: 85,
            feedback: "Code structure and styling inspected against rubric.",
          },
        ],
        overallDecision: "approved" as const,
        overallFeedback: "Artifact examined against the brief requirements.",
        artifactExamined: true,
        reviewedAt: new Date().toISOString(),
        isStale: false,
        trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
      };

      const { updatedProfile, promotedSkillIds } = applyReviewToProfile(profile, brief, reviewPayload);

      expect(promotedSkillIds).toContain("visual-hierarchy");
      const evidence = updatedProfile.skillEvidence["visual-hierarchy"];

      expect(evidence.state).toBe("practically_demonstrated");
      expect(evidence.state).not.toBe("independently_verified");
      expect(evidence.verificationLevel).toBe("artifact_examined");
      expect(evidence.unverifiedNotice).toContain("Unauthenticated local evidence");
    });

    it("strictly preserves pre-existing independently_verified credentials under non-erasure rule", () => {
      const profile = createMockProfile();
      const submission = createMockSubmission();
      profile.projectSubmissions[brief.id] = submission;

      // ux-research is already independently_verified in profile
      expect(profile.skillEvidence["ux-research"].state).toBe("independently_verified");

      // Peer review attempts to review ux-research with a lower score or peer role
      const reviewPayload = {
        reviewId: "rev-peer-conflict-002",
        projectId: brief.id,
        projectSlug: brief.slug,
        submissionFingerprint: submission.submissionFingerprint!,
        reviewerName: "Student Peer",
        reviewerRole: "peer" as const,
        trustLevel: "unauthenticated_peer" as const,
        criteriaEvaluations: [
          {
            criterionId: brief.rubricCriteria![2].id, // ux-research
            passed: true,
            score: 75,
            feedback: "Average UX research.",
          },
        ],
        overallDecision: "approved" as const,
        overallFeedback: "Average review feedback.",
        artifactExamined: true,
        reviewedAt: new Date().toISOString(),
        isStale: false,
        trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
      };

      const { updatedProfile, ignoredSkillIds } = applyReviewToProfile(profile, brief, reviewPayload);

      // Must be ignored because pre-existing credential is higher
      expect(ignoredSkillIds).toContain("ux-research");
      expect(updatedProfile.skillEvidence["ux-research"].state).toBe("independently_verified");
      expect(updatedProfile.skillEvidence["ux-research"].assessedScore).toBe(98);
      expect(updatedProfile.skillEvidence["ux-research"].sourceTitle).toContain("Accredited Proctored");
    });

    it("invalidates review packets when submission content or deliverables change (stale detection)", () => {
      const originalSubmission = createMockSubmission();
      const originalFingerprint = originalSubmission.submissionFingerprint;

      // Student later edits deliverables or repo URL
      const modifiedSubmission = createMockSubmission({
        repoOrDemoUrl: "https://github.com/aaroh-student/patient-portal-v2",
      });
      const newFingerprint = modifiedSubmission.submissionFingerprint;

      expect(newFingerprint).not.toBe(originalFingerprint);

      // Packet generated for original submission is imported against modified submission
      const candidateReview = {
        reviewId: "rev-original-003",
        projectId: brief.id,
        projectSlug: brief.slug,
        submissionFingerprint: originalFingerprint, // matches old, but not new
        reviewerName: "Mentor Lead",
        reviewerRole: "mentor",
        overallDecision: "approved",
        artifactExamined: true,
        criteriaEvaluations: [
          {
            criterionId: brief.rubricCriteria![0].id,
            passed: true,
            score: 90,
            feedback: "Looks good on old version.",
          },
        ],
      };

      const result = validateAndParseReviewPacket(candidateReview, modifiedSubmission, brief);
      expect(result.isValid).toBe(true);
      expect(result.isStale).toBe(true);
      expect(result.stalenessReason).toContain("mismatch");

      // Applying this stale review must NOT promote any skills
      const profile = createMockProfile();
      profile.projectSubmissions[brief.id] = modifiedSubmission;

      const applyResult = applyReviewToProfile(profile, brief, result.review!);
      expect(applyResult.isStale).toBe(true);
      expect(applyResult.promotedSkillIds.length).toBe(0);
      expect(applyResult.updatedProfile.skillEvidence["visual-hierarchy"].state).toBe("not_assessed");
    });
  });

  // =========================================================================
  // SECTION 2: Salary & CTC Mathematical Reconciliation Invariants
  // =========================================================================
  describe("2. Salary & CTC Mathematical Reconciliation Invariants", () => {
    it("mathematically reconciles the headline ₹20 LPA CTC components without double-counting", () => {
      const fixedBaseAnnual = 13_00_000;
      const employerRetirals = 1_00_000; // Employer PF + Gratuity
      const variableBonus = 1_00_000;
      const joiningBonusYear1 = 2_00_000;
      const nominalYear1StockVest = 3_00_000; // 25% of 12L grant

      const totalAnnualCTC =
        fixedBaseAnnual +
        employerRetirals +
        variableBonus +
        joiningBonusYear1 +
        nominalYear1StockVest;

      expect(totalAnnualCTC).toBe(20_00_000);
    });

    it("reconciles regular monthly cash take-home pay under New Tax Regime FY 2024-25 / AY 2025-26", () => {
      const annualGrossBase = 13_00_000;
      const monthlyGross = annualGrossBase / 12; // 1,08,333.33

      // Deductions
      const basicPayMonthly = 50_000; // 6,00,000 annual basic
      const employeePfMonthly = basicPayMonthly * 0.12; // 6,000
      const professionalTaxMonthly = 200;

      // Tax calculation under New Tax Regime (Section 115BAC)
      const standardDeduction = 75_000;
      const taxableIncome = annualGrossBase - standardDeduction; // 12,25,000

      // Slabs:
      // 0 - 3,00,000: Nil
      // 3,00,001 - 7,00,000 (4,00,000 @ 5%): 20,000
      // 7,00,001 - 10,00,000 (3,00,000 @ 10%): 30,000
      // 10,00,001 - 12,00,000 (2,00,000 @ 15%): 30,000
      // 12,00,001 - 12,25,000 (25,000 @ 20%): 5,000
      const baseTax = 20_000 + 30_000 + 30_000 + 5_000; // 85,000
      const cess = baseTax * 0.04; // 3,400
      const totalAnnualTDS = baseTax + cess; // 88,400
      const monthlyTDS = totalAnnualTDS / 12; // 7,366.67

      const totalMonthlyDeductions = employeePfMonthly + professionalTaxMonthly + monthlyTDS; // 13,566.67
      const netMonthlyTakeHome = monthlyGross - totalMonthlyDeductions; // 94,766.67

      expect(Math.round(netMonthlyTakeHome)).toBe(94767);
      expect(netMonthlyTakeHome).toBeGreaterThanOrEqual(92_000);
      expect(netMonthlyTakeHome).toBeLessThanOrEqual(96_000);
    });

    it("verifies that AI knowledge response provides the reconciled math and student protection rules", () => {
      const response = generateLocalGroundedResponse(
        [
          {
            role: "user",
            content: "What is the real entry-level salary package for developers in India? Is 20 LPA common?",
          },
        ],
        EMPTY_PROFILE
      );

      expect(response.content).toContain("Fixed Annual Gross Base Cash");
      expect(response.content).toContain("₹13,00,000");
      expect(response.content).toContain("₹20,00,000");
      expect(response.content).toContain("₹94,766");
      expect(response.content).toContain("Student Protection Rule");
      expect(response.content).toContain("Fixed Annual Base Gross Pay");
    });
  });

  // =========================================================================
  // SECTION 3: URL Sanitization & Project Evaluation Boundary Verification
  // =========================================================================
  describe("3. URL Sanitization & Project Evaluation Boundary Verification", () => {
    it("validateProjectUrl strictly rejects loopback, localhost, and RFC 1918 private IPv4/IPv6 networks", () => {
      expect(validateProjectUrl("http://localhost:3000").isValid).toBe(false);
      expect(validateProjectUrl("http://127.0.0.1:8080/exploit").isValid).toBe(false);
      expect(validateProjectUrl("http://[::1]:3000").isValid).toBe(false);
      expect(validateProjectUrl("http://192.168.1.1/admin").isValid).toBe(false);
      expect(validateProjectUrl("http://10.0.0.1/internal").isValid).toBe(false);
      expect(validateProjectUrl("http://172.16.0.1/dashboard").isValid).toBe(false);
    });

    it("validateProjectUrl rejects dangerous URI schemes and userinfo credentials", () => {
      expect(validateProjectUrl("javascript:alert(1)").isValid).toBe(false);
      expect(validateProjectUrl("data:text/html,<script>alert(1)</script>").isValid).toBe(false);
      expect(validateProjectUrl("https://admin:secret@github.com/repo").isValid).toBe(false);
    });

    it("validateProjectUrl accepts valid public HTTPS repository and demonstration URLs", () => {
      const gitResult = validateProjectUrl("https://github.com/aaroh-student/project");
      expect(gitResult.isValid).toBe(true);
      expect(gitResult.sanitizedUrl).toBe("https://github.com/aaroh-student/project");

      const demoResult = validateProjectUrl("https://my-demo-app.vercel.app/demo");
      expect(demoResult.isValid).toBe(true);
      expect(demoResult.sanitizedUrl).toBe("https://my-demo-app.vercel.app/demo");
    });

    it("sanitizeExternalUrl neutralizes dangerous XSS vectors and embedded credentials", () => {
      expect(sanitizeExternalUrl("javascript:alert(1)")).toBeNull();
      expect(sanitizeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
      expect(sanitizeExternalUrl("https://admin:secret@github.com/repo")).toBeNull();
      expect(sanitizeExternalUrl("https://github.com/aaroh-student/project")).toBe(
        "https://github.com/aaroh-student/project"
      );
    });
  });

  // =========================================================================
  // SECTION 4: Runtime Environment Invariants
  // =========================================================================
  describe("4. Runtime Environment Invariants", () => {
    it("runs on supported Node.js runtime (v20+)", () => {
      const nodeMajorVersion = parseInt(process.versions.node.split(".")[0], 10);
      expect(nodeMajorVersion).toBeGreaterThanOrEqual(20);
    });
  });
});
