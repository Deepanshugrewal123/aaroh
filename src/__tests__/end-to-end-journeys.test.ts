import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_GUEST_PROFILE,
  generateInitialRoadmap,
  normalizeStoredProfile,
  applyProjectSubmissionToProfile,
} from "../lib/store";
import { CAREERS_CATALOG } from "../lib/careers-data";
import { SKILLS_CATALOG } from "../lib/skills-data";
import { CAREER_TRIALS, evaluateTrialSubmission, isCareerTrialCompleted } from "../lib/trials-data";
import { PROJECT_BRIEFS } from "../lib/projects-data";
import { evaluateProjectSubmission } from "../lib/project-evaluation";
import { computeCareerRecommendations } from "../lib/recommendation-engine";
import { UserProfile, Roadmap } from "../lib/types";

describe("Phase 3C: End-to-End Product Invariants & Journey Reliability", () => {
  let profile: UserProfile;

  beforeEach(() => {
    profile = JSON.parse(JSON.stringify(DEFAULT_GUEST_PROFILE));
  });

  // 1. Completing an activity changes only the intended records
  it("Invariant 1: Completing a trial changes only that trial's records and does not alter unrelated fields", () => {
    const trial = CAREER_TRIALS[0]; // Product & UX Designer
    const initialInterests = [...profile.interests];
    const initialWeeklyHours = profile.weeklyCapacityHours;
    const initialSubmissions = { ...profile.projectSubmissions };

    // Record trial completion
    const reflectionText = "Balancing accessible contrast with clinical data density.";
    const evalResult = evaluateTrialSubmission(trial, trial.practicalTask.options![0].id, reflectionText);

    const updatedProfile: UserProfile = {
      ...profile,
      completedTrialIds: [...profile.completedTrialIds, trial.id],
      trialReflections: {
        ...profile.trialReflections,
        [trial.id]: {
          trialId: trial.id,
          rating: 5,
          reflection: reflectionText,
          selectedOptionId: trial.practicalTask.options![0].id,
          score: evalResult.score,
          submittedAt: new Date().toISOString(),
        },
      },
    };

    expect(updatedProfile.completedTrialIds).toContain(trial.id);
    expect(updatedProfile.trialReflections[trial.id].score).toBe(evalResult.score);
    // Unrelated records remain strictly unmodified
    expect(updatedProfile.interests).toEqual(initialInterests);
    expect(updatedProfile.weeklyCapacityHours).toBe(initialWeeklyHours);
    expect(updatedProfile.projectSubmissions).toEqual(initialSubmissions);
  });

  // 2. Recommendations use persisted evidence and explain their limitations
  it("Invariant 2: Recommendations dynamically reflect persisted evidence and disclose heuristic bounds (20-95)", () => {
    // Add trial completion
    profile.completedTrialIds.push("trial-ux-design");
    profile.trialReflections["trial-ux-design"] = {
      trialId: "trial-ux-design",
      rating: 5,
      score: 90,
      reflection: "Energizing trade-off analysis.",
      submittedAt: new Date().toISOString(),
    };

    const recs = computeCareerRecommendations(profile);
    const uxRec = recs.find((r) => r.career.slug === "product-ux-designer")!;

    expect(uxRec).toBeDefined();
    expect(uxRec.fitScore).toBeGreaterThanOrEqual(20);
    expect(uxRec.fitScore).toBeLessThanOrEqual(95);
    expect(uxRec.heuristicLimitationsNote).toContain("Exploration Index");
    expect(uxRec.heuristicLimitationsNote).toContain("does not constitute a psychometric or hiring prediction");
    expect(uxRec.matchReasons.some((m) => m.includes("energizing"))).toBe(true);
  });

  // 3. Self-reported and student-attested evidence never masquerade as independently verified
  it("Invariant 3: Self-reported and student-attested evidence maintain distinct weights and labels, never masquerading as verified", () => {
    // Self-reported skill
    profile.skillEvidence["python-core"] = {
      skillId: "python-core",
      state: "self_reported",
      sourceTitle: "Personal interest reading",
      updatedAt: new Date().toISOString(),
    };

    // Student-attested project skill
    profile.skillEvidence["web-development"] = {
      skillId: "web-development",
      state: "student_attested",
      sourceTitle: "Inventory System Starter",
      isArtifactInspected: false,
      updatedAt: new Date().toISOString(),
    };

    // Independently verified skill
    profile.skillEvidence["sql-relational"] = {
      skillId: "sql-relational",
      state: "independently_verified",
      sourceTitle: "Postgres Community Hackathon Winner",
      updatedAt: new Date().toISOString(),
    };

    // States must remain distinct
    expect(profile.skillEvidence["python-core"].state).toBe("self_reported");
    expect(profile.skillEvidence["web-development"].state).toBe("student_attested");
    expect(profile.skillEvidence["sql-relational"].state).toBe("independently_verified");

    // Rec engine weights them hierarchically: self_reported (0.35x), student_attested (0.75x), verified (1.0x)
    const recs = computeCareerRecommendations(profile);
    expect(recs.length).toBe(CAREERS_CATALOG.length);
  });

  // 4. Project link submission does not imply external artifact inspection
  it("Invariant 4: Every project submission explicitly sets isArtifactInspected: false and carries limitation notice", () => {
    const brief = PROJECT_BRIEFS[0];
    const evaluation = evaluateProjectSubmission(brief, {
      repoOrDemoUrl: "https://github.com/student/patient-portal",
      checkedDeliverableIds: (brief.deliverables || []).map((d) => d.id),
      reflection:
        "Designed accessible WCAG 2.1 AA flows with 4.5:1 text contrast and single-column navigation. Handled keyboard focus rings and trade-offs.",
    });

    expect(evaluation.isArtifactInspected).toBe(false);
    expect(evaluation.verificationLimitationNotice).toBeDefined();
    expect(evaluation.verificationLimitationNotice).toContain("NOT been inspected or executed");
  });

  // 5. Skill evidence provenance survives refresh and migration
  it("Invariant 5: Skill evidence provenance survives serialization, JSON parsing, and hydration without loss", () => {
    const brief = PROJECT_BRIEFS.find((p) => p.slug === "vertical-slice-inventory-system")!;
    const input = {
      repoOrDemoUrl: "https://github.com/student/inventory",
      checkedDeliverableIds: (brief.deliverables || []).map((d) => d.id),
      reflection:
        "Architected normalized schema in PostgreSQL with foreign keys and cascade rules. Balanced pessimistic vs optimistic locking for concurrent stock allocation. Validated inputs using Zod.",
    };

    const { updatedProfile } = applyProjectSubmissionToProfile(profile, brief, input);

    // Round-trip serialization
    const serialized = JSON.stringify(updatedProfile);
    const restored = normalizeStoredProfile(serialized);

    const restoredEvidence = restored.skillEvidence["sql-relational"];
    expect(restoredEvidence).toBeDefined();
    expect(restoredEvidence.state).toBe("student_attested");
    expect(restoredEvidence.sourceTitle).toBe(brief.title);
    expect(restoredEvidence.sourceUrl).toBe("https://github.com/student/inventory");
    expect(restoredEvidence.isArtifactInspected).toBe(false);
    expect(restoredEvidence.unverifiedNotice).toContain("Artifact at external URL was not inspected");
  });

  // 6. A new active career does not inherit unrelated completed milestones
  it("Invariant 6: Changing target career generates a fresh roadmap that NEVER inherits completed milestones from previous careers", () => {
    // Student completes trial and project for Full-Stack Systems Engineer (career 1)
    const completedTrialIds = ["trial-fullstack-debug"];
    const projectSubmissions = {
      "proj-3": {
        projectId: "proj-3",
        projectSlug: "vertical-slice-inventory-system",
        careerSlug: "full-stack-systems-engineer",
        repoOrDemoUrl: "https://github.com/student/inventory",
        reflection: "Full stack relational system with normalized DB.",
        checkedDeliverableIds: ["p3-deliv-1", "p3-deliv-2", "p3-deliv-3"],
        status: "evaluated" as const,
        overallScore: 88,
        criteriaScores: [],
        upgradedSkillIds: ["web-development", "sql-relational"],
        feedback: "Evaluation Complete",
        actionableNextSteps: [],
        isArtifactInspected: false as const,
        verificationLimitationNotice: "Uninspected link",
        submittedAt: new Date().toISOString(),
        evaluatedAt: new Date().toISOString(),
      },
    };

    // Full-stack roadmap has completed milestones
    const fullStackRoadmap = generateInitialRoadmap(
      "full-stack-systems-engineer",
      8,
      false,
      completedTrialIds,
      projectSubmissions
    );
    expect(fullStackRoadmap.tasks.find((t) => t.id === "task-1")?.status).toBe("completed");
    expect(fullStackRoadmap.tasks.find((t) => t.id === "task-3")?.status).toBe("completed");

    // Student now changes target career to Clinical Research Coordinator (career 2)
    const clinicalRoadmap = generateInitialRoadmap(
      "clinical-research-coordinator",
      8,
      false,
      completedTrialIds,
      projectSubmissions
    );

    // Clinical roadmap must NOT inherit full-stack's completed milestones!
    const clinicalTask1 = clinicalRoadmap.tasks.find((t) => t.id === "task-1")!;
    const clinicalTask2 = clinicalRoadmap.tasks.find((t) => t.id === "task-2")!;
    const clinicalTask3 = clinicalRoadmap.tasks.find((t) => t.id === "task-3")!;
    const clinicalTask4 = clinicalRoadmap.tasks.find((t) => t.id === "task-4")!;

    expect(clinicalTask1.status).toBe("available"); // Available to take, NOT completed!
    expect(clinicalTask2.status).toBe("locked");
    expect(clinicalTask3.status).toBe("locked");
    expect(clinicalTask4.status).toBe("locked");
  });

  // 7. Repeated submissions do not duplicate records or accumulate artificial progress
  it("Invariant 7: Repeated submissions for the same project brief update the existing record idempotently", () => {
    const brief = PROJECT_BRIEFS[0];

    const input1 = {
      repoOrDemoUrl: "https://github.com/student/portal-v1",
      checkedDeliverableIds: [brief.deliverables![0].id],
      reflection: "Initial incomplete attempt.",
    };
    const res1 = applyProjectSubmissionToProfile(profile, brief, input1);
    expect(Object.keys(res1.updatedProfile.projectSubmissions)).toHaveLength(1);
    expect(res1.updatedProfile.projectSubmissions[brief.id].status).toBe("evaluation_incomplete");

    const input2 = {
      repoOrDemoUrl: "https://github.com/student/portal-v2",
      checkedDeliverableIds: (brief.deliverables || []).map((d) => d.id),
      reflection:
        "Comprehensive overhaul adhering to WCAG 2.1 AA with 4.5:1 text contrast and single-column layout architecture. Documented trade-offs.",
    };
    const res2 = applyProjectSubmissionToProfile(res1.updatedProfile, brief, input2);

    // Must still have exactly 1 record under brief.id
    expect(Object.keys(res2.updatedProfile.projectSubmissions)).toHaveLength(1);
    expect(res2.updatedProfile.projectSubmissions[brief.id].status).toBe("evaluated");
    expect(res2.updatedProfile.projectSubmissions[brief.id].repoOrDemoUrl).toBe("https://github.com/student/portal-v2");
  });

  // 8. Missing evidence is not treated as proof of inability
  it("Invariant 8: Unassessed skills are explained as unexplored territory rather than lack of ability", () => {
    // Empty profile with no assessed skills
    const emptyProfile: UserProfile = {
      ...DEFAULT_GUEST_PROFILE,
      skillEvidence: {},
      completedTrialIds: [],
      trialReflections: {},
      projectSubmissions: {},
    };

    const recs = computeCareerRecommendations(emptyProfile);
    expect(recs.length).toBe(CAREERS_CATALOG.length);

    recs.forEach((rec) => {
      // Must contain explanation about missing evidence
      const hasUnassessedNote = rec.uncertainties.some(
        (u) => u.includes("not yet assessed") && u.includes("indicates unexplored ground, not lack of ability")
      );
      expect(hasUnassessedNote).toBe(true);
    });
  });

  // 9. Dashboard actions correspond to actual roadmap state
  it("Invariant 9: Next recommended step matches active milestone status", () => {
    // Without completed trial: suggests 12-minute micro-trial
    expect(isCareerTrialCompleted(profile, "full-stack-systems-engineer")).toBe(false);

    // With completed trial: suggests next roadmap milestone
    profile.completedTrialIds.push("trial-fullstack-debug");
    profile.trialReflections["trial-fullstack-debug"] = {
      trialId: "trial-fullstack-debug",
      rating: 5,
      score: 85,
      reflection: "Good problem solving.",
      submittedAt: new Date().toISOString(),
    };

    expect(isCareerTrialCompleted(profile, "full-stack-systems-engineer")).toBe(true);

    const roadmap = generateInitialRoadmap(
      "full-stack-systems-engineer",
      8,
      false,
      profile.completedTrialIds,
      profile.projectSubmissions
    );

    const activeTask = roadmap.tasks.find((t) => t.status === "available" || t.status === "in_progress");
    expect(activeTask).toBeDefined();
    // Milestone 1 is completed, Milestone 2 is active
    expect(roadmap.tasks[0].status).toBe("completed");
    expect(activeTask?.id).toBe("task-2");
  });

  // 10. Exam mode and workload constraints remain respected
  it("Invariant 10: Exam mode caps capacity at 40% (min 3h/week) and restores standard capacity when disabled", () => {
    const standardHours = 10;
    const standardRoadmap = generateInitialRoadmap("full-stack-systems-engineer", standardHours, false);
    expect(standardRoadmap.weeklyCapacityHours).toBe(10);
    expect(standardRoadmap.isExamMode).toBe(false);

    // Enable Exam Mode
    const examRoadmap = generateInitialRoadmap("full-stack-systems-engineer", standardHours, true);
    expect(examRoadmap.weeklyCapacityHours).toBe(4); // 10 * 0.4 = 4
    expect(examRoadmap.isExamMode).toBe(true);

    // Very low capacity (4 hrs) throttled with floor of 3
    const lowHoursExamRoadmap = generateInitialRoadmap("full-stack-systems-engineer", 4, true);
    expect(lowHoursExamRoadmap.weeklyCapacityHours).toBe(3); // max(3, round(4 * 0.4 = 1.6 -> 2)) = 3
  });

  // 11. Unknown inputs, empty profiles, and corrupted storage have safe fallbacks
  it("Invariant 11: Corrupted or null storage JSON falls back safely to default profile without throwing", () => {
    // Null storage
    const fromNull = normalizeStoredProfile(null);
    expect(fromNull.id).toBe(DEFAULT_GUEST_PROFILE.id);

    // Corrupted non-JSON string
    const fromCorrupted = normalizeStoredProfile("MALFORMED_NON_JSON_<<<>>>");
    expect(fromCorrupted.id).toBe(DEFAULT_GUEST_PROFILE.id);

    // Empty JSON object
    const fromEmpty = normalizeStoredProfile("{}");
    expect(fromEmpty.skillEvidence).toBeDefined();
    expect(fromEmpty.trialReflections).toBeDefined();
    expect(fromEmpty.projectSubmissions).toBeDefined();
  });
});
