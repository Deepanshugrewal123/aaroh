import { describe, it, expect, beforeEach } from "vitest";
import {
  computeSubmissionFingerprint,
  createReviewPacket,
  generateCompletedReview,
  validateAndParseReviewPacket,
  applyReviewToProfile,
} from "../lib/review-system";
import { PROJECT_BRIEFS } from "../lib/projects-data";
import {
  DEFAULT_GUEST_PROFILE,
  applyProjectSubmissionToProfile,
  generateInitialRoadmap,
} from "../lib/store";
import { ProjectSubmissionRecord, UserProfile } from "../lib/types";

describe("Phase 4A: Trusted Peer & Mentor Review Integrity Audit", () => {
  const brief = PROJECT_BRIEFS[0]; // Full-Stack Microservices Platform

  const sampleSubmission: ProjectSubmissionRecord = {
    projectId: brief.id,
    projectSlug: brief.slug,
    careerSlug: brief.careerSlug,
    repoOrDemoUrl: "https://github.com/aarav-student/fullstack-platform",
    reflection: "Architected microservices architecture using Node.js and Redis cache layer with graceful failure fallbacks.",
    checkedDeliverableIds: (brief.deliverables || []).map((d) => d.id),
    status: "evaluated",
    overallScore: 88,
    criteriaScores: (brief.rubricCriteria || []).map((c) => ({
      criterionId: c.id,
      title: c.title,
      associatedSkillId: c.associatedSkillId,
      score: 85,
      weight: c.weight,
      passed: true,
      feedback: "Attested requirements met.",
    })),
    upgradedSkillIds: (brief.rubricCriteria || []).map((c) => c.associatedSkillId),
    feedback: "Attested deliverables satisfy rubric.",
    actionableNextSteps: ["Proceed to peer review."],
    isArtifactInspected: false,
    verificationLimitationNotice: "Remote artifacts uninspected.",
    submittedAt: "2026-10-20T10:00:00.000Z",
    evaluatedAt: "2026-10-20T10:00:05.000Z",
  };

  beforeEach(() => {
    sampleSubmission.submissionFingerprint = computeSubmissionFingerprint(sampleSubmission);
  });

  // 1. Fingerprint Determinism & Invalidation
  describe("Submission Fingerprint Integrity", () => {
    it("generates deterministic fingerprint for identical inputs", () => {
      const fp1 = computeSubmissionFingerprint(sampleSubmission);
      const fp2 = computeSubmissionFingerprint({
        projectId: sampleSubmission.projectId,
        repoOrDemoUrl: sampleSubmission.repoOrDemoUrl,
        checkedDeliverableIds: [...sampleSubmission.checkedDeliverableIds],
        reflection: sampleSubmission.reflection,
      });
      expect(fp1).toBe(fp2);
      expect(fp1.startsWith("subfp_")).toBe(true);
    });

    it("order of deliverables does not alter fingerprint", () => {
      const fp1 = computeSubmissionFingerprint({
        ...sampleSubmission,
        checkedDeliverableIds: ["deliv-1", "deliv-2", "deliv-3"],
      });
      const fp2 = computeSubmissionFingerprint({
        ...sampleSubmission,
        checkedDeliverableIds: ["deliv-3", "deliv-1", "deliv-2"],
      });
      expect(fp1).toBe(fp2);
    });

    it("invalidates fingerprint when repository URL changes", () => {
      const fpOriginal = computeSubmissionFingerprint(sampleSubmission);
      const fpModified = computeSubmissionFingerprint({
        ...sampleSubmission,
        repoOrDemoUrl: "https://github.com/aarav-student/new-repo",
      });
      expect(fpOriginal).not.toBe(fpModified);
    });

    it("invalidates fingerprint when deliverables are modified", () => {
      const fpOriginal = computeSubmissionFingerprint(sampleSubmission);
      const fpModified = computeSubmissionFingerprint({
        ...sampleSubmission,
        checkedDeliverableIds: sampleSubmission.checkedDeliverableIds.slice(0, 1),
      });
      expect(fpOriginal).not.toBe(fpModified);
    });

    it("invalidates fingerprint when reflection is rewritten", () => {
      const fpOriginal = computeSubmissionFingerprint(sampleSubmission);
      const fpModified = computeSubmissionFingerprint({
        ...sampleSubmission,
        reflection: "Completely different rewrite of the architecture documentation.",
      });
      expect(fpOriginal).not.toBe(fpModified);
    });
  });

  // 2. Review Packet Creation & Export
  describe("Review Packet Export", () => {
    it("creates a well-formed portable review packet with schema version and rubrics", () => {
      const packet = createReviewPacket(sampleSubmission, brief, "Aarav Sharma");
      expect(packet.schemaVersion).toBe("1.0");
      expect(packet.type).toBe("aaroh_review_packet");
      expect(packet.studentName).toBe("Aarav Sharma");
      expect(packet.projectId).toBe(brief.id);
      expect(packet.submissionFingerprint).toBe(sampleSubmission.submissionFingerprint);
      expect(packet.rubricCriteria.length).toBeGreaterThan(0);
      expect(packet.deliverables.length).toBeGreaterThan(0);
    });
  });

  // 3. Validation & Malformed Input Handling
  describe("Review Packet Validation & Anti-Tampering", () => {
    it("rejects null, empty string, or non-object inputs", () => {
      expect(validateAndParseReviewPacket(null, sampleSubmission).isValid).toBe(false);
      expect(validateAndParseReviewPacket("", sampleSubmission).isValid).toBe(false);
      expect(validateAndParseReviewPacket("not a json string", sampleSubmission).isValid).toBe(false);
      expect(validateAndParseReviewPacket(12345, sampleSubmission).isValid).toBe(false);
    });

    it("rejects review with project ID mismatch", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Priya Reviewer",
        reviewerRole: "peer",
      });
      const tampered = { ...review, projectId: "other-project-id" };
      const res = validateAndParseReviewPacket(tampered, sampleSubmission);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("Project ID mismatch");
    });

    it("rejects reviewer with empty name", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "   ",
        reviewerRole: "peer",
      });
      const res = validateAndParseReviewPacket(review, sampleSubmission);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("Invalid reviewerName");
    });

    it("rejects invalid reviewer role or decision", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Dr. Mentor",
        reviewerRole: "peer",
      });
      const tamperedRole = { ...review, reviewerRole: "invalid_hacker_role" };
      expect(validateAndParseReviewPacket(tamperedRole, sampleSubmission).isValid).toBe(false);

      const tamperedDecision = { ...review, overallDecision: "rubber_stamped" };
      expect(validateAndParseReviewPacket(tamperedDecision, sampleSubmission).isValid).toBe(false);
    });

    it("safely clamps forged trust claims to unauthenticated local level", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Institutional Authority",
        reviewerRole: "mentor",
      });
      // Malicious or inflated packet claiming institutional proctored trust
      const inflated = { ...review, trustLevel: "institutional_proctored" };
      const res = validateAndParseReviewPacket(inflated, sampleSubmission);
      expect(res.isValid).toBe(true);
      expect(res.review?.trustLevel).toBe("unauthenticated_mentor");
      expect(res.review?.trustDisclosure).toContain("Local peer/mentor review attestation");
    });
  });

  // 4. Staleness Barrier
  describe("Staleness & Submission Mismatch Detection", () => {
    it("flags review as stale when submission fingerprint does not match", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Dev Mentor",
        reviewerRole: "mentor",
      });

      // Student subsequently modified their submission URL
      const modifiedSubmission: ProjectSubmissionRecord = {
        ...sampleSubmission,
        repoOrDemoUrl: "https://github.com/aarav-student/updated-v2",
        submissionFingerprint: computeSubmissionFingerprint({
          ...sampleSubmission,
          repoOrDemoUrl: "https://github.com/aarav-student/updated-v2",
        }),
      };

      const res = validateAndParseReviewPacket(review, modifiedSubmission);
      expect(res.isValid).toBe(true);
      expect(res.isStale).toBe(true);
      expect(res.stalenessReason).toContain("modified after this review");
    });

    it("does NOT promote skills if review is stale", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Dev Mentor",
        reviewerRole: "mentor",
      });
      review.submissionFingerprint = "subfp_old_outdated_hash";

      let profile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        projectSubmissions: { [brief.id]: sampleSubmission },
      };

      const result = applyReviewToProfile(profile, brief, review);
      expect(result.isStale).toBe(true);
      expect(result.promotedSkillIds.length).toBe(0);
      expect(result.updatedProfile.projectReviews?.[brief.id]?.isStale).toBe(true);
    });
  });

  // 5. Honest Taxonomy & Skill Promotion
  describe("Honest Evidence Promotion Boundary", () => {
    it("elevates skills to practically_demonstrated with verificationLevel = artifact_examined (NEVER independently_verified)", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Kavita Engineer",
        reviewerRole: "mentor",
        overallDecision: "approved",
        artifactExamined: true,
      });

      let profile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        projectSubmissions: { [brief.id]: sampleSubmission },
      };

      const result = applyReviewToProfile(profile, brief, review);
      expect(result.isStale).toBe(false);
      expect(result.promotedSkillIds.length).toBeGreaterThan(0);

      // Verify each promoted skill has honest taxonomy
      result.promotedSkillIds.forEach((skillId) => {
        const ev = result.updatedProfile.skillEvidence[skillId];
        expect(ev.state).toBe("practically_demonstrated");
        expect(ev.verificationLevel).toBe("artifact_examined");
        expect(ev.isArtifactInspected).toBe(true);
        expect(ev.reviewerName).toBe("Kavita Engineer");
        expect(ev.reviewerRole).toBe("mentor");
        expect(ev.unverifiedNotice).toContain("Unauthenticated local evidence");
        // Must NEVER claim independently_verified
        expect(ev.state).not.toBe("independently_verified");
      });
    });

    it("does not elevate skills if reviewer attests artifacts were NOT examined", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Quick Reviewer",
        reviewerRole: "peer",
        overallDecision: "approved",
        artifactExamined: false, // Artifacts were not examined!
      });

      let profile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        projectSubmissions: { [brief.id]: sampleSubmission },
      };

      const result = applyReviewToProfile(profile, brief, review);
      expect(result.promotedSkillIds.length).toBe(0);
    });

    it("does not elevate skills if reviewer requested changes", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Strict Mentor",
        reviewerRole: "mentor",
        overallDecision: "changes_requested",
        artifactExamined: true,
      });

      let profile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        projectSubmissions: { [brief.id]: sampleSubmission },
      };

      const result = applyReviewToProfile(profile, brief, review);
      expect(result.promotedSkillIds.length).toBe(0);
    });
  });

  // 6. Non-Erasure Invariants
  describe("Non-Erasure & Evidence Preservation", () => {
    it("never downgrades an existing independently_verified skill evidence", () => {
      const targetSkillId = brief.rubricCriteria![0].associatedSkillId;

      let profile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        skillEvidence: {
          ...DEFAULT_GUEST_PROFILE.skillEvidence,
          [targetSkillId]: {
            skillId: targetSkillId,
            state: "independently_verified",
            updatedAt: "2026-09-01T00:00:00.000Z",
            sourceTitle: "External Proctored Hackathon",
            verificationLevel: "independently_verified",
          },
        },
        projectSubmissions: { [brief.id]: sampleSubmission },
      };

      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Peer Reviewer",
        reviewerRole: "peer",
        overallDecision: "approved",
      });

      const result = applyReviewToProfile(profile, brief, review);
      expect(result.updatedProfile.skillEvidence[targetSkillId].state).toBe("independently_verified");
      expect(result.ignoredSkillIds).toContain(targetSkillId);
    });

    it("a failed rubric criterion in a review does not demote existing student evidence", () => {
      const firstCrit = brief.rubricCriteria![0];
      const targetSkillId = firstCrit.associatedSkillId;

      let profile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        skillEvidence: {
          ...DEFAULT_GUEST_PROFILE.skillEvidence,
          [targetSkillId]: {
            skillId: targetSkillId,
            state: "student_attested",
            assessedScore: 80,
            updatedAt: "2026-10-19T00:00:00.000Z",
          },
        },
        projectSubmissions: { [brief.id]: sampleSubmission },
      };

      // Reviewer marks this specific criterion as failed
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Peer Reviewer",
        reviewerRole: "peer",
        criteriaScores: {
          [firstCrit.id]: { passed: false, score: 40, feedback: "Missing unit test coverage." },
        },
      });

      const result = applyReviewToProfile(profile, brief, review);
      // Existing evidence should NOT be deleted or reset to not_assessed
      expect(result.updatedProfile.skillEvidence[targetSkillId].state).toBe("student_attested");
      expect(result.updatedProfile.skillEvidence[targetSkillId].assessedScore).toBe(80);
      expect(result.ignoredSkillIds).toContain(targetSkillId);
    });
  });

  // 7. Replay Idempotency & Code Updates
  describe("Replay Idempotency & Subsequent Submissions", () => {
    it("importing the same review twice produces identical idempotent state", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Mentor Arun",
        reviewerRole: "mentor",
      });

      const profile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        projectSubmissions: { [brief.id]: sampleSubmission },
      };

      const firstPass = applyReviewToProfile(profile, brief, review);
      const secondPass = applyReviewToProfile(firstPass.updatedProfile, brief, review);

      expect(firstPass.updatedProfile.projectReviews?.[brief.id]?.reviewId).toBe(
        secondPass.updatedProfile.projectReviews?.[brief.id]?.reviewId
      );
      expect(Object.keys(secondPass.updatedProfile.projectReviews || {}).length).toBe(1);
    });

    it("submitting an updated project deliverable subsequently invalidates the prior review as stale", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Mentor Arun",
        reviewerRole: "mentor",
      });

      let profile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        projectSubmissions: { [brief.id]: sampleSubmission },
      };

      const reviewedResult = applyReviewToProfile(profile, brief, review);
      expect(reviewedResult.updatedProfile.projectReviews?.[brief.id]?.isStale).toBe(false);

      // Student submits a revised repository link
      const revisedInput = {
        repoOrDemoUrl: "https://github.com/aarav-student/revised-platform",
        checkedDeliverableIds: sampleSubmission.checkedDeliverableIds,
        reflection: sampleSubmission.reflection,
      };

      const { updatedProfile } = applyProjectSubmissionToProfile(
        reviewedResult.updatedProfile,
        brief,
        revisedInput
      );

      // The attached review should now be automatically marked as stale!
      expect(updatedProfile.projectReviews?.[brief.id]?.isStale).toBe(true);
      expect(updatedProfile.projectSubmissions[brief.id].review?.isStale).toBe(true);
    });
  });

  // 8. Cross-Module Roadmap Milestone 4 Synchronization
  describe("Roadmap Milestone 4 Synchronization", () => {
    it("completes Task 4 on roadmap when an approved, non-stale review exists", () => {
      const review = generateCompletedReview(brief, sampleSubmission, {
        reviewerName: "Mentor Maya",
        reviewerRole: "mentor",
        overallDecision: "approved",
        artifactExamined: true,
      });

      const roadmap = generateInitialRoadmap(
        brief.careerSlug,
        8,
        false,
        [],
        { [brief.id]: sampleSubmission },
        { [brief.id]: review }
      );

      const task4 = roadmap.tasks.find((t) => t.id === "task-4");
      expect(task4).toBeDefined();
      expect(task4?.status).toBe("completed");
      expect(task4?.submittedEvidence?.notes).toContain("Mentor Maya");
    });

    it("keeps Task 4 available (not completed) if project is evaluated but has no review", () => {
      const roadmap = generateInitialRoadmap(
        brief.careerSlug,
        8,
        false,
        [],
        { [brief.id]: sampleSubmission },
        {}
      );

      const task4 = roadmap.tasks.find((t) => t.id === "task-4");
      expect(task4).toBeDefined();
      expect(task4?.status).toBe("available");
    });
  });
});
