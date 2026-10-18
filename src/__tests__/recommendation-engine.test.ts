import { describe, it, expect } from "vitest";
import { computeCareerRecommendations } from "../lib/recommendation-engine";
import { DEFAULT_GUEST_PROFILE, generateInitialRoadmap } from "../lib/store";
import { CAREERS_CATALOG } from "../lib/careers-data";
import { SKILLS_CATALOG } from "../lib/skills-data";

describe("Aaroh Recommendation Engine", () => {
  it("never returns a deterministic 100% certainty score", () => {
    const recs = computeCareerRecommendations(DEFAULT_GUEST_PROFILE);
    expect(recs.length).toBeGreaterThan(0);
    recs.forEach((rec) => {
      // Score should always remain bounded to reflect visible uncertainty
      expect(rec.fitScore).toBeLessThanOrEqual(98);
      expect(rec.fitScore).toBeGreaterThanOrEqual(15);
    });
  });

  it("calculates transparent skill coverage without claiming hiring probability", () => {
    const profileWithSkills = {
      ...DEFAULT_GUEST_PROFILE,
      skillEvidence: {
        "visual-hierarchy": {
          skillId: "visual-hierarchy",
          state: "practically_demonstrated" as const,
          updatedAt: new Date().toISOString(),
        },
        "ui-prototyping": {
          skillId: "ui-prototyping",
          state: "coursework" as const,
          updatedAt: new Date().toISOString(),
        },
      },
    };

    const recs = computeCareerRecommendations(profileWithSkills);
    const uxRec = recs.find((r) => r.career.slug === "product-ux-designer");
    expect(uxRec).toBeDefined();
    expect(uxRec?.skillCoveragePercent).toBeGreaterThan(0);
    expect(uxRec?.skillCoveragePercent).toBeLessThanOrEqual(100);
  });

  it("identifies explicit uncertainties for unassessed roles", () => {
    const recs = computeCareerRecommendations(DEFAULT_GUEST_PROFILE);
    recs.forEach((rec) => {
      expect(Array.isArray(rec.uncertainties)).toBe(true);
      expect(Array.isArray(rec.matchReasons)).toBe(true);
      expect(typeof rec.recommendedFirstStep).toBe("string");
    });
  });
});

describe("Adaptive Roadmap Generator", () => {
  it("generates sequenced tasks with prerequisites and instructions", () => {
    const roadmap = generateInitialRoadmap("full-stack-systems-engineer", 8, false);
    expect(roadmap.tasks.length).toBe(4);
    expect(roadmap.weeklyCapacityHours).toBe(8);
    expect(roadmap.tasks[0].status).toBe("available");
    expect(roadmap.tasks[1].status).toBe("locked");
  });

  it("throttles capacity down during exam mode without deleting tasks", () => {
    const regular = generateInitialRoadmap("full-stack-systems-engineer", 10, false);
    const exam = generateInitialRoadmap("full-stack-systems-engineer", 10, true);

    expect(exam.isExamMode).toBe(true);
    expect(exam.weeklyCapacityHours).toBeLessThan(regular.weeklyCapacityHours);
    expect(exam.tasks.length).toBe(regular.tasks.length);
  });
});

describe("Skills Catalog Integrity", () => {
  it("verifies all prerequisite skill IDs exist in the catalog", () => {
    Object.values(SKILLS_CATALOG).forEach((skill) => {
      if (skill.prerequisites) {
        skill.prerequisites.forEach((prereqId) => {
          expect(SKILLS_CATALOG[prereqId]).toBeDefined();
        });
      }
    });
  });

  it("verifies all career required skill IDs exist in the catalog", () => {
    CAREERS_CATALOG.forEach((career) => {
      career.skillsRequired.forEach((req) => {
        expect(SKILLS_CATALOG[req.skillId]).toBeDefined();
      });
    });
  });
});
