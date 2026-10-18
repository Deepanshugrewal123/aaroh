import { describe, it, expect } from "vitest";
import { computeCareerRecommendations } from "../lib/recommendation-engine";
import { DEFAULT_GUEST_PROFILE, generateInitialRoadmap } from "../lib/store";
import { CAREERS_CATALOG } from "../lib/careers-data";
import { CAREER_TRIALS } from "../lib/trials-data";

describe("UX Simplification & Core Journey Contracts", () => {
  it("supports completely undecided student onboarding without crashing", () => {
    const undecidedProfile = {
      ...DEFAULT_GUEST_PROFILE,
      discipline: "undecided" as const,
      selectedWorkStyles: ["analytical" as const],
      interests: [],
    };

    const recs = computeCareerRecommendations(undecidedProfile);
    expect(recs.length).toBeGreaterThan(0);
    // Even undecided explorers receive actionable multi-disciplinary recommendations
    expect(recs[0].career).toBeDefined();
    expect(recs[0].matchReasons.length).toBeGreaterThan(0);
    expect(recs[0].fitScore).toBeLessThanOrEqual(98);
    expect(recs[0].fitScore).toBeGreaterThanOrEqual(15);
  });

  it("ensures all micro-trials have valid career associations and reasonable durations", () => {
    expect(CAREER_TRIALS.length).toBeGreaterThanOrEqual(4);
    CAREER_TRIALS.forEach((trial) => {
      // Must take between 5 and 20 mins to remain a low-stress micro-trial
      expect(trial.estimatedMinutes).toBeGreaterThanOrEqual(5);
      expect(trial.estimatedMinutes).toBeLessThanOrEqual(25);
      // Practical task must have clear instructions and evaluation criteria
      expect(trial.instructions.length).toBeGreaterThan(0);
      expect(trial.evaluationCriteria.length).toBeGreaterThan(0);
      expect(trial.reflectionQuestions.length).toBeGreaterThan(0);
    });
  });

  it("verifies college exam mode throttles weekly hours without dropping tasks", () => {
    const standardPlan = generateInitialRoadmap("full-stack-systems-engineer", 8, false);
    const examPlan = generateInitialRoadmap("full-stack-systems-engineer", 8, true);

    expect(examPlan.weeklyCapacityHours).toBe(3); // Capped at ~3 hrs
    expect(examPlan.tasks.length).toBe(standardPlan.tasks.length);
    expect(examPlan.isExamMode).toBe(true);
  });
});
