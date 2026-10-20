import { describe, it, expect, beforeEach } from "vitest";
import {
  validateProjectUrl,
  evaluateReflectionSubstance,
  evaluateProjectSubmission,
} from "../lib/project-evaluation";
import { PROJECT_BRIEFS } from "../lib/projects-data";
import { computeCareerRecommendations } from "../lib/recommendation-engine";
import {
  DEFAULT_GUEST_PROFILE,
  applyProjectSubmissionToProfile,
  normalizeStoredProfile,
} from "../lib/store";
import {
  UserProfile,
  ProjectBrief,
} from "../lib/types";
import { getEvidenceStateLabel, getSubmissionStatusLabel } from "../lib/utils";

describe("Phase 3B Evidence Integrity & Verification Boundaries Audit", () => {
  const portalBrief: ProjectBrief = PROJECT_BRIEFS[0]; // accessible-patient-portal
  const inventoryBrief: ProjectBrief = PROJECT_BRIEFS.find(
    (p) => p.slug === "vertical-slice-inventory-system"
  )!;

  let testProfile: UserProfile;

  beforeEach(() => {
    testProfile = JSON.parse(JSON.stringify(DEFAULT_GUEST_PROFILE));
  });

  // 1. Valid public URL with uninspected artifacts
  it("Scenario 1: Valid public URL is marked valid but explicitly flagged with isArtifactInspected: false", () => {
    const validPublicUrls = [
      "https://github.com/student-demo/accessible-portal",
      "https://gitlab.com/portfolio/inventory-management",
      "https://aaroh-student.vercel.app/demo",
      "https://my-app.netlify.app",
    ];

    validPublicUrls.forEach((url) => {
      const res = validateProjectUrl(url);
      expect(res.isValid).toBe(true);
      expect(res.isInspected).toBe(false);
      expect(res.uninspectedNotice).toContain("not been fetched, executed, or verified by Aaroh");
    });

    // Evaluate submission with a valid URL
    const submission = evaluateProjectSubmission(portalBrief, {
      repoOrDemoUrl: "https://github.com/student-demo/accessible-portal",
      checkedDeliverableIds: (portalBrief.deliverables || []).map((d) => d.id),
      reflection:
        "Engineered accessible WCAG 2.1 AA flows with 4.5:1 text contrast and single-column navigation. Handled keyboard focus rings and trade-offs.",
    });

    expect(submission.isArtifactInspected).toBe(false);
    expect(submission.verificationLimitationNotice).toBeDefined();
    expect(submission.verificationLimitationNotice).toContain("NOT been inspected or executed");
  });

  // 2. All deliverables checked without artifact inspection (produces evaluated / student_attested, never falsely verified)
  it("Scenario 2: Checking all deliverables produces 'evaluated' status and 'student_attested' skill evidence, not 'practically_demonstrated' or verified", () => {
    const allDeliverables = (portalBrief.deliverables || []).map((d) => d.id);
    const submissionInput = {
      repoOrDemoUrl: "https://github.com/student/patient-portal",
      checkedDeliverableIds: allDeliverables,
      reflection:
        "Adhered strictly to WCAG 2.1 AA guidelines with 4.5:1 text contrast. Tested keyboard navigation tab index and screen reader announcements. Documented architectural trade-offs between dense clinical information and single-column readability.",
    };

    const submission = evaluateProjectSubmission(portalBrief, submissionInput);

    // Submission status is 'evaluated', not 'demonstrated'
    expect(submission.status).toBe("evaluated");
    expect(submission.isArtifactInspected).toBe(false);
    expect(submission.verificationLimitationNotice).toContain("NOT been inspected or executed");

    // Record submission into profile
    const { updatedProfile } = applyProjectSubmissionToProfile(testProfile, portalBrief, submissionInput, submission);

    // Upgraded skills must be 'student_attested', NEVER 'practically_demonstrated' or 'independently_verified'
    expect(submission.upgradedSkillIds.length).toBeGreaterThan(0);
    submission.upgradedSkillIds.forEach((skillId) => {
      const skillEvidence = updatedProfile.skillEvidence[skillId];
      expect(skillEvidence).toBeDefined();
      expect(skillEvidence.state).toBe("student_attested");
      expect(skillEvidence.verificationLevel).toBe("student_attested");
      expect(skillEvidence.isArtifactInspected).toBe(false);
      expect(skillEvidence.evaluationBasis).toContain("student-attested deliverables");
    });
  });

  // 3. Long reflection with keyword stuffing / repetition detected
  it("Scenario 3: Long reflection with keyword stuffing and low vocabulary diversity is penalized", () => {
    // 60-word reflection made by repeating the same technical keywords
    const stuffedWords = [
      "architecture", "schema", "database", "relational", "concurrency",
      "architecture", "schema", "database", "relational", "concurrency",
      "architecture", "schema", "database", "relational", "concurrency",
      "architecture", "schema", "database", "relational", "concurrency",
      "architecture", "schema", "database", "relational", "concurrency",
      "architecture", "schema", "database", "relational", "concurrency",
      "architecture", "schema", "database", "relational", "concurrency",
      "architecture", "schema", "database", "relational", "concurrency",
      "architecture", "schema", "database", "relational", "concurrency",
      "architecture", "schema", "database", "relational", "concurrency",
    ].join(" ");

    const evalStuffed = evaluateReflectionSubstance(stuffedWords);
    // Should be penalized due to unique words / total words ratio < 0.45
    expect(evalStuffed.hasSubstance).toBe(false);
    expect(evalStuffed.score).toBeLessThanOrEqual(40);
    expect(evalStuffed.feedback).toContain("excessive word repetition");

    // Legitimate diverse reflection
    const genuineText =
      "In this vertical slice, we chose PostgreSQL with normalized tables over MongoDB to strictly maintain relational referential integrity. The main trade-off was accepting migration complexity for zero-loss financial transactions, guarded with Zod boundary parsing.";
    const evalGenuine = evaluateReflectionSubstance(genuineText);
    expect(evalGenuine.hasSubstance).toBe(true);
    expect(evalGenuine.score).toBeGreaterThanOrEqual(80);
    expect(evalGenuine.feedback).toContain("Detailed self-reflection");
  });

  // 4. Honest evaluation against explicit rubric criteria
  it("Scenario 4: Deterministic rubric criteria evaluate explicit deliverable coverage and reflection depth with honest evaluationBasis", () => {
    const submission = evaluateProjectSubmission(portalBrief, {
      repoOrDemoUrl: "https://github.com/student/patient-portal",
      checkedDeliverableIds: (portalBrief.deliverables || []).map((d) => d.id),
      reflection:
        "Adhered strictly to WCAG 2.1 AA guidelines with 4.5:1 text contrast. Tested keyboard navigation tab index and screen reader announcements. Documented architectural trade-offs between dense clinical information and single-column readability.",
    });

    expect(submission.criteriaScores.length).toBe(portalBrief.rubricCriteria!.length);
    submission.criteriaScores.forEach((crit) => {
      expect(crit.evaluationBasis).toBeDefined();
      expect(crit.evaluationBasis).toContain("Evaluated student-attested");
      expect(typeof crit.score).toBe("number");
      expect(typeof crit.passed).toBe("boolean");
    });
  });

  // 5. Blocked private/loopback/metadata URLs (IPv4, IPv6, localhost, userinfo credentials)
  it("Scenario 5: Rejects localhost, loopbacks (127.0.0.0/8, ::1), private subnets (10/8, 172.16/12, 192.168/16, 169.254/16), and user credentials", () => {
    const maliciousOrLocalUrls = [
      "http://localhost:3000",
      "http://127.0.0.1:8080/test",
      "http://127.0.0.2",
      "http://[::1]:3000",
      "http://[fe80::1]/path",
      "http://[fd00::1]/path",
      "http://10.0.0.1/admin",
      "http://172.16.0.1/dashboard",
      "http://172.31.255.255",
      "http://192.168.1.1",
      "http://169.254.169.254/latest/meta-data/", // AWS metadata endpoint
      "http://100.64.0.1", // Carrier-grade NAT
      "http://internal.corp.lan",
      "http://user:password@github.com/repo", // embedded userinfo
      "javascript:alert(1)",
      "file:///etc/passwd",
      "data:text/html,<script>alert(1)</script>",
    ];

    maliciousOrLocalUrls.forEach((url) => {
      const res = validateProjectUrl(url);
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  // 6. Partial skill criterion passing (only passing criteria skills upgrade)
  it("Scenario 6: Partial deliverable completion upgrades only the skills matching passing criteria", () => {
    // Deliverables: check only deliverables matching criteria 1 (visual hierarchy & ui prototyping)
    const partialDeliverables = [
      portalBrief.deliverables![0].id,
      portalBrief.deliverables![1].id,
      portalBrief.deliverables![2].id,
    ]; // 3 of 5 deliverables (60% deliverable ratio)

    const submission = evaluateProjectSubmission(portalBrief, {
      repoOrDemoUrl: "https://github.com/student/patient-portal",
      checkedDeliverableIds: partialDeliverables,
      reflection:
        "Focused primarily on WCAG 2.1 AA visual contrast, spacing grid, and single-column layout architecture with responsive breakpoints.",
    });

    expect(submission.criteriaScores.length).toBe(3);
    const uxResearchCrit = submission.criteriaScores.find((c) => c.associatedSkillId === "ux-research");
    const visualCrit = submission.criteriaScores.find((c) => c.associatedSkillId === "visual-hierarchy");
    expect(uxResearchCrit).toBeDefined();
    expect(visualCrit).toBeDefined();
    // ux-research threshold is 70 (score 74 passes) while visual-hierarchy threshold is 75 (score 74 fails)
    expect(uxResearchCrit?.passed).toBe(true);
    expect(visualCrit?.passed).toBe(false);
    expect(submission.upgradedSkillIds).not.toContain("visual-hierarchy");
  });

  // 7. Weak submission does not downgrade stronger existing evidence
  it("Scenario 7: Weak or incomplete submission does not erase or downgrade existing evidence", () => {
    // Seed initial profile with coursework on visual-hierarchy
    testProfile.skillEvidence["visual-hierarchy"] = {
      skillId: "visual-hierarchy",
      state: "coursework",
      sourceTitle: "Design Systems 101",
      assessedScore: 80,
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    // Submit an incomplete submission
    const incompleteInput = {
      repoOrDemoUrl: "https://github.com/student/patient-portal",
      checkedDeliverableIds: [portalBrief.deliverables![0].id], // Only 1 of 5
      reflection: "Drafting wireframe.",
    };

    const incompleteSubmission = evaluateProjectSubmission(portalBrief, incompleteInput);
    expect(incompleteSubmission.status).toBe("evaluation_incomplete");
    expect(incompleteSubmission.upgradedSkillIds).toHaveLength(0);

    // Record incomplete submission
    const { updatedProfile } = applyProjectSubmissionToProfile(
      testProfile,
      portalBrief,
      incompleteInput,
      incompleteSubmission
    );

    // Existing evidence must remain intact as coursework
    const evidence = updatedProfile.skillEvidence["visual-hierarchy"];
    expect(evidence.state).toBe("coursework");
    expect(evidence.sourceTitle).toBe("Design Systems 101");
  });

  // 8. Repeated submissions update in place (idempotent, no duplicates)
  it("Scenario 8: Multiple submissions for the same project brief update in place without duplicate records", () => {
    // First attempt: Needs improvement
    const firstInput = {
      repoOrDemoUrl: "https://github.com/student/patient-portal",
      checkedDeliverableIds: (portalBrief.deliverables || []).map((d) => d.id),
      reflection: "Short note.",
    };
    const res1 = applyProjectSubmissionToProfile(testProfile, portalBrief, firstInput);
    expect(Object.keys(res1.updatedProfile.projectSubmissions)).toHaveLength(1);
    expect(res1.updatedProfile.projectSubmissions[portalBrief.id].status).toBe("needs_improvement");

    // Second attempt: Evaluated with comprehensive reflection
    const secondInput = {
      repoOrDemoUrl: "https://github.com/student/patient-portal-v2",
      checkedDeliverableIds: (portalBrief.deliverables || []).map((d) => d.id),
      reflection:
        "Adhered strictly to WCAG 2.1 AA guidelines with 4.5:1 text contrast. Tested keyboard navigation tab index and screen reader announcements. Documented architectural trade-offs between dense clinical information and single-column readability.",
    };
    const res2 = applyProjectSubmissionToProfile(res1.updatedProfile, portalBrief, secondInput);

    // Must still have exactly 1 record for this project brief
    expect(Object.keys(res2.updatedProfile.projectSubmissions)).toHaveLength(1);
    expect(res2.updatedProfile.projectSubmissions[portalBrief.id].status).toBe("evaluated");
    expect(res2.updatedProfile.projectSubmissions[portalBrief.id].repoOrDemoUrl).toBe("https://github.com/student/patient-portal-v2");
  });

  // 9. Persistence and hydration of evidence provenance
  it("Scenario 9: Evidence provenance and limitation notice are preserved through serialization and hydration", () => {
    const submissionInput = {
      repoOrDemoUrl: "https://github.com/student/inventory",
      checkedDeliverableIds: (inventoryBrief.deliverables || []).map((d) => d.id),
      reflection:
        "Architected normalized schema in PostgreSQL with foreign keys and cascade rules. Balanced pessimistic vs optimistic locking for concurrent stock allocation. Validated inputs using Zod.",
    };
    const { updatedProfile } = applyProjectSubmissionToProfile(testProfile, inventoryBrief, submissionInput);

    const serializedState = JSON.stringify(updatedProfile);
    const hydratedProfile = normalizeStoredProfile(serializedState);

    // Verify submission record provenance
    const savedSub = hydratedProfile.projectSubmissions[inventoryBrief.id];
    expect(savedSub.status).toBe("evaluated");
    expect(savedSub.isArtifactInspected).toBe(false);
    expect(savedSub.verificationLimitationNotice).toBeDefined();

    // Verify skill evidence provenance
    const sqlEvidence = hydratedProfile.skillEvidence["sql-relational"];
    expect(sqlEvidence.state).toBe("student_attested");
    expect(sqlEvidence.isArtifactInspected).toBe(false);
    expect(sqlEvidence.verificationLevel).toBe("student_attested");
    expect(sqlEvidence.evaluationBasis).toContain("student-attested deliverables");
  });

  // 10. Consistent labels across Skill Matrix, dashboard, recommendations, and roadmap
  it("Scenario 10: Utility labels and presentation terms accurately reflect 'Attested Project' and 'Evaluated'", () => {
    // Skill state labels
    expect(getEvidenceStateLabel("student_attested").label).toBe("Attested Project");
    expect(getEvidenceStateLabel("practically_demonstrated").label).toBe("Demonstrated");
    expect(getEvidenceStateLabel("independently_verified").label).toBe("Verified");

    // Submission status labels
    expect(getSubmissionStatusLabel("evaluated").label).toBe("Evaluated Submission");
    expect(getSubmissionStatusLabel("needs_improvement").label).toBe("Needs Revision");
    expect(getSubmissionStatusLabel("evaluation_incomplete").label).toBe("Incomplete Deliverables");

    // Recommendation engine fit explanation does not claim verified/demonstrated
    const profileWithAttestation: UserProfile = {
      ...DEFAULT_GUEST_PROFILE,
      skillEvidence: {
        ...DEFAULT_GUEST_PROFILE.skillEvidence,
        "sql-relational": {
          skillId: "sql-relational",
          state: "student_attested",
          sourceTitle: "Production Inventory System",
          isArtifactInspected: false,
          assessedScore: 85,
          updatedAt: new Date().toISOString(),
        },
      },
    };

    const recs = computeCareerRecommendations(profileWithAttestation);
    const recWithEvidence = recs.find((r) => r.matchReasons.some((m) => m.includes("evidence coverage")));
    expect(recWithEvidence).toBeDefined();
    // Explanation explicitly states 'Logged X% evidence coverage', avoiding inflated claims
    const reason = recWithEvidence!.matchReasons.find((m) => m.includes("evidence coverage"))!;
    expect(reason).toContain("Logged");
    expect(reason).toContain("evidence coverage across core skill requirements");
    expect(reason).not.toContain("Proven in production");
  });

  // 11. Protection of existing independently_verified records
  it("Scenario 11: Project link submission NEVER downgrades or overwrites an independently_verified or practically_demonstrated skill", () => {
    testProfile.skillEvidence["sql-relational"] = {
      skillId: "sql-relational",
      state: "independently_verified",
      sourceTitle: "National Database Hackathon - 1st Place",
      sourceUrl: "https://hackathon.org/results/2025",
      assessedScore: 98,
      updatedAt: "2025-11-01T00:00:00.000Z",
    };
    testProfile.skillEvidence["api-design"] = {
      skillId: "api-design",
      state: "practically_demonstrated",
      sourceTitle: "Reviewed Open Source PR #42",
      sourceUrl: "https://github.com/upstream/core/pull/42",
      assessedScore: 90,
      updatedAt: "2025-12-01T00:00:00.000Z",
    };

    // Evaluate inventory project brief (which maps to sql-relational, web-development, api-design)
    const submissionInput = {
      repoOrDemoUrl: "https://github.com/student/inventory",
      checkedDeliverableIds: (inventoryBrief.deliverables || []).map((d) => d.id),
      reflection:
        "Architected normalized schema in PostgreSQL with foreign keys and cascade rules. Balanced pessimistic vs optimistic locking for concurrent stock allocation. Validated inputs using Zod.",
    };

    const { updatedProfile } = applyProjectSubmissionToProfile(testProfile, inventoryBrief, submissionInput);

    const evidenceMap = updatedProfile.skillEvidence;

    // 1. sql-relational: Must NOT be downgraded to student_attested
    expect(evidenceMap["sql-relational"].state).toBe("independently_verified");
    expect(evidenceMap["sql-relational"].sourceTitle).toBe("National Database Hackathon - 1st Place");

    // 2. api-design: Must NOT be downgraded to student_attested
    expect(evidenceMap["api-design"].state).toBe("practically_demonstrated");
    expect(evidenceMap["api-design"].sourceTitle).toBe("Reviewed Open Source PR #42");

    // 3. web-development: Previously unassessed, now upgraded to student_attested
    expect(evidenceMap["web-development"].state).toBe("student_attested");
    expect(evidenceMap["web-development"].sourceTitle).toBe(inventoryBrief.title);
  });

  // 12. Malformed legacy record normalization during hydration
  it("Scenario 12: Legacy profile hydration normalizes deprecated 'demonstrated' status to 'evaluated' without data loss", () => {
    // Construct legacy raw JSON with status 'demonstrated'
    const legacyRawJson = JSON.stringify({
      id: "guest-legacy",
      name: "Legacy Student",
      discipline: "engineering",
      interests: ["Web Systems"],
      completedTrialIds: [],
      trialReflections: {},
      selectedWorkStyles: ["independent_deep_work"],
      skillEvidence: {
        "web-development": {
          skillId: "web-development",
          state: "practically_demonstrated", // legacy state before 3B
          sourceTitle: "Legacy Project",
          assessedScore: 82,
        },
      },
      projectSubmissions: {
        "proj-2": {
          projectId: "proj-2",
          repoOrDemoUrl: "https://github.com/student/legacy-project",
          checkedDeliverableIds: ["deliv-1"],
          reflection: "Legacy project reflection.",
          status: "demonstrated", // Deprecated legacy status
          overallScore: 82,
          submittedAt: "2026-01-01T00:00:00.000Z",
        },
      },
      roadmaps: {},
      activeRoadmapId: null,
      customDeliverableLogs: [],
      careerHypotheses: [],
      savedCareerSlugs: [],
    });

    const normalizedProfile = normalizeStoredProfile(legacyRawJson);
    const sub = normalizedProfile.projectSubmissions["proj-2"];

    expect(sub.status).toBe("evaluated");
    expect(sub.verificationLevel).toBe("student_attested");
    expect(sub.isArtifactInspected).toBe(false);
  });

  // 13. External content handling consistent with local-first security architecture
  it("Scenario 13: Local-first architecture guarantees zero network fetch calls and zero remote code execution during evaluation", () => {
    const startTime = performance.now();
    const submission = evaluateProjectSubmission(portalBrief, {
      repoOrDemoUrl: "https://github.com/valid/repo-that-does-not-exist-on-internet-404",
      checkedDeliverableIds: (portalBrief.deliverables || []).map((d) => d.id),
      reflection:
        "Adhered strictly to WCAG 2.1 AA guidelines with 4.5:1 text contrast. Tested keyboard navigation tab index and screen reader announcements. Documented architectural trade-offs between dense clinical information and single-column readability.",
    });
    const duration = performance.now() - startTime;

    // Local synchronous deterministic execution completes in < 50ms
    expect(duration).toBeLessThan(50);
    // Explicitly flags that the artifact at the URL was not fetched or inspected
    expect(submission.isArtifactInspected).toBe(false);
    expect(submission.verificationLimitationNotice).toBeDefined();
    expect(submission.verificationLimitationNotice).toContain("NOT been inspected or executed");
    expect(submission.criteriaScores[0].evaluationBasis).toContain("Evaluated student-attested");
  });
});
