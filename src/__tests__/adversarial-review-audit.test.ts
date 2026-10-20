import { describe, it, expect } from "vitest";
import {
  computeSubmissionFingerprint,
  createReviewPacket,
  validateAndParseReviewPacket,
  applyReviewToProfile,
  generateCompletedReview,
  LOCAL_REVIEW_DISCLOSURE,
  sha256,
} from "@/lib/review-system";
import { applyProjectSubmissionToProfile, generateInitialRoadmap } from "@/lib/store";
import { PROJECT_BRIEFS } from "@/lib/projects-data";
import { sanitizeExternalUrl } from "@/lib/utils";
import { UserProfile, ProjectSubmissionRecord, ProjectReviewRecord } from "@/lib/types";

describe("Phase 4B: Adversarial Trust & Evidence Integrity Audit", () => {
  const brief = PROJECT_BRIEFS[0]; // proj-1 ("accessible-patient-portal")
  // brief rubric criteria:
  // [0]: "p1-crit-1" -> "visual-hierarchy"
  // [1]: "p1-crit-2" -> "ui-prototyping"
  // [2]: "p1-crit-3" -> "ux-research"

  const createBaseProfile = (): UserProfile => ({
    id: "adversarial-student",
    name: "Adversarial Tester",
    stage: "first_second_year",
    discipline: "arts_design",
    selectedWorkStyles: ["analytical", "practical_hands_on"],
    interests: ["design-systems"],
    weeklyCapacityHours: 10,
    isExamMode: false,
    targetCareerSlug: brief.careerSlug,
    targetCareerHypotheses: [brief.careerSlug],
    savedCareerSlugs: [brief.careerSlug],
    completedTrialIds: [],
    trialReflections: {},
    projectSubmissions: {},
    projectReviews: {},
    skillEvidence: {
      "visual-hierarchy": {
        skillId: "visual-hierarchy",
        state: "not_assessed",
        updatedAt: new Date().toISOString(),
      },
      "ui-prototyping": {
        skillId: "ui-prototyping",
        state: "coursework",
        sourceTitle: "Design Lab 101",
        assessedScore: 80,
        updatedAt: new Date().toISOString(),
      },
      "ux-research": {
        skillId: "ux-research",
        state: "independently_verified",
        sourceTitle: "Accredited Proctored Certification",
        assessedScore: 95,
        updatedAt: new Date().toISOString(),
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const createMockSubmission = (overrides?: Partial<ProjectSubmissionRecord>): ProjectSubmissionRecord => {
    const repoOrDemoUrl = overrides?.repoOrDemoUrl || "https://github.com/student/repo";
    const checkedDeliverableIds = overrides?.checkedDeliverableIds || ["p1-deliv-1"];
    const reflection = overrides?.reflection || "Valid architecture reflection of sufficient length for evaluation standards.";
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
      overallScore: 85,
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

  // SCENARIO 1: Deterministic Digest Canonicalization & Formatting Invariance
  describe("Scenario 1: Deterministic Canonicalization & Formatting Invariance", () => {
    it("produces identical fingerprints regardless of deliverable ID array ordering", () => {
      const fp1 = computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl: "https://github.com/test/repo",
        checkedDeliverableIds: ["p1-deliv-1", "p1-deliv-2", "p1-deliv-3"],
        reflection: "Consistent architectural reflection.",
      });

      const fp2 = computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl: "https://github.com/test/repo",
        checkedDeliverableIds: ["p1-deliv-3", "p1-deliv-1", "p1-deliv-2"],
        reflection: "Consistent architectural reflection.",
      });

      expect(fp1).toBe(fp2);
      expect(fp1).toMatch(/^subfp_sha256_[0-9a-f]{64}$/);
    });

    it("normalizes CRLF line endings, trailing spaces, and multiple internal spaces", () => {
      const fpUnix = computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl: "https://github.com/test/repo",
        checkedDeliverableIds: ["p1-deliv-1"],
        reflection: "Line 1\nLine 2 with internal   spacing.",
      });

      const fpWindows = computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl: "https://github.com/test/repo",
        checkedDeliverableIds: ["p1-deliv-1"],
        reflection: "Line 1\r\nLine 2 with internal   spacing.  \r\n",
      });

      expect(fpUnix).toBe(fpWindows);
    });

    it("normalizes URL schemes, hosts, and trailing slashes", () => {
      const fp1 = computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl: "https://GITHUB.COM/student/project/",
        checkedDeliverableIds: ["p1-deliv-1"],
        reflection: "Reflection",
      });

      const fp2 = computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl: "https://github.com/student/project",
        checkedDeliverableIds: ["p1-deliv-1"],
        reflection: "Reflection",
      });

      expect(fp1).toBe(fp2);
    });

    it("normalizes Unicode using canonical NFC decomposition/composition", () => {
      const fpDecomposed = computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl: "https://github.com/test/repo",
        checkedDeliverableIds: ["p1-deliv-1"],
        reflection: "Resume\u0301 with cafe\u0301 architecture.",
      });

      const fpPrecomposed = computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl: "https://github.com/test/repo",
        checkedDeliverableIds: ["p1-deliv-1"],
        reflection: "Resum\u00e9 with caf\u00e9 architecture.",
      });

      expect(fpDecomposed).toBe(fpPrecomposed);
    });
  });

  // SCENARIO 2: Tamper Detection & Collision Resistance
  describe("Scenario 2: Tamper Detection & Collision Resistance", () => {
    it("produces a distinct 64-character SHA-256 hex digest when any input changes", () => {
      const baseline = computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl: "https://github.com/student/repo",
        checkedDeliverableIds: ["p1-deliv-1"],
        reflection: "Original architecture reflection.",
      });

      const alteredUrl = computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl: "https://github.com/student/repo2",
        checkedDeliverableIds: ["p1-deliv-1"],
        reflection: "Original architecture reflection.",
      });

      const alteredReflection = computeSubmissionFingerprint({
        projectId: brief.id,
        repoOrDemoUrl: "https://github.com/student/repo",
        checkedDeliverableIds: ["p1-deliv-1"],
        reflection: "Altered architecture reflection.",
      });

      expect(baseline).not.toBe(alteredUrl);
      expect(baseline).not.toBe(alteredReflection);
      expect(baseline.length).toBe("subfp_sha256_".length + 64);
    });

    it("sha256 algorithm produces known standard test vectors", () => {
      expect(sha256("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
      expect(sha256("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    });
  });

  // SCENARIO 3: Forged / Arbitrary Rubric Criteria Rejection
  describe("Scenario 3: Forged & Arbitrary Rubric Criteria Rejection", () => {
    it("rejects review packets containing criteria IDs not defined in the project brief", () => {
      const submission = createMockSubmission();

      const forgedPacket = {
        type: "aaroh_review_packet",
        schemaVersion: "1.0",
        review: {
          reviewId: "rev_forged_123",
          projectId: brief.id,
          projectSlug: brief.slug,
          submissionFingerprint: submission.submissionFingerprint,
          reviewerName: "Forging Reviewer",
          reviewerRole: "peer",
          overallDecision: "approved",
          artifactExamined: true,
          criteriaEvaluations: [
            {
              criterionId: "fake-nonexistent-criterion",
              passed: true,
              score: 99,
              feedback: "Trying to forge credit for an unmapped skill",
            },
          ],
        },
      };

      const result = validateAndParseReviewPacket(forgedPacket, submission, brief);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Unknown rubric criterion");
    });

    it("deduplicates repeated criterion evaluations safely without scoring inflation", () => {
      const submission = createMockSubmission();
      const validCritId = brief.rubricCriteria![0].id;
      const duplicatePacket = {
        type: "aaroh_review_packet",
        schemaVersion: "1.0",
        review: {
          reviewId: "rev_dup_123",
          projectId: brief.id,
          projectSlug: brief.slug,
          submissionFingerprint: submission.submissionFingerprint,
          reviewerName: "Reviewer A",
          reviewerRole: "peer",
          overallDecision: "approved",
          artifactExamined: true,
          criteriaEvaluations: [
            { criterionId: validCritId, passed: true, score: 90, feedback: "Good" },
            { criterionId: validCritId, passed: true, score: 90, feedback: "Duplicate entry" },
          ],
        },
      };

      const result = validateAndParseReviewPacket(duplicatePacket, submission, brief);
      expect(result.isValid).toBe(true);
      expect(result.review?.criteriaEvaluations.length).toBe(1);
    });
  });

  // SCENARIO 4: Approved Decision without Passing Criteria Rejection
  describe("Scenario 4: Approved Decision Consistency", () => {
    it("rejects an 'approved' review where all rubric criteria are failed", () => {
      const submission = createMockSubmission();

      const inconsistentPacket = {
        type: "aaroh_review_packet",
        schemaVersion: "1.0",
        review: {
          reviewId: "rev_inconsistent_123",
          projectId: brief.id,
          projectSlug: brief.slug,
          submissionFingerprint: submission.submissionFingerprint,
          reviewerName: "Confused Reviewer",
          reviewerRole: "peer",
          overallDecision: "approved",
          artifactExamined: true,
          criteriaEvaluations: [
            {
              criterionId: brief.rubricCriteria![0].id,
              passed: false,
              score: 30,
              feedback: "Completely failed.",
            },
          ],
        },
      };

      const result = validateAndParseReviewPacket(inconsistentPacket, submission, brief);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("no rubric criteria were evaluated as passed");
    });
  });

  // SCENARIO 5: Oversized Payloads & Malformed JSON Defense
  describe("Scenario 5: Oversized Payloads & Input Hardening", () => {
    it("gracefully rejects null, undefined, primitive strings, and non-object inputs", () => {
      const submission: any = { projectId: brief.id };
      expect(validateAndParseReviewPacket(null, submission).isValid).toBe(false);
      expect(validateAndParseReviewPacket(undefined, submission).isValid).toBe(false);
      expect(validateAndParseReviewPacket("not a json object", submission).isValid).toBe(false);
      expect(validateAndParseReviewPacket(12345, submission).isValid).toBe(false);
      expect(validateAndParseReviewPacket([], submission).isValid).toBe(false);
    });

    it("rejects review packets with oversized criteria arrays (> 20 entries)", () => {
      const submission: any = { projectId: brief.id };
      const oversizedPacket = {
        type: "aaroh_review_packet",
        schemaVersion: "1.0",
        review: {
          reviewId: "rev_oversized_123",
          projectId: brief.id,
          reviewerName: "Reviewer",
          reviewerRole: "peer",
          overallDecision: "approved",
          criteriaEvaluations: new Array(25).fill({ criterionId: "c", passed: true, score: 80 }),
        },
      };

      const result = validateAndParseReviewPacket(oversizedPacket, submission);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("exceeds maximum of 20 criteria");
    });
  });

  // SCENARIO 6: Stale Review Packet Non-Elevation
  describe("Scenario 6: Stale Review Packet Non-Elevation", () => {
    it("flags an outdated review packet as stale and does NOT promote skills", () => {
      const profile = createBaseProfile();

      const currentSubmission = createMockSubmission({
        repoOrDemoUrl: "https://github.com/student/current-version",
      });

      profile.projectSubmissions[brief.id] = currentSubmission;

      const staleReview: ProjectReviewRecord = {
        reviewId: "rev_stale_999",
        projectId: brief.id,
        projectSlug: brief.slug,
        submissionFingerprint: "subfp_sha256_0000000000000000000000000000000000000000000000000000000000000000",
        reviewerName: "Past Reviewer",
        reviewerRole: "mentor",
        trustLevel: "unauthenticated_mentor",
        overallDecision: "approved",
        artifactExamined: true,
        criteriaEvaluations: [
          {
            criterionId: brief.rubricCriteria![0].id,
            passed: true,
            score: 95,
            feedback: "Looks good on old version",
          },
        ],
        overallFeedback: "Great job on previous build",
        reviewedAt: new Date().toISOString(),
        isStale: false,
        trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
      };

      const { updatedProfile, promotedSkillIds, isStale } = applyReviewToProfile(
        profile,
        brief,
        staleReview
      );

      expect(isStale).toBe(true);
      expect(promotedSkillIds.length).toBe(0);
      expect(updatedProfile.skillEvidence["visual-hierarchy"].state).toBe("not_assessed");
    });
  });

  // SCENARIO 7: Active Valid Review Protection Against Stale Overwrite
  describe("Scenario 7: Active Valid Review Overwrite Defense", () => {
    it("blocks an incoming stale review packet from wiping out an active valid review", () => {
      const profile = createBaseProfile();

      const validSubmission = createMockSubmission({
        repoOrDemoUrl: "https://github.com/student/active-repo",
      });

      profile.projectSubmissions[brief.id] = validSubmission;

      const activeValidReview: ProjectReviewRecord = {
        reviewId: "rev_active_valid",
        projectId: brief.id,
        projectSlug: brief.slug,
        submissionFingerprint: validSubmission.submissionFingerprint!,
        reviewerName: "Senior Mentor",
        reviewerRole: "mentor",
        trustLevel: "unauthenticated_mentor",
        overallDecision: "approved",
        artifactExamined: true,
        criteriaEvaluations: [
          {
            criterionId: brief.rubricCriteria![0].id,
            passed: true,
            score: 95,
            feedback: "Verified live system.",
          },
        ],
        overallFeedback: "Solid implementation.",
        reviewedAt: new Date().toISOString(),
        isStale: false,
        trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
      };

      profile.projectReviews = {
        [brief.id]: activeValidReview,
      };

      const incomingStaleReview: ProjectReviewRecord = {
        reviewId: "rev_old_replay",
        projectId: brief.id,
        projectSlug: brief.slug,
        submissionFingerprint: "subfp_sha256_deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        reviewerName: "Replay Reviewer",
        reviewerRole: "peer",
        trustLevel: "unauthenticated_peer",
        overallDecision: "changes_requested",
        artifactExamined: false,
        criteriaEvaluations: [],
        overallFeedback: "Old feedback.",
        reviewedAt: new Date().toISOString(),
        isStale: false,
        trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
      };

      const result = applyReviewToProfile(profile, brief, incomingStaleReview);

      expect(result.error).toContain("Cannot overwrite active valid review");
      expect(profile.projectReviews[brief.id].reviewId).toBe("rev_active_valid");
      expect(profile.projectReviews[brief.id].reviewerName).toBe("Senior Mentor");
    });
  });

  // SCENARIO 8: Scoped Skill Reversion on Submission Modification
  describe("Scenario 8: Scoped Skill Reversion on Code Change", () => {
    it("demotes skills elevated by a superseded review back to student_attested when submission changes", () => {
      let profile = createBaseProfile();

      // 1. Initial submission
      const sub1Input = {
        repoOrDemoUrl: "https://github.com/student/v1",
        checkedDeliverableIds: ["p1-deliv-1", "p1-deliv-2", "p1-deliv-3", "p1-deliv-4", "p1-deliv-5"],
        reflection: "Initial architecture reflection explaining design trade-offs and accessibility.",
      };
      const initialStep = applyProjectSubmissionToProfile(profile, brief, sub1Input);
      profile = initialStep.updatedProfile;

      // 2. Peer review elevates visual-hierarchy
      const reviewPacket = generateCompletedReview(
        brief,
        profile.projectSubmissions[brief.id],
        {
          reviewerName: "Sanjay Peer",
          reviewerRole: "peer",
          overallDecision: "approved",
          artifactExamined: true,
          overallFeedback: "Examined prototype and verified visual hierarchy and contrast.",
        }
      );

      const reviewStep = applyReviewToProfile(profile, brief, reviewPacket);
      profile = reviewStep.updatedProfile;

      expect(profile.skillEvidence["visual-hierarchy"].state).toBe("practically_demonstrated");
      expect(profile.skillEvidence["visual-hierarchy"].reviewerName).toBe("Sanjay Peer");

      // 3. Student pushes code modification and updates submission with evaluated reflection
      const sub2Input = {
        repoOrDemoUrl: "https://github.com/student/v2-refactor",
        checkedDeliverableIds: ["p1-deliv-1", "p1-deliv-2", "p1-deliv-3", "p1-deliv-4", "p1-deliv-5"],
        reflection:
          "Refactored codebase with new accessibility and color themes. Improved touch targets across all mobile breakpoints and updated WCAG contrast ratios to exceed requirements.",
      };

      const updateStep = applyProjectSubmissionToProfile(profile, brief, sub2Input);
      profile = updateStep.updatedProfile;

      expect(updateStep.evaluation.review?.isStale).toBe(true);

      // The elevated skill MUST be reverted back to student_attested
      const evidence = profile.skillEvidence["visual-hierarchy"];
      expect(evidence.state).toBe("student_attested");
      expect(evidence.reviewerName).toBeUndefined();
      expect(evidence.unverifiedNotice).toContain("superseded by subsequent code modifications");
    });
  });

  // SCENARIO 9: Institutional Credential Non-Erasure
  describe("Scenario 9: Institutional Credential Non-Erasure", () => {
    it("never demotes an independently_verified credential when reviews fail or become stale", () => {
      let profile = createBaseProfile();

      expect(profile.skillEvidence["ux-research"].state).toBe("independently_verified");

      const subInput = {
        repoOrDemoUrl: "https://github.com/student/repo",
        checkedDeliverableIds: ["p1-deliv-1", "p1-deliv-2", "p1-deliv-3", "p1-deliv-4", "p1-deliv-5"],
        reflection: "Architecture reflection covering accessibility research.",
      };
      const subStep = applyProjectSubmissionToProfile(profile, brief, subInput);
      profile = subStep.updatedProfile;

      expect(profile.skillEvidence["ux-research"].state).toBe("independently_verified");

      const badReview: ProjectReviewRecord = {
        reviewId: "rev_critic_1",
        projectId: brief.id,
        projectSlug: brief.slug,
        submissionFingerprint: profile.projectSubmissions[brief.id].submissionFingerprint!,
        reviewerName: "Harsh Critic",
        reviewerRole: "peer",
        trustLevel: "unauthenticated_peer",
        overallDecision: "changes_requested",
        artifactExamined: true,
        criteriaEvaluations: [
          {
            criterionId: brief.rubricCriteria![2].id, // ux-research
            passed: false,
            score: 20,
            feedback: "Did not like research.",
          },
        ],
        overallFeedback: "Needs total rewrite.",
        reviewedAt: new Date().toISOString(),
        isStale: false,
        trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
      };

      const reviewStep = applyReviewToProfile(profile, brief, badReview);
      profile = reviewStep.updatedProfile;

      expect(profile.skillEvidence["ux-research"].state).toBe("independently_verified");
      expect(profile.skillEvidence["ux-research"].sourceTitle).toBe(
        "Accredited Proctored Certification"
      );
    });
  });

  // SCENARIO 10: Hierarchical Role Preservation (Mentor > Peer)
  describe("Scenario 10: Hierarchical Reviewer Role Preservation", () => {
    it("prevents subsequent peer reviews from demoting mentor reviewer identity", () => {
      let profile = createBaseProfile();

      const subInput = {
        repoOrDemoUrl: "https://github.com/student/repo",
        checkedDeliverableIds: ["p1-deliv-1", "p1-deliv-2", "p1-deliv-3", "p1-deliv-4", "p1-deliv-5"],
        reflection: "Detailed reflection on UI prototyping and interaction design.",
      };
      const subStep = applyProjectSubmissionToProfile(profile, brief, subInput);
      profile = subStep.updatedProfile;

      // 1. Mentor review elevates ui-prototyping
      const mentorReview: ProjectReviewRecord = {
        reviewId: "rev_mentor_42",
        projectId: brief.id,
        projectSlug: brief.slug,
        submissionFingerprint: profile.projectSubmissions[brief.id].submissionFingerprint!,
        reviewerName: "Principal Designer Maya",
        reviewerRole: "mentor",
        trustLevel: "unauthenticated_mentor",
        overallDecision: "approved",
        artifactExamined: true,
        criteriaEvaluations: [
          {
            criterionId: brief.rubricCriteria![1].id, // ui-prototyping
            passed: true,
            score: 95,
            feedback: "Excellent Figma prototyping.",
          },
        ],
        overallFeedback: "Mentor approved.",
        reviewedAt: new Date().toISOString(),
        isStale: false,
        trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
      };

      const step1 = applyReviewToProfile(profile, brief, mentorReview);
      profile = step1.updatedProfile;

      expect(profile.skillEvidence["ui-prototyping"].reviewerRole).toBe("mentor");
      expect(profile.skillEvidence["ui-prototyping"].reviewerName).toBe("Principal Designer Maya");

      // 2. Subsequent peer review on the same submission
      const peerReview: ProjectReviewRecord = {
        reviewId: "rev_peer_43",
        projectId: brief.id,
        projectSlug: brief.slug,
        submissionFingerprint: profile.projectSubmissions[brief.id].submissionFingerprint!,
        reviewerName: "Junior Peer",
        reviewerRole: "peer",
        trustLevel: "unauthenticated_peer",
        overallDecision: "approved",
        artifactExamined: true,
        criteriaEvaluations: [
          {
            criterionId: brief.rubricCriteria![1].id,
            passed: true,
            score: 85,
            feedback: "Looks good to me too.",
          },
        ],
        overallFeedback: "Peer approved.",
        reviewedAt: new Date().toISOString(),
        isStale: false,
        trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
      };

      const step2 = applyReviewToProfile(profile, brief, peerReview);
      profile = step2.updatedProfile;

      expect(profile.skillEvidence["ui-prototyping"].reviewerRole).toBe("mentor");
      expect(profile.skillEvidence["ui-prototyping"].reviewerName).toBe("Principal Designer Maya");
    });
  });

  // SCENARIO 11: Roadmap Task 4 Reopening on Submission Invalidation
  describe("Scenario 11: Roadmap Task 4 Invalidation & Reopening", () => {
    it("initializes Task 4 as available/locked and auto-completes only when valid review exists", () => {
      const targetCareerSlug = brief.careerSlug;
      const subFingerprint = "subfp_sha256_mock123";

      const validSubmission = createMockSubmission({
        submissionFingerprint: subFingerprint,
      });

      const validReview: ProjectReviewRecord = {
        reviewId: "rev_valid_1",
        projectId: brief.id,
        projectSlug: brief.slug,
        submissionFingerprint: subFingerprint,
        reviewerName: "Mentor Arun",
        reviewerRole: "mentor",
        trustLevel: "unauthenticated_mentor",
        overallDecision: "approved",
        artifactExamined: true,
        criteriaEvaluations: [
          {
            criterionId: brief.rubricCriteria![0].id,
            passed: true,
            score: 90,
            feedback: "Verified",
          },
        ],
        overallFeedback: "Approved",
        reviewedAt: new Date().toISOString(),
        isStale: false,
        trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
      };

      const roadmapWithReview = generateInitialRoadmap(
        targetCareerSlug,
        10,
        false,
        [],
        { [brief.id]: validSubmission },
        { [brief.id]: validReview }
      );

      const task4 = roadmapWithReview.tasks.find((t) => t.id === "task-4");
      expect(task4?.status).toBe("completed");

      const staleReview: ProjectReviewRecord = {
        ...validReview,
        isStale: true,
      };

      const roadmapWithStaleReview = generateInitialRoadmap(
        targetCareerSlug,
        10,
        false,
        [],
        { [brief.id]: validSubmission },
        { [brief.id]: staleReview }
      );

      const task4Stale = roadmapWithStaleReview.tasks.find((t) => t.id === "task-4");
      expect(task4Stale?.status).not.toBe("completed");
    });
  });

  // SCENARIO 12: Roadmap Task 4 Isolation Across Careers
  describe("Scenario 12: Cross-Career Task 4 Isolation", () => {
    it("does not complete Task 4 for the active roadmap when review belongs to a different career", () => {
      const otherBrief = PROJECT_BRIEFS.find((b) => b.careerSlug !== brief.careerSlug)!;
      expect(otherBrief).toBeDefined();

      const otherSubmission: ProjectSubmissionRecord = {
        projectId: otherBrief.id,
        projectSlug: otherBrief.slug,
        careerSlug: otherBrief.careerSlug,
        repoOrDemoUrl: "https://github.com/student/other",
        checkedDeliverableIds: ["deliv-1"],
        reflection: "Other reflection",
        status: "evaluated",
        overallScore: 85,
        criteriaScores: [],
        upgradedSkillIds: [],
        feedback: "Other submission",
        actionableNextSteps: [],
        isArtifactInspected: false,
        verificationLimitationNotice: "Uninspected",
        submittedAt: new Date().toISOString(),
        evaluatedAt: new Date().toISOString(),
        submissionFingerprint: "subfp_sha256_other",
      };

      const otherReview: ProjectReviewRecord = {
        reviewId: "rev_other_career",
        projectId: otherBrief.id,
        projectSlug: otherBrief.slug,
        submissionFingerprint: "subfp_sha256_other",
        reviewerName: "Other Reviewer",
        reviewerRole: "peer",
        trustLevel: "unauthenticated_peer",
        overallDecision: "approved",
        artifactExamined: true,
        criteriaEvaluations: [
          {
            criterionId: otherBrief.rubricCriteria?.[0]?.id || "crit-1",
            passed: true,
            score: 85,
            feedback: "Verified",
          },
        ],
        overallFeedback: "Other career approved",
        reviewedAt: new Date().toISOString(),
        isStale: false,
        trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
      };

      const roadmap = generateInitialRoadmap(
        brief.careerSlug,
        10,
        false,
        [],
        { [otherBrief.id]: otherSubmission },
        { [otherBrief.id]: otherReview }
      );

      const task4 = roadmap.tasks.find((t) => t.id === "task-4");
      expect(task4?.status).not.toBe("completed");
    });
  });

  // SCENARIO 13: XSS Vector Neutralization in sanitizeExternalUrl
  describe("Scenario 13: XSS Vector Neutralization", () => {
    it("neutralizes dangerous URI schemes including javascript:, data:, and file:", () => {
      expect(sanitizeExternalUrl("javascript:alert(1)")).toBeNull();
      expect(sanitizeExternalUrl("JAVASCRIPT:alert(document.cookie)")).toBeNull();
      expect(sanitizeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
      expect(sanitizeExternalUrl("file:///etc/passwd")).toBeNull();
      expect(sanitizeExternalUrl("vbscript:msgbox(1)")).toBeNull();
    });

    it("rejects embedded user credentials in URLs", () => {
      expect(sanitizeExternalUrl("https://admin:password@attacker.com/evil")).toBeNull();
      expect(sanitizeExternalUrl("http://user@evil.com")).toBeNull();
    });

    it("safely accepts standard http and https URLs", () => {
      expect(sanitizeExternalUrl("https://github.com/user/repo")).toBe("https://github.com/user/repo");
      expect(sanitizeExternalUrl("http://localhost:3000/demo")).toBe("http://localhost:3000/demo");
      expect(sanitizeExternalUrl("https://my-demo.vercel.app/test?query=1")).toBe(
        "https://my-demo.vercel.app/test?query=1"
      );
    });
  });

  // SCENARIO 14: Non-Assessed / Failed Criteria Isolation
  describe("Scenario 14: Non-Assessed & Failed Criteria Isolation", () => {
    it("promotes only skills whose associated criteria passed, leaving failed criteria untouched", () => {
      const profile = createBaseProfile();

      const subInput = {
        repoOrDemoUrl: "https://github.com/student/repo",
        checkedDeliverableIds: ["p1-deliv-1", "p1-deliv-2", "p1-deliv-3", "p1-deliv-4", "p1-deliv-5"],
        reflection: "Detailed reflection on visual hierarchy and interaction models.",
      };
      const subStep = applyProjectSubmissionToProfile(profile, brief, subInput);
      const activeProfile = subStep.updatedProfile;

      // Pass criterion 0 (visual-hierarchy), fail criterion 1 (ui-prototyping)
      const review: ProjectReviewRecord = {
        reviewId: "rev_split_1",
        projectId: brief.id,
        projectSlug: brief.slug,
        submissionFingerprint: activeProfile.projectSubmissions[brief.id].submissionFingerprint!,
        reviewerName: "Selective Reviewer",
        reviewerRole: "peer",
        trustLevel: "unauthenticated_peer",
        overallDecision: "approved",
        artifactExamined: true,
        criteriaEvaluations: [
          {
            criterionId: brief.rubricCriteria![0].id, // visual-hierarchy
            passed: true,
            score: 85,
            feedback: "Visual hierarchy verified.",
          },
          {
            criterionId: brief.rubricCriteria![1].id, // ui-prototyping
            passed: false,
            score: 40,
            feedback: "Prototyping failed interactive state review.",
          },
        ],
        overallFeedback: "Partial pass.",
        reviewedAt: new Date().toISOString(),
        isStale: false,
        trustDisclosure: LOCAL_REVIEW_DISCLOSURE,
      };

      const result = applyReviewToProfile(activeProfile, brief, review);

      expect(result.promotedSkillIds).toContain("visual-hierarchy");
      expect(result.ignoredSkillIds).toContain("ui-prototyping");

      expect(result.updatedProfile.skillEvidence["visual-hierarchy"].state).toBe(
        "practically_demonstrated"
      );
      expect(result.updatedProfile.skillEvidence["ui-prototyping"].state).toBe("coursework");
    });
  });

  // SCENARIO 15: Honest Trust Disclosure & Verification Boundaries
  describe("Scenario 15: Honest Trust Disclosure & Verification Boundaries", () => {
    it("stamps honest disclosure and unauthenticated notices on every created packet and evidence", () => {
      const submission = createMockSubmission();

      const review = generateCompletedReview(brief, submission, {
        reviewerName: "Reviewer Dev",
        reviewerRole: "mentor",
        overallDecision: "approved",
        artifactExamined: true,
      });

      // Review record must carry disclosure
      expect(review.trustDisclosure).toContain("identity not authenticated");
      expect(review.trustDisclosure).toContain("Not an institutionally verified PKI credential");

      // Review packet with review carries review trustDisclosure
      const packet = createReviewPacket({ ...submission, review }, brief, "Adversarial Student");
      expect(packet.review?.trustDisclosure).toContain("identity not authenticated");

      // Evidence promoted from this review carries unauthenticated notice
      const profile = createBaseProfile();
      profile.projectSubmissions[brief.id] = submission;

      const { updatedProfile } = applyReviewToProfile(profile, brief, review);
      const promotedEvidence = updatedProfile.skillEvidence["visual-hierarchy"];

      expect(promotedEvidence.verificationLevel).toBe("artifact_examined");
      expect(promotedEvidence.unverifiedNotice).toContain("Unauthenticated local evidence");
      expect(promotedEvidence.unverifiedNotice).toContain("Reviewer Dev");
    });
  });
});
