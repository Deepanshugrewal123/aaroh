import { CareerRole, UserProfile } from "./types";
import { CAREERS_CATALOG } from "./careers-data";
import { SKILLS_CATALOG } from "./skills-data";

export interface RecommendationExplanation {
  career: CareerRole;
  fitScore: number; // 0-100 (Hypothesis compatibility index)
  skillCoveragePercent: number; // Transparent skill coverage
  matchReasons: string[];
  uncertainties: string[];
  recommendedFirstStep: string;
}

export function computeCareerRecommendations(profile: UserProfile): RecommendationExplanation[] {
  return CAREERS_CATALOG.map((career) => {
    let score = 0;
    const matchReasons: string[] = [];
    const uncertainties: string[] = [];

    // 1. Discipline alignment (up to 30 points)
    if (profile.discipline === "undecided") {
      score += 20; // Fair neutral baseline for explorers
      matchReasons.push("Accessible entry point for multi-disciplinary explorers");
    } else if (career.discipline === profile.discipline) {
      score += 30;
      matchReasons.push(`Strong alignment with your background in ${profile.discipline.replace("_", " ")}`);
    } else {
      score += 10;
      uncertainties.push(`Different from your declared field (${profile.discipline}); requires cross-disciplinary bridge learning`);
    }

    // 2. Workstyle synergy (up to 25 points)
    const matchingStyles = career.workStyle.filter((style) =>
      profile.selectedWorkStyles.includes(style)
    );
    if (matchingStyles.length > 0) {
      const styleScore = Math.min(25, matchingStyles.length * 12);
      score += styleScore;
      matchReasons.push(`Matches your preferred ${matchingStyles.join(", ")} work styles`);
    } else {
      uncertainties.push("Day-to-day work style differs from your current preferences");
    }

    // 3. User Interests overlap (up to 20 points)
    const matchedInterests = profile.interests.filter((interest) => {
      const lower = interest.toLowerCase();
      return (
        career.title.toLowerCase().includes(lower) ||
        career.tagline.toLowerCase().includes(lower) ||
        career.summary.toLowerCase().includes(lower)
      );
    });
    if (matchedInterests.length > 0) {
      score += Math.min(20, matchedInterests.length * 10);
      matchReasons.push(`Reflects your active interests in: ${matchedInterests.join(", ")}`);
    }

    // 4. Trial Completion & Feedback (up to 15 points)
    const trialCompleted = profile.completedTrialIds.some((id) => id.includes(career.slug.split("-")[0]));
    if (trialCompleted) {
      score += 15;
      matchReasons.push("You completed a hands-on micro-trial for this career path");
    } else {
      uncertainties.push("You haven't completed a micro-trial yet to test how the day-to-day work feels");
    }

    // 5. Skill Evidence Coverage calculation (transparent formula)
    let totalSkillWeight = 0;
    let earnedSkillPoints = 0;

    career.skillsRequired.forEach((req) => {
      const weight = req.importance === "essential" ? 3 : req.importance === "advantageous" ? 2 : 1;
      totalSkillWeight += weight;

      const userEvidence = profile.skillEvidence[req.skillId];
      if (userEvidence) {
        if (userEvidence.state === "independently_verified") {
          earnedSkillPoints += weight * 1.0;
        } else if (userEvidence.state === "practically_demonstrated") {
          earnedSkillPoints += weight * 0.9;
        } else if (userEvidence.state === "coursework") {
          earnedSkillPoints += weight * 0.6;
        } else if (userEvidence.state === "self_reported") {
          earnedSkillPoints += weight * 0.35;
        }
      }
    });

    const skillCoveragePercent = totalSkillWeight > 0
      ? Math.round((earnedSkillPoints / totalSkillWeight) * 100)
      : 0;

    // Additional points for existing skill overlap
    score += Math.round((skillCoveragePercent / 100) * 10);

    // Bounded between 15 and 98 to explicitly communicate that no career is a 100% deterministic prediction
    const boundedScore = Math.min(96, Math.max(20, Math.round(score)));

    // Generate actionable next step
    let recommendedFirstStep = `Try the interactive micro-trial for ${career.title} to test actual work examples.`;
    if (trialCompleted && skillCoveragePercent < 50) {
      const topMissingSkill = career.skillsRequired.find(
        (r) => !profile.skillEvidence[r.skillId] || profile.skillEvidence[r.skillId].state === "not_assessed"
      );
      const skillName = topMissingSkill ? (SKILLS_CATALOG[topMissingSkill.skillId]?.name || "core prerequisites") : "foundations";
      recommendedFirstStep = `Build baseline evidence in ${skillName} through the guided Project Studio.`;
    }

    return {
      career,
      fitScore: boundedScore,
      skillCoveragePercent,
      matchReasons: matchReasons.length > 0 ? matchReasons : ["General exploratory compatibility"],
      uncertainties,
      recommendedFirstStep,
    };
  }).sort((a, b) => b.fitScore - a.fitScore);
}
