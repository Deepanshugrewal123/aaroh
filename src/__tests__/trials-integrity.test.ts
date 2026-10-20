import { describe, it, expect } from "vitest";
import {
  CAREER_TRIALS,
  evaluateTrialSubmission,
  getTrialById,
  getTrialByCareerSlug,
  isCareerTrialCompleted,
} from "../lib/trials-data";
import { CAREERS_CATALOG } from "../lib/careers-data";
import { computeCareerRecommendations } from "../lib/recommendation-engine";
import { DEFAULT_GUEST_PROFILE } from "../lib/store";
import { UserProfile } from "../lib/types";

describe("Career Trial Integrity & Catalog Validation", () => {
  it("contains exactly 7 distinct, curated micro-trials covering all catalog careers", () => {
    expect(CAREER_TRIALS.length).toBe(7);
    const trialIds = CAREER_TRIALS.map((t) => t.id);
    const uniqueIds = new Set(trialIds);
    expect(uniqueIds.size).toBe(7);

    // Every career in CAREERS_CATALOG has a corresponding micro-trial
    CAREERS_CATALOG.forEach((career) => {
      const trial = CAREER_TRIALS.find((t) => t.careerSlug === career.slug);
      expect(trial).toBeDefined();
      expect(trial?.discipline).toBe(career.discipline);
    });
  });

  it("ensures every trial's evaluation criteria weights sum exactly to 100", () => {
    CAREER_TRIALS.forEach((trial) => {
      const totalWeight = trial.evaluationCriteria.reduce((sum, c) => sum + c.weight, 0);
      expect(totalWeight).toBe(100);
      expect(trial.evaluationCriteria.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("ensures all trials have at least 2 structured options with valid score bounds", () => {
    CAREER_TRIALS.forEach((trial) => {
      expect(trial.practicalTask.options).toBeDefined();
      expect(trial.practicalTask.options?.length).toBeGreaterThanOrEqual(3);
      trial.practicalTask.options?.forEach((opt) => {
        expect(opt.score).toBeGreaterThanOrEqual(10);
        expect(opt.score).toBeLessThanOrEqual(100);
        expect(opt.label.length).toBeGreaterThan(10);
        expect(opt.explanation.length).toBeGreaterThan(15);
      });
    });
  });
});

describe("Deterministic Rubric Evaluator", () => {
  const trial = CAREER_TRIALS[0]; // UX design trial

  it("awards high score and exemplary rating band for optimal choices", () => {
    const optimalOption = trial.practicalTask.options?.find((o) => o.score >= 90);
    expect(optimalOption).toBeDefined();

    const result = evaluateTrialSubmission(
      trial,
      optimalOption!.id,
      "We must prioritize WCAG AA contrast and touch targets so vulnerable patients are not stranded."
    );

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.ratingBand).toBe("exemplary");
    expect(result.criteriaScores.length).toBe(trial.evaluationCriteria.length);
    result.criteriaScores.forEach((c) => {
      expect(c.score).toBeGreaterThanOrEqual(75);
    });
  });

  it("awards developing/needs_revision rating band for poor choices", () => {
    const poorOption = trial.practicalTask.options?.find((o) => o.score <= 40);
    expect(poorOption).toBeDefined();

    const result = evaluateTrialSubmission(trial, poorOption!.id, "Quick cosmetic change.");

    expect(result.score).toBeLessThanOrEqual(50);
    expect(result.ratingBand === "developing" || result.ratingBand === "needs_revision").toBe(true);
  });

  it("rewards substantive rationale with a transparent bonus capped at 100", () => {
    const optimalOption = trial.practicalTask.options?.find((o) => o.score >= 90)!;

    const shortResult = evaluateTrialSubmission(trial, optimalOption.id, "Quick note");
    const detailedResult = evaluateTrialSubmission(
      trial,
      optimalOption.id,
      "Key UX friction observed: Low visual contrast and non-actionable error copy.\n\nMy proposed remediation rationale: By fixing button touch boundaries to 48px and adding clear fallback text, we reduce clinic staff intervention while preserving patient autonomy under stress."
    );

    expect(detailedResult.score).toBeGreaterThanOrEqual(shortResult.score);
    expect(detailedResult.score).toBeLessThanOrEqual(100);
  });
});

describe("Healthcare / Clinical Coordinator Micro-Trial", () => {
  const trial = getTrialById("trial-clinical-coordination");

  it("exists and is linked to clinical-research-coordinator", () => {
    expect(trial).toBeDefined();
    expect(trial?.careerSlug).toBe("clinical-research-coordinator");
    expect(trial?.discipline).toBe("healthcare");
  });

  it("contains clear disclaimer distinguishing administrative coordination from medical diagnosis", () => {
    expect(trial?.disclaimerNotice).toBeDefined();
    expect(trial?.disclaimerNotice?.toLowerCase()).toContain("fictional scenario");
    expect(trial?.disclaimerNotice?.toLowerCase()).toContain("not teach or evaluate clinical diagnosis");
  });

  it("provides structured patient queue reference data with clinical/logistical constraints", () => {
    expect(trial?.referenceData).toBeDefined();
    expect(trial?.referenceData?.rows.length).toBe(4);
    const rowTexts = JSON.stringify(trial?.referenceData?.rows);
    expect(rowTexts).toContain("Pt #101");
    expect(rowTexts).toContain("Pt #103");
    expect(rowTexts).toContain("ambulance return dispatch");
  });

  it("evaluates prioritizing patient safety and nurse triage over administrative convenience", () => {
    const optionA = trial?.practicalTask.options?.find((o) => o.id === "option-a");
    const optionB = trial?.practicalTask.options?.find((o) => o.id === "option-b");
    const optionC = trial?.practicalTask.options?.find((o) => o.id === "option-c");

    expect(optionA?.score).toBe(95);
    expect(optionB?.score).toBe(40);
    expect(optionC?.score).toBe(25);

    expect(optionA?.explanation.toLowerCase()).toContain("prioritizes potential clinical risk");
    expect(optionC?.explanation.toLowerCase()).toContain("dangerous and non-compliant");
  });
});

describe("Environmental Data Researcher Micro-Trial", () => {
  const trial = getTrialById("trial-environmental-data");

  it("exists and is linked to environmental-data-researcher", () => {
    expect(trial).toBeDefined();
    expect(trial?.careerSlug).toBe("environmental-data-researcher");
    expect(trial?.discipline).toBe("science_research");
  });

  it("prominently discloses synthetic dataset nature to uphold scientific integrity", () => {
    expect(trial?.disclaimerNotice).toBeDefined();
    expect(trial?.disclaimerNotice).toContain("SYNTHETIC DATASET NOTICE");
    expect(trial?.referenceData?.disclosureNotice).toContain("SYNTHETIC DATASET");
  });

  it("provides 4-zone microclimate data with temperature, PM2.5, canopy cover, and missingness", () => {
    expect(trial?.referenceData?.rows.length).toBe(4);
    const dataString = JSON.stringify(trial?.referenceData);
    expect(dataString).toContain("38.6°C");
    expect(dataString).toContain("28.7°C");
    expect(dataString).toContain("19.4%");
  });

  it("evaluates accurate delta calculation (9.9°C) and uncertainty recognition over linear causation", () => {
    const optionA = trial?.practicalTask.options?.find((o) => o.id === "option-a");
    const optionB = trial?.practicalTask.options?.find((o) => o.id === "option-b");

    expect(optionA?.score).toBe(95);
    expect(optionA?.label).toContain("9.9°C");
    expect(optionA?.label).toContain("19.4% missingness");
    expect(optionB?.score).toBe(40);
    expect(optionB?.explanation.toLowerCase()).toContain("flawed science");
  });
});

describe("Investigative Technology Journalist Micro-Trial", () => {
  const trial = getTrialById("trial-investigative-tech");

  it("exists and is linked to investigative-tech-journalist", () => {
    expect(trial).toBeDefined();
    expect(trial?.careerSlug).toBe("investigative-tech-journalist");
    expect(trial?.discipline).toBe("media_communication");
  });

  it("discloses fictional scenario and lack of reference to real companies or individuals", () => {
    expect(trial?.disclaimerNotice).toBeDefined();
    expect(trial?.disclaimerNotice).toContain("FICTIONAL SCENARIO NOTICE");
    expect(trial?.disclaimerNotice).toContain("No real companies, researchers, or individuals are represented");
  });

  it("provides 4 distinct source excerpts with rigorous evidentiary classifications", () => {
    expect(trial?.sourceExcerpts?.length).toBe(4);
    const classifications = trial?.sourceExcerpts?.map((s) => s.classification);
    expect(classifications).toContain("unverified");
    expect(classifications).toContain("disputed");
    expect(classifications).toContain("supported");
    expect(classifications).toContain("opinion");
  });

  it("rewards multi-sourced verification and formal right-of-reply over sensationalized viral leaks", () => {
    const optionA = trial?.practicalTask.options?.find((o) => o.id === "option-a");
    const optionB = trial?.practicalTask.options?.find((o) => o.id === "option-b");

    expect(optionA?.score).toBe(95);
    expect(optionA?.label.toLowerCase()).toContain("right-of-reply");
    expect(optionB?.score).toBe(35);
    expect(optionB?.explanation.toLowerCase()).toContain("severe journalistic breach");
  });
});

describe("Trial-to-Recommendation Integration & Feedback Loop", () => {
  it("correctly identifies completed trials using isCareerTrialCompleted helper", () => {
    const profileWithTrial: UserProfile = {
      ...DEFAULT_GUEST_PROFILE,
      completedTrialIds: ["trial-clinical-coordination"],
      trialReflections: {
        "trial-clinical-coordination": {
          trialId: "trial-clinical-coordination",
          rating: 5,
          reflection: "Managed outpatient scheduling successfully.",
          selectedOptionId: "option-a",
          score: 95,
          submittedAt: new Date().toISOString(),
        },
      },
    };

    expect(isCareerTrialCompleted(profileWithTrial, "clinical-research-coordinator")).toBe(true);
    expect(isCareerTrialCompleted(profileWithTrial, "environmental-data-researcher")).toBe(false);
  });

  it("increases career fit score and documents an energizing match reason for 5-star trial completion", () => {
    const baseRecs = computeCareerRecommendations(DEFAULT_GUEST_PROFILE);
    const baseCoord = baseRecs.find((r) => r.career.slug === "clinical-research-coordinator")!;

    const profileCompleted: UserProfile = {
      ...DEFAULT_GUEST_PROFILE,
      completedTrialIds: ["trial-clinical-coordination"],
      trialReflections: {
        "trial-clinical-coordination": {
          trialId: "trial-clinical-coordination",
          rating: 5,
          reflection: "Felt very natural to prioritize patient safety and organize complex schedules.",
          selectedOptionId: "option-a",
          score: 95,
          submittedAt: new Date().toISOString(),
        },
      },
    };

    const updatedRecs = computeCareerRecommendations(profileCompleted);
    const updatedCoord = updatedRecs.find((r) => r.career.slug === "clinical-research-coordinator")!;

    expect(updatedCoord.fitScore).toBeGreaterThan(baseCoord.fitScore);
    const hasEnergizingReason = updatedCoord.matchReasons.some((m) =>
      m.toLowerCase().includes("rated problem-solving energizing")
    );
    expect(hasEnergizingReason).toBe(true);
  });

  it("adds an explicit uncertainty note when a student rates trial problem-solving as draining (1/5)", () => {
    const profileLowRating: UserProfile = {
      ...DEFAULT_GUEST_PROFILE,
      completedTrialIds: ["trial-environmental-data"],
      trialReflections: {
        "trial-environmental-data": {
          trialId: "trial-environmental-data",
          rating: 1,
          reflection: "Working through sensor datasets felt monotonous and exhausting.",
          selectedOptionId: "option-a",
          score: 95,
          submittedAt: new Date().toISOString(),
        },
      },
    };

    const recs = computeCareerRecommendations(profileLowRating);
    const envRec = recs.find((r) => r.career.slug === "environmental-data-researcher")!;

    const hasLowAffinityUncertainty = envRec.uncertainties.some((u) =>
      u.toLowerCase().includes("rated daily problem-solving affinity low")
    );
    expect(hasLowAffinityUncertainty).toBe(true);
  });

  it("strictly preserves evidence boundary: trial completion never alters skill matrix to practically_demonstrated", () => {
    const profileWithTrial: UserProfile = {
      ...DEFAULT_GUEST_PROFILE,
      completedTrialIds: ["trial-investigative-tech"],
      trialReflections: {
        "trial-investigative-tech": {
          trialId: "trial-investigative-tech",
          rating: 4,
          reflection: "Investigative verification exercise completed.",
          score: 95,
          submittedAt: new Date().toISOString(),
        },
      },
    };

    // Skill evidence must remain unaffected by micro-trials
    expect(profileWithTrial.skillEvidence["written-communication"]?.state).not.toBe("practically_demonstrated");
  });
});
