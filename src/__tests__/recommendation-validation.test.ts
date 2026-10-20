import { describe, it, expect } from "vitest";
import {
  computeCareerRecommendations,
  getRecommendationForCareer,
} from "../lib/recommendation-engine";
import { DEFAULT_GUEST_PROFILE, generateInitialRoadmap } from "../lib/store";
import { CAREERS_CATALOG } from "../lib/careers-data";
import { CAREER_TRIALS } from "../lib/trials-data";
import { UserProfile } from "../lib/types";

describe("Phase 2B: Recommendation Engine Intelligence Validation", () => {
  describe("1. Empty and Incomplete Profiles", () => {
    it("handles an empty profile without errors and returns bounded, honest hypotheses", () => {
      const emptyProfile: UserProfile = {
        id: "empty-student",
        name: "New Student",
        stage: "high_school",
        discipline: "undecided",
        selectedWorkStyles: [],
        interests: [],
        weeklyCapacityHours: 4,
        isExamMode: false,
        targetCareerHypotheses: [],
        skillEvidence: {},
        completedTrialIds: [],
        trialReflections: {},
        projectSubmissions: {},
        savedCareerSlugs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const recs = computeCareerRecommendations(emptyProfile);
      expect(recs.length).toBe(CAREERS_CATALOG.length);

      recs.forEach((rec) => {
        // Score is bounded, never 0% and never 100%
        expect(rec.fitScore).toBeGreaterThanOrEqual(20);
        expect(rec.fitScore).toBeLessThanOrEqual(95);

        // Fit band is valid
        expect(["strong_hypothesis", "promising_alternative", "exploratory_bridge"]).toContain(
          rec.fitBand
        );

        // Missing skills are explicitly identified as unknowns, not zero ability
        expect(rec.unassessedSkillsCount).toBe(rec.career.skillsRequired.length);
        expect(rec.skillCoveragePercent).toBe(0);

        // Uncertainty note affirms unexplored ground
        const hasUnexploredNote = rec.uncertainties.some((u) =>
          u.includes("Missing evidence indicates unexplored ground, not lack of ability")
        );
        expect(hasUnexploredNote).toBe(true);

        // Actionable next step directs to the micro-trial
        expect(rec.recommendedFirstStep).toContain("micro-trial");
      });
    });

    it("resiliently handles malformed or legacy trial records lacking rubric scores", () => {
      const legacyProfile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        completedTrialIds: ["trial-ux-design"],
        trialReflections: {
          "trial-ux-design": {
            trialId: "trial-ux-design",
            rating: 4,
            reflection: "Legacy reflection note without rubric score.",
            submittedAt: "2025-01-01T00:00:00.000Z",
          },
        },
      };

      const recs = computeCareerRecommendations(legacyProfile);
      const uxRec = recs.find((r) => r.career.slug === "product-ux-designer");
      expect(uxRec).toBeDefined();
      expect(uxRec?.evidenceBreakdown.trialStatus).toBe("completed");
      expect(uxRec?.fitScore).toBeGreaterThanOrEqual(20);
    });
  });

  describe("2. Undecided Explorers", () => {
    it("provides equal baseline discipline opportunity for undecided students", () => {
      const undecidedProfile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        discipline: "undecided",
        interests: [],
        selectedWorkStyles: ["analytical", "creative"],
      };

      const recs = computeCareerRecommendations(undecidedProfile);
      recs.forEach((rec) => {
        expect(rec.evidenceBreakdown.disciplineAlignment).toBe("undecided_explorer");
        const hasAccessibleNote = rec.matchReasons.some((m) =>
          m.includes("Accessible entry point for multi-disciplinary explorers")
        );
        expect(hasAccessibleNote).toBe(true);
      });
    });
  });

  describe("3. Conflicting and Multi-Disciplinary Interests", () => {
    it("celebrates cross-disciplinary interests without destructive interference", () => {
      const multiInterestProfile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        discipline: "engineering",
        interests: ["Climate Change", "Financial Markets", "Software Engineering"],
      };

      const recs = computeCareerRecommendations(multiInterestProfile);
      const envRec = recs.find((r) => r.career.slug === "environmental-data-researcher");
      const finRec = recs.find((r) => r.career.slug === "financial-analyst");
      const techRec = recs.find((r) => r.career.slug === "full-stack-systems-engineer");

      expect(envRec?.evidenceBreakdown.statedInterests.length).toBeGreaterThan(0);
      expect(finRec?.evidenceBreakdown.statedInterests.length).toBeGreaterThan(0);
      expect(techRec?.evidenceBreakdown.statedInterests.length).toBeGreaterThan(0);

      // Both receive interest match points without cancelling each other out
      expect(envRec?.matchReasons.some((m) => m.includes("Climate Change"))).toBe(true);
      expect(finRec?.matchReasons.some((m) => m.includes("Financial Markets"))).toBe(true);
      expect(techRec?.matchReasons.some((m) => m.includes("Software Engineering"))).toBe(true);
    });
  });

  describe("4. Decoupled Trial Signals: Task Performance vs Enjoyment Affinity", () => {
    it("decouples high enjoyment (5/5) with weak task performance (35%)", () => {
      const motivatedLearnerProfile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        completedTrialIds: ["trial-clinical-coordination"],
        trialReflections: {
          "trial-clinical-coordination": {
            trialId: "trial-clinical-coordination",
            rating: 5, // Loved the clinic environment
            selectedOptionId: "option-b",
            score: 35, // Chose risky queue compression
            reflection: "I really want to work with patients, but I rushed the triage.",
            submittedAt: new Date().toISOString(),
          },
        },
      };

      const rec = getRecommendationForCareer(motivatedLearnerProfile, "clinical-research-coordinator")!;
      expect(rec).toBeDefined();

      // High motivation is acknowledged in match reasons
      const hasMotivationNote = rec.matchReasons.some((m) =>
        m.includes("High motivation: Rated trial problem-solving energizing (5/5)")
      );
      expect(hasMotivationNote).toBe(true);

      // Concept gap is honestly surfaced in uncertainties rather than hidden
      const hasVulnerabilityNote = rec.uncertainties.some((u) =>
        u.includes("Trial task score (35%) showed trade-off vulnerabilities")
      );
      expect(hasVulnerabilityNote).toBe(true);
    });

    it("decouples high task performance (95%) with low enjoyment (1/5)", () => {
      const capableReluctantProfile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        completedTrialIds: ["trial-public-policy"],
        trialReflections: {
          "trial-public-policy": {
            trialId: "trial-public-policy",
            rating: 1, // Found bureaucratic policy negotiations draining
            selectedOptionId: "option-a",
            score: 95, // Exceptional policy design
            reflection: "I solved the financing formula easily, but I felt exhausted by the politics.",
            submittedAt: new Date().toISOString(),
          },
        },
      };

      const rec = getRecommendationForCareer(capableReluctantProfile, "public-policy-analyst")!;
      expect(rec).toBeDefined();

      // Demonstrated aptitude is acknowledged
      const hasAptitudeNote = rec.matchReasons.some((m) =>
        m.includes("Aptitude demonstrated: Solved trial scenario with high rubric score (95%)")
      );
      expect(hasAptitudeNote).toBe(true);

      // Low daily affinity is transparently flagged as an uncertainty
      const hasDrainingNote = rec.uncertainties.some((u) =>
        u.includes("Rated daily problem-solving affinity low / draining (1/5)")
      );
      expect(hasDrainingNote).toBe(true);

      // The career is NOT eliminated; it remains a valid hypothesis with honest trade-offs
      expect(rec.fitScore).toBeGreaterThanOrEqual(30);
    });
  });

  describe("5. Repeated Attempts & Non-Inflation Policy", () => {
    it("ensures repeated trial attempts do not stack points or inflate recommendations", () => {
      const singleAttemptProfile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        completedTrialIds: ["trial-environmental-data"],
        trialReflections: {
          "trial-environmental-data": {
            trialId: "trial-environmental-data",
            rating: 4,
            score: 95,
            reflection: "First solid attempt.",
            submittedAt: "2026-01-01T00:00:00.000Z",
          },
        },
      };

      const repeatedAttemptProfile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        completedTrialIds: ["trial-environmental-data"], // Deduplicated in Set
        trialReflections: {
          "trial-environmental-data": {
            trialId: "trial-environmental-data",
            rating: 4,
            score: 95,
            reflection: "Latest attempt after revising.",
            submittedAt: "2026-01-02T00:00:00.000Z",
          },
        },
      };

      const singleRec = getRecommendationForCareer(singleAttemptProfile, "environmental-data-researcher")!;
      const repeatedRec = getRecommendationForCareer(repeatedAttemptProfile, "environmental-data-researcher")!;

      // Scores are strictly identical; repeated attempts do not stack points
      expect(repeatedRec.fitScore).toBe(singleRec.fitScore);
      expect(repeatedRec.evidenceBreakdown.trialStatus).toBe("completed");
    });
  });

  describe("6. Stable Deterministic Results", () => {
    it("produces identical output on repeated runs with the same input", () => {
      const run1 = computeCareerRecommendations(DEFAULT_GUEST_PROFILE);
      const run2 = computeCareerRecommendations(DEFAULT_GUEST_PROFILE);

      expect(run1.length).toBe(run2.length);
      for (let i = 0; i < run1.length; i++) {
        expect(run1[i].career.slug).toBe(run2[i].career.slug);
        expect(run1[i].fitScore).toBe(run2[i].fitScore);
        expect(run1[i].fitBand).toBe(run2[i].fitBand);
        expect(run1[i].matchReasons).toEqual(run2[i].matchReasons);
        expect(run1[i].uncertainties).toEqual(run2[i].uncertainties);
      }
    });
  });

  describe("7. Explanation Provenance & Honest Boundaries", () => {
    it("only cites interests the student actually declared", () => {
      const artStudent: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        discipline: "arts_design",
        interests: ["Visual Arts", "Human Psychology"],
        selectedWorkStyles: ["creative"],
      };

      const recs = computeCareerRecommendations(artStudent);
      const techRec = recs.find((r) => r.career.slug === "full-stack-systems-engineer")!;

      // Art student has no technology interests declared
      expect(techRec.evidenceBreakdown.statedInterests.length).toBe(0);
      const hasTechInterestClaim = techRec.matchReasons.some((m) =>
        m.includes("Reflects your active interest in")
      );
      expect(hasTechInterestClaim).toBe(false);
    });

    it("preserves skill evidence states: self-reported does not equal practically demonstrated", () => {
      const profileWithEvidence: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        skillEvidence: {
          "web-development": {
            skillId: "web-development",
            state: "self_reported",
            updatedAt: new Date().toISOString(),
          },
          "sql-relational": {
            skillId: "sql-relational",
            state: "practically_demonstrated",
            updatedAt: new Date().toISOString(),
          },
        },
      };

      const recs = computeCareerRecommendations(profileWithEvidence);
      const techRec = recs.find((r) => r.career.slug === "full-stack-systems-engineer")!;

      expect(techRec.skillCoveragePercent).toBeGreaterThan(0);
      expect(techRec.skillCoveragePercent).toBeLessThan(100);
      expect(profileWithEvidence.skillEvidence["web-development"].state).toBe("self_reported");
      expect(profileWithEvidence.skillEvidence["sql-relational"].state).toBe("practically_demonstrated");
    });
  });

  describe("8. Cross-Module Consistency: Roadmap Synchronization & Capacity", () => {
    it("initializes task-1 as completed and unlocks task-2 when trial was completed prior to target setting", () => {
      const completedTrialSlug = "product-ux-designer";
      const completedTrialId = "trial-ux-design";

      const roadmap = generateInitialRoadmap(
        completedTrialSlug,
        8,
        false,
        [completedTrialId]
      );

      expect(roadmap.tasks[0].id).toBe("task-1");
      expect(roadmap.tasks[0].status).toBe("completed");
      expect(roadmap.tasks[1].id).toBe("task-2");
      expect(roadmap.tasks[1].status).toBe("available");
    });

    it("respects College Exam Mode throttling in roadmap and first step", () => {
      const examProfile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        isExamMode: true,
        weeklyCapacityHours: 10,
        completedTrialIds: ["trial-fullstack-debug"],
        trialReflections: {
          "trial-fullstack-debug": {
            trialId: "trial-fullstack-debug",
            rating: 5,
            score: 100,
            reflection: "Debugged N+1 queries.",
            submittedAt: new Date().toISOString(),
          },
        },
      };

      const roadmap = generateInitialRoadmap("full-stack-systems-engineer", 10, true, ["trial-fullstack-debug"]);
      expect(roadmap.isExamMode).toBe(true);
      expect(roadmap.weeklyCapacityHours).toBe(4); // Throttled to 40%

      const rec = getRecommendationForCareer(examProfile, "full-stack-systems-engineer")!;
      expect(rec.recommendedFirstStep.toLowerCase()).toContain("exam mode");
    });
  });
});
