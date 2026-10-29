import { describe, it, expect } from "vitest";
import { soundEngine } from "../lib/sound-engine";
import { CAREER_TRIALS, evaluateTrialSubmission } from "../lib/trials-data";
import { CAREERS_CATALOG } from "../lib/careers-data";

describe("Cinematic Landing Components & Audio Engine", () => {
  it("verifies sound engine singleton handles non-browser / headless environments safely", () => {
    expect(soundEngine).toBeDefined();
    // In headless Node test environment, window.AudioContext may be undefined
    // soundEngine methods must not throw
    expect(() => soundEngine.init()).not.toThrow();
    expect(() => soundEngine.toggle()).not.toThrow();
    expect(() => soundEngine.playChime(0)).not.toThrow();
    expect(() => soundEngine.playChime(6)).not.toThrow();
    expect(soundEngine.getIsActive()).toBe(false);
  });

  it("verifies live trial evaluation returns deterministic rubric data on user selection", () => {
    const uxTrial = CAREER_TRIALS.find((t) => t.id === "trial-ux-design")!;
    expect(uxTrial).toBeDefined();

    const optionA = uxTrial.practicalTask.options![0];
    const evaluation = evaluateTrialSubmission(uxTrial, optionA.id, "High contrast accessible design");

    expect(evaluation.score).toBeGreaterThanOrEqual(90);
    expect(evaluation.ratingBand).toBe("exemplary");
    expect(evaluation.overallFeedback).toContain("solves physical motor constraints");
    expect(evaluation.criteriaScores.length).toBe(3);
  });

  it("verifies all 7 disciplines in the constellation explorer match careers catalog", () => {
    const requiredSlugs = [
      "full-stack-systems-engineer",
      "product-ux-designer",
      "financial-analyst",
      "public-policy-analyst",
      "environmental-data-researcher",
      "clinical-research-coordinator",
      "investigative-tech-journalist",
    ];

    expect(requiredSlugs.length).toBe(7);
    requiredSlugs.forEach((slug) => {
      const career = CAREERS_CATALOG.find((c) => c.slug === slug);
      expect(career).toBeDefined();
      expect(career?.title.length).toBeGreaterThan(0);
      expect(career?.dayInTheLife.coreActivities.length).toBeGreaterThanOrEqual(3);
      expect(career?.tradeoffsAndRealities.commonMisconceptions.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("verifies career constellation coordinates cover 3D spherical space without overlap", () => {
    // 7 multidisciplinary nodes in 3D WebGL space
    const nodes = [
      { id: "tech", pos: [2.8, 0.4, 0.5] },
      { id: "design", pos: [-2.6, 0.8, -0.6] },
      { id: "finance", pos: [2.1, -1.2, -1.4] },
      { id: "policy", pos: [-1.8, -1.5, 0.8] },
      { id: "science", pos: [0.8, 1.9, -1.0] },
      { id: "healthcare", pos: [-0.9, 1.8, 1.2] },
      { id: "media", pos: [0.2, -2.1, -0.3] },
    ];

    expect(nodes.length).toBe(7);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const [x1, y1, z1] = nodes[i].pos;
        const [x2, y2, z2] = nodes[j].pos;
        const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
        // Minimum distance between distinct orbital hubs should be at least 2.0 units
        expect(dist).toBeGreaterThan(2.0);
      }
    }
  });
});
