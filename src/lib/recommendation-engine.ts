import { CareerRole, UserProfile } from "./types";
import { CAREERS_CATALOG } from "./careers-data";
import { SKILLS_CATALOG } from "./skills-data";
import { CAREER_TRIALS } from "./trials-data";

export interface EvidenceBreakdown {
  statedInterests: string[];
  matchedWorkStyles: string[];
  disciplineAlignment: "direct" | "cross_disciplinary" | "undecided_explorer";
  trialStatus: "not_attempted" | "completed";
  trialRubricScore?: number; // 0-100 task performance
  trialEnjoymentRating?: number; // 1-5 energy affinity
  skillCoveragePercent: number; // 0-100 assessed skill coverage
  unassessedSkillsCount: number; // Unknowns count
  essentialSkillsCount: number;
}

export interface RecommendationExplanation {
  career: CareerRole;
  fitScore: number; // 0-100 Hypothesis Exploration Index (Heuristic)
  fitBand: "strong_hypothesis" | "promising_alternative" | "exploratory_bridge";
  skillCoveragePercent: number;
  unassessedSkillsCount: number;
  evidenceBreakdown: EvidenceBreakdown;
  matchReasons: string[];
  uncertainties: string[];
  recommendedFirstStep: string;
  heuristicLimitationsNote: string;
}

// Semantic domain tags to match user interests beyond literal title substrings
const CAREER_DOMAIN_TAGS: Record<string, string[]> = {
  "product-ux-designer": [
    "design", "ux", "ui", "product", "wireframing", "accessibility", "visual",
    "human", "psychology", "prototyping", "interface", "interaction", "user experience",
    "creative", "user research", "figma"
  ],
  "financial-analyst": [
    "finance", "financial", "accounting", "valuation", "investing", "investment",
    "stock", "equity", "cogs", "margin", "economics", "modeling", "business",
    "commerce", "quantitative", "spreadsheet", "cash flow"
  ],
  "full-stack-systems-engineer": [
    "technology", "software", "engineering", "coding", "programming", "web",
    "systems", "system design", "database", "backend", "frontend", "full-stack",
    "full stack", "cloud", "devops", "typescript", "sql", "api", "algorithms"
  ],
  "public-policy-analyst": [
    "policy", "governance", "public service", "law", "government", "society",
    "civic", "regulation", "advocacy", "legislation", "social", "think tank",
    "public health", "urban planning"
  ],
  "environmental-data-researcher": [
    "environment", "environmental", "climate", "sustainability", "data", "ecology",
    "science", "geospatial", "remote sensing", "air quality", "conservation",
    "nature", "earth", "heat island", "gis", "sensors"
  ],
  "clinical-research-coordinator": [
    "healthcare", "health", "clinical", "hospital", "patient", "medicine",
    "medical", "pharma", "biotech", "life sciences", "nursing", "trials",
    "oncology", "gcp", "clinical trials"
  ],
  "investigative-tech-journalist": [
    "journalism", "journalist", "media", "investigation", "investigative",
    "writing", "communication", "ethics", "reporting", "news", "storytelling",
    "editorial", "fact-checking", "accountability"
  ],
};

const HEURISTIC_LIMITATIONS_NOTE =
  "Heuristic Exploration Index (0–100): Aaroh synthesizes declared preferences, scenario trial performance, and logged skill evidence. This index guides self-directed exploration and does not constitute a psychometric or hiring prediction.";

export function computeCareerRecommendations(profile: UserProfile): RecommendationExplanation[] {
  return CAREERS_CATALOG.map((career) => {
    let score = 0;
    const matchReasons: string[] = [];
    const uncertainties: string[] = [];

    // 1. Discipline Alignment (up to 25 points)
    // Avoids crushing cross-disciplinary exploration while recognizing direct educational foundations
    if (profile.discipline === "undecided") {
      score += 20; // Fair neutral baseline for multi-disciplinary explorers
      matchReasons.push("Accessible entry point for multi-disciplinary explorers");
    } else if (career.discipline === profile.discipline) {
      score += 25;
      matchReasons.push(`Direct alignment with your declared field in ${profile.discipline.replace("_", " ")}`);
    } else {
      score += 12; // Modest exploration baseline; cross-disciplinary paths are valid hypotheses
      uncertainties.push(
        `Cross-disciplinary path from ${profile.discipline.replace("_", " ")}; requires foundational bridge learning`
      );
    }

    // 2. Workstyle Synergy (up to 25 points)
    const matchingStyles = career.workStyle.filter((style) =>
      profile.selectedWorkStyles.includes(style)
    );
    if (matchingStyles.length === 3) {
      score += 25;
      matchReasons.push(`Complete synergy with your preferred ${matchingStyles.join(", ")} work styles`);
    } else if (matchingStyles.length === 2) {
      score += 20;
      matchReasons.push(`Strong overlap with your ${matchingStyles.join(" and ")} work styles`);
    } else if (matchingStyles.length === 1) {
      score += 12;
      matchReasons.push(`Reflects your ${matchingStyles[0]} work style`);
    } else {
      uncertainties.push("Day-to-day work style differs from your currently selected preferences");
    }

    // 3. User Interests Overlap & Semantic Domain Matching (up to 20 points)
    const domainTags = CAREER_DOMAIN_TAGS[career.slug] || [];
    const matchedInterests: string[] = [];

    profile.interests.forEach((rawInterest) => {
      const lower = rawInterest.toLowerCase().trim();
      if (!lower) return;

      const titleMatch = career.title.toLowerCase().includes(lower);
      const taglineMatch = career.tagline.toLowerCase().includes(lower);
      const summaryMatch = career.summary.toLowerCase().includes(lower);
      const tagMatch = domainTags.some((tag) => lower.includes(tag) || tag.includes(lower));
      const skillMatch = career.skillsRequired.some((req) => {
        const skillName = SKILLS_CATALOG[req.skillId]?.name.toLowerCase() || "";
        return lower.includes(skillName) || skillName.includes(lower);
      });

      if (titleMatch || taglineMatch || summaryMatch || tagMatch || skillMatch) {
        if (!matchedInterests.includes(rawInterest)) {
          matchedInterests.push(rawInterest);
        }
      }
    });

    if (matchedInterests.length > 0) {
      // Each matched interest contributes 7 points, capped at 20
      const interestPoints = Math.min(20, matchedInterests.length * 7);
      score += interestPoints;
      matchReasons.push(`Reflects your active interest in: ${matchedInterests.join(", ")}`);
    } else {
      uncertainties.push("No explicit overlap with your declared interests yet (exploratory option)");
    }

    // 4. Decoupled Trial Signal: Task Performance vs Daily Enjoyment (up to 18 points)
    // Distinguishes scenario problem-solving aptitude from personal daily workflow enjoyment
    const completedTrial = CAREER_TRIALS.find(
      (t) => t.careerSlug === career.slug && profile.completedTrialIds.includes(t.id)
    );

    let trialTaskScore: number | undefined = undefined;
    let trialEnjoymentRating: number | undefined = undefined;

    if (completedTrial) {
      const savedRecord = profile.trialReflections[completedTrial.id];
      trialEnjoymentRating = savedRecord?.rating ?? 4;
      trialTaskScore = savedRecord?.score ?? 80;

      // Rubric Task Performance component (up to 8 points)
      let performancePoints = 0;
      if (trialTaskScore >= 85) {
        performancePoints = 8;
      } else if (trialTaskScore >= 60) {
        performancePoints = 5;
      } else {
        performancePoints = 2; // Baseline exploration effort acknowledged
      }

      // Daily Problem-Solving Enjoyment component (up to 10 points)
      let enjoymentPoints = 0;
      if (trialEnjoymentRating >= 4) {
        enjoymentPoints = 10;
      } else if (trialEnjoymentRating === 3) {
        enjoymentPoints = 6;
      } else {
        enjoymentPoints = 2; // Low affinity acknowledged
      }

      score += performancePoints + enjoymentPoints;

      // Transparent provenance reasoning
      if (trialTaskScore >= 75 && trialEnjoymentRating >= 4) {
        matchReasons.push(
          `Strong affinity: Solved trial scenario with high rubric score (${trialTaskScore}%) and rated problem-solving energizing (${trialEnjoymentRating}/5)`
        );
      } else if (trialTaskScore >= 75 && trialEnjoymentRating <= 2) {
        matchReasons.push(
          `Aptitude demonstrated: Solved trial scenario with high rubric score (${trialTaskScore}%)`
        );
        uncertainties.push(
          `Rated daily problem-solving affinity low / draining (${trialEnjoymentRating}/5) — reflect on whether this daily workflow suits your preferences`
        );
      } else if (trialTaskScore < 75 && trialEnjoymentRating >= 4) {
        matchReasons.push(
          `High motivation: Rated trial problem-solving energizing (${trialEnjoymentRating}/5)`
        );
        uncertainties.push(
          `Trial task score (${trialTaskScore}%) showed trade-off vulnerabilities; foundational study recommended`
        );
      } else if (trialTaskScore < 75 && trialEnjoymentRating <= 2) {
        uncertainties.push(
          `Completed trial with lower task score (${trialTaskScore}%) and rated daily problem-solving affinity low / draining (${trialEnjoymentRating}/5)`
        );
      } else {
        matchReasons.push(
          `Completed micro-trial with moderate engagement (${trialEnjoymentRating}/5) and ${trialTaskScore}% task score`
        );
      }
    } else {
      uncertainties.push(
        "You haven't completed the 12-minute micro-trial yet to test how the day-to-day work feels"
      );
    }

    // 5. Demonstrated Skill Evidence (up to 12 points)
    // Missing evidence is tracked as an unknown rather than a lack of innate ability
    let totalSkillWeight = 0;
    let earnedSkillPoints = 0;
    let unassessedSkillsCount = 0;

    career.skillsRequired.forEach((req) => {
      const weight = req.importance === "essential" ? 3 : req.importance === "advantageous" ? 2 : 1;
      totalSkillWeight += weight;

      const userEvidence = profile.skillEvidence[req.skillId];
      if (userEvidence && userEvidence.state !== "not_assessed") {
        if (userEvidence.state === "independently_verified") {
          earnedSkillPoints += weight * 1.0;
        } else if (userEvidence.state === "practically_demonstrated") {
          earnedSkillPoints += weight * 0.9;
        } else if (userEvidence.state === "student_attested") {
          earnedSkillPoints += weight * 0.75;
        } else if (userEvidence.state === "coursework") {
          earnedSkillPoints += weight * 0.6;
        } else if (userEvidence.state === "self_reported") {
          earnedSkillPoints += weight * 0.35;
        }
      } else {
        unassessedSkillsCount++;
      }
    });

    const skillCoveragePercent = totalSkillWeight > 0
      ? Math.round((earnedSkillPoints / totalSkillWeight) * 100)
      : 0;

    score += Math.round((skillCoveragePercent / 100) * 12);

    if (skillCoveragePercent > 30) {
      matchReasons.push(
        `Logged ${skillCoveragePercent}% evidence coverage across core skill requirements`
      );
    }

    if (unassessedSkillsCount > 0) {
      uncertainties.push(
        `${unassessedSkillsCount} of ${career.skillsRequired.length} required skills are not yet assessed. Missing evidence indicates unexplored ground, not lack of ability.`
      );
    }

    // Bounded between 18 and 96 to explicitly communicate that no career is a 100% deterministic prediction
    const boundedScore = Math.min(95, Math.max(20, Math.round(score)));

    let fitBand: RecommendationExplanation["fitBand"] = "exploratory_bridge";
    if (boundedScore >= 75) {
      fitBand = "strong_hypothesis";
    } else if (boundedScore >= 55) {
      fitBand = "promising_alternative";
    } else {
      fitBand = "exploratory_bridge";
    }

    // Context-Aware Actionable Next Step
    let recommendedFirstStep = `Try the 12-minute ${career.title} micro-trial to experience the daily problem-solving firsthand.`;
    if (completedTrial) {
      if (skillCoveragePercent < 45) {
        const topMissingSkill = career.skillsRequired.find(
          (r) =>
            !profile.skillEvidence[r.skillId] ||
            profile.skillEvidence[r.skillId].state === "not_assessed" ||
            profile.skillEvidence[r.skillId].state === "self_reported"
        );
        const skillName = topMissingSkill
          ? (SKILLS_CATALOG[topMissingSkill.skillId]?.name || "core prerequisites")
          : "foundations";
        const capacityText = profile.isExamMode
          ? "paced for Exam Mode (3 hrs/wk)"
          : `${profile.weeklyCapacityHours} hrs/wk capacity`;
        recommendedFirstStep = `Review foundational concepts in ${skillName} (${capacityText}).`;
      } else {
        recommendedFirstStep = `Start the vertical-slice starter brief in Project Studio to build demonstrated portfolio evidence.`;
      }
    }

    const evidenceBreakdown: EvidenceBreakdown = {
      statedInterests: matchedInterests,
      matchedWorkStyles: matchingStyles,
      disciplineAlignment:
        profile.discipline === "undecided"
          ? "undecided_explorer"
          : career.discipline === profile.discipline
          ? "direct"
          : "cross_disciplinary",
      trialStatus: completedTrial ? "completed" : "not_attempted",
      trialRubricScore: trialTaskScore,
      trialEnjoymentRating: trialEnjoymentRating,
      skillCoveragePercent,
      unassessedSkillsCount,
      essentialSkillsCount: career.skillsRequired.filter((r) => r.importance === "essential").length,
    };

    return {
      career,
      fitScore: boundedScore,
      fitBand,
      skillCoveragePercent,
      unassessedSkillsCount,
      evidenceBreakdown,
      matchReasons: matchReasons.length > 0 ? matchReasons : ["General exploratory compatibility"],
      uncertainties,
      recommendedFirstStep,
      heuristicLimitationsNote: HEURISTIC_LIMITATIONS_NOTE,
    };
  }).sort((a, b) => b.fitScore - a.fitScore);
}

export function getRecommendationForCareer(
  profile: UserProfile,
  careerSlug: string
): RecommendationExplanation | undefined {
  const recommendations = computeCareerRecommendations(profile);
  return recommendations.find((r) => r.career.slug === careerSlug);
}
