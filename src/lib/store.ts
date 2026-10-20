"use client";

import { useEffect, useState } from "react";
import {
  UserProfile,
  Roadmap,
  UserSkillEvidence,
  EvidenceState,
  RoadmapTask,
  ProjectSubmissionRecord,
  ProjectReviewRecord,
} from "./types";
import { CAREERS_CATALOG } from "./careers-data";
import { SKILLS_CATALOG } from "./skills-data";
import { CAREER_TRIALS } from "./trials-data";
import { PROJECT_BRIEFS } from "./projects-data";
import { evaluateProjectSubmission } from "./project-evaluation";
import {
  computeSubmissionFingerprint,
  validateAndParseReviewPacket,
  applyReviewToProfile,
} from "./review-system";

const STORAGE_KEY_PROFILE = "aaroh_user_profile_v1";
const STORAGE_KEY_ROADMAP = "aaroh_user_roadmap_v1";

export const DEFAULT_GUEST_PROFILE: UserProfile = {
  id: "guest-student-101",
  name: "Aarav Sharma",
  stage: "first_second_year",
  discipline: "engineering",
  selectedWorkStyles: ["analytical", "practical_hands_on"],
  interests: ["Technology", "System Design", "Problem Solving"],
  weeklyCapacityHours: 8,
  isExamMode: false,
  targetCareerSlug: "full-stack-systems-engineer",
  targetCareerHypotheses: ["full-stack-systems-engineer", "product-ux-designer"],
  skillEvidence: {
    "critical-reasoning": {
      skillId: "critical-reasoning",
      state: "coursework",
      updatedAt: new Date().toISOString(),
      sourceTitle: "Discrete Mathematics & Logic Course",
      reflection: "Analyzed formal proofs and truth tables.",
    },
    "python-core": {
      skillId: "python-core",
      state: "self_reported",
      updatedAt: new Date().toISOString(),
      sourceTitle: "Self-study Python Basics",
    },
    "web-development": {
      skillId: "web-development",
      state: "not_assessed",
      updatedAt: new Date().toISOString(),
    },
    "sql-relational": {
      skillId: "sql-relational",
      state: "not_assessed",
      updatedAt: new Date().toISOString(),
    },
  },
  completedTrialIds: [],
  trialReflections: {},
  projectSubmissions: {},
  projectReviews: {},
  savedCareerSlugs: ["full-stack-systems-engineer", "product-ux-designer"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function generateInitialRoadmap(
  careerSlug: string,
  weeklyCapacityHours: number,
  isExamMode: boolean,
  completedTrialIds: string[] = [],
  projectSubmissions: Record<string, ProjectSubmissionRecord> = {},
  projectReviews: Record<string, ProjectReviewRecord> = {}
): Roadmap {
  const career = CAREERS_CATALOG.find((c) => c.slug === careerSlug) || CAREERS_CATALOG[2]; // Default to full-stack
  const isTrialAlreadyCompleted = CAREER_TRIALS.some(
    (t) => t.careerSlug === careerSlug && completedTrialIds.includes(t.id)
  );

  const matchingBrief = PROJECT_BRIEFS.find((p) => p.careerSlug === careerSlug);
  const isProjectAlreadyEvaluated = matchingBrief
    ? projectSubmissions[matchingBrief.id]?.status === "evaluated"
    : false;
  const projectSub = matchingBrief ? projectSubmissions[matchingBrief.id] : undefined;
  const matchingReview = matchingBrief ? (projectReviews[matchingBrief.id] || projectSub?.review) : undefined;
  const hasPassedCriteria = Boolean(
    matchingReview?.criteriaEvaluations &&
    matchingReview.criteriaEvaluations.some((c) => c.passed && c.score >= 70)
  );
  const isReviewApproved = Boolean(
    matchingReview &&
    !matchingReview.isStale &&
    matchingReview.overallDecision === "approved" &&
    matchingReview.artifactExamined &&
    hasPassedCriteria
  );

  const tasks: RoadmapTask[] = [
    {
      id: "task-1",
      title: "Interactive Micro-Trial & Reality Check",
      purpose: "Experience concrete daily tasks and trade-offs before committing study hours.",
      whyItMatters: "Validates your interest through practical work rather than superficial assumptions.",
      category: "verify",
      estimatedHours: 1,
      prerequisites: [],
      instructions: [
        `Complete the ${career.title} micro-trial scenario in Career Trial Mode.`,
        "Reflect on whether dissecting these specific problems felt energizing or draining.",
      ],
      learningResources: [
        { title: "Aaroh Micro-Trial Workspace", url: `/trials?career=${career.slug}`, isFree: true },
      ],
      completionCriteria: [
        "Submitted trial decision with rationale",
        "Recorded personal reflection on workstyle fit",
      ],
      requiredEvidenceType: "reflection",
      status: isTrialAlreadyCompleted ? "completed" : "available",
      completedAt: isTrialAlreadyCompleted ? new Date().toISOString() : undefined,
    },
    {
      id: "task-2",
      title: "Baseline Foundations & Core Prerequisite Review",
      purpose: "Master the foundational skills needed to begin real projects safely.",
      whyItMatters: "Prevents tutorial paralysis by focusing only on immediately necessary concepts.",
      category: "learn",
      estimatedHours: Math.max(4, Math.round(weeklyCapacityHours * 0.75)),
      prerequisites: ["task-1"],
      instructions: [
        "Review the core skill requirements identified in your skill gap report.",
        "Complete the free open-source interactive documentation tutorials.",
      ],
      learningResources: [
        { title: "MDN Web Docs / Official Documentation", url: "https://developer.mozilla.org", isFree: true },
      ],
      completionCriteria: [
        "Log at least 1 self-reported or coursework evidence record",
        "Complete 3 practical exercises without copying code blindly",
      ],
      requiredEvidenceType: "document",
      status: isProjectAlreadyEvaluated || isTrialAlreadyCompleted ? (isProjectAlreadyEvaluated ? "completed" : "available") : "locked",
      completedAt: isProjectAlreadyEvaluated ? projectSub?.evaluatedAt || new Date().toISOString() : undefined,
    },
    {
      id: "task-3",
      title: "Vertical-Slice Starter Project",
      purpose: "Build and deploy a small but complete demonstration with persistent data.",
      whyItMatters: "Proves you can solve an end-to-end problem rather than just writing disconnected syntax.",
      category: "build",
      estimatedHours: Math.max(6, weeklyCapacityHours),
      prerequisites: ["task-2"],
      instructions: [
        "Select the beginner starter brief from Project Studio.",
        "Implement data models, user interface, and error handling.",
        "Write a concise README explaining problem, architecture, and tradeoffs.",
      ],
      learningResources: [
        { title: "Project Studio Specifications", url: "/projects", isFree: true },
      ],
      completionCriteria: [
        "Public Git repository or demo link",
        "Structured README with testing notes",
      ],
      requiredEvidenceType: "github_repo",
      status: isProjectAlreadyEvaluated ? "completed" : (isTrialAlreadyCompleted ? "available" : "locked"),
      completedAt: isProjectAlreadyEvaluated ? projectSub?.evaluatedAt || new Date().toISOString() : undefined,
      submittedEvidence: isProjectAlreadyEvaluated && projectSub ? {
        type: "github_repo",
        urlOrText: projectSub.repoOrDemoUrl,
        notes: `Evaluated project deliverable (${projectSub.overallScore}% completeness): ${matchingBrief?.title}`,
        submittedAt: projectSub.submittedAt,
      } : undefined,
    },
    {
      id: "task-4",
      title: "Peer & Mentor Evidence Verification",
      purpose: "Subject your project to structured rubric review and log verified evidence.",
      whyItMatters: "Transforms unverified claims into credible, reviewable capability.",
      category: "verify",
      estimatedHours: 2,
      prerequisites: ["task-3"],
      instructions: [
        "Export your Review Packet from Project Studio.",
        "Request a peer or mentor examination of your codebase and live demo against the brief rubric.",
        "Import the review feedback to update your Skill Intelligence matrix to Practically Demonstrated.",
      ],
      learningResources: [
        { title: "Project Studio Review Hub", url: "/projects", isFree: true },
        { title: "Aaroh Verification Rubric", url: "/skills", isFree: true },
      ],
      completionCriteria: [
        "Codebase and live demo examined by peer or mentor",
        "All rubric criteria evaluated with actionable feedback",
        "Review packet successfully imported and verified",
      ],
      requiredEvidenceType: "demo_link",
      status: isReviewApproved ? "completed" : (isProjectAlreadyEvaluated ? "available" : "locked"),
      completedAt: isReviewApproved ? matchingReview?.reviewedAt : undefined,
      submittedEvidence: isReviewApproved && matchingReview ? {
        type: "demo_link",
        urlOrText: projectSub?.repoOrDemoUrl || "Demonstrated & Reviewed",
        notes: `Peer/mentor review by ${matchingReview.reviewerName} (${matchingReview.reviewerRole}): ${matchingReview.overallFeedback}`,
        submittedAt: matchingReview.reviewedAt,
      } : undefined,
    },
  ];

  return {
    id: `roadmap-${careerSlug}-${Date.now()}`,
    careerSlug,
    weeklyCapacityHours: isExamMode ? Math.max(3, Math.round(weeklyCapacityHours * 0.4)) : weeklyCapacityHours,
    isExamMode,
    tasks,
    generatedAt: new Date().toISOString(),
    lastAdjustedAt: new Date().toISOString(),
  };
}

export function normalizeStoredProfile(storedProfile: string | null): UserProfile {
  if (!storedProfile) return DEFAULT_GUEST_PROFILE;

  try {
    const parsed = JSON.parse(storedProfile);

    // Normalize legacy project submissions (e.g. migrate legacy "demonstrated" status to "evaluated")
    const normalizedSubmissions: Record<string, ProjectSubmissionRecord> = {};
    if (parsed.projectSubmissions && typeof parsed.projectSubmissions === "object") {
      Object.entries(parsed.projectSubmissions).forEach(([k, sub]: [string, any]) => {
        if (sub && typeof sub === "object" && (sub.projectId || sub.briefId)) {
          const fingerprint = sub.submissionFingerprint || computeSubmissionFingerprint({
            projectId: sub.projectId || k,
            repoOrDemoUrl: sub.repoOrDemoUrl || "",
            checkedDeliverableIds: sub.checkedDeliverableIds || [],
            reflection: sub.reflection || "",
          });
          normalizedSubmissions[k] = {
            ...sub,
            status: (sub.status === "demonstrated" ? "evaluated" : sub.status) as any,
            isArtifactInspected: false,
            verificationLevel: sub.verificationLevel || "student_attested",
            verificationLimitationNotice:
              sub.verificationLimitationNotice ||
              "Artifact at destination link has not been fetched or inspected by Aaroh.",
            submissionFingerprint: fingerprint,
          };
        }
      });
    }

    // Normalize project reviews
    const normalizedReviews: Record<string, ProjectReviewRecord> = {};
    if (parsed.projectReviews && typeof parsed.projectReviews === "object") {
      Object.entries(parsed.projectReviews).forEach(([k, rev]: [string, any]) => {
        if (rev && typeof rev === "object" && rev.reviewId) {
          const sub = normalizedSubmissions[k];
          const isStale = sub ? rev.submissionFingerprint !== sub.submissionFingerprint : true;
          normalizedReviews[k] = {
            ...rev,
            isStale,
            trustLevel: rev.reviewerRole === "mentor" ? "unauthenticated_mentor" : "unauthenticated_peer",
            trustDisclosure: rev.trustDisclosure || "Local unauthenticated peer/mentor review.",
          };
        }
      });
    }

    // Link review onto submission if present
    Object.keys(normalizedSubmissions).forEach((k) => {
      if (normalizedReviews[k]) {
        normalizedSubmissions[k].review = normalizedReviews[k];
      }
    });

    // Normalize skill evidence (protecting against malformed records)
    const normalizedSkills: Record<string, UserSkillEvidence> = { ...DEFAULT_GUEST_PROFILE.skillEvidence };
    if (parsed.skillEvidence && typeof parsed.skillEvidence === "object") {
      Object.entries(parsed.skillEvidence).forEach(([k, ev]: [string, any]) => {
        if (ev && typeof ev === "object" && ev.skillId && ev.state) {
          normalizedSkills[k] = {
            ...ev,
            isArtifactInspected: ev.isArtifactInspected ?? false,
            unverifiedNotice:
              ev.state === "student_attested"
                ? "Artifact at external URL was not inspected by Aaroh."
                : ev.unverifiedNotice,
          };
        }
      });
    }

    return {
      ...DEFAULT_GUEST_PROFILE,
      ...parsed,
      skillEvidence: normalizedSkills,
      trialReflections: { ...DEFAULT_GUEST_PROFILE.trialReflections, ...(parsed.trialReflections || {}) },
      projectSubmissions: normalizedSubmissions,
      projectReviews: normalizedReviews,
    };
  } catch (parseErr) {
    console.warn("Corrupt stored profile JSON; resetting to default guest profile:", parseErr);
    return DEFAULT_GUEST_PROFILE;
  }
}

export function applyProjectSubmissionToProfile(
  profile: UserProfile,
  brief: { id: string; title: string; careerSlug: string },
  input: {
    repoOrDemoUrl: string;
    checkedDeliverableIds: string[];
    reflection: string;
  },
  precomputedEvaluation?: ProjectSubmissionRecord
): { updatedProfile: UserProfile; evaluation: ProjectSubmissionRecord } {
  const briefDef = PROJECT_BRIEFS.find((p) => p.id === brief.id);
  const evaluation: ProjectSubmissionRecord =
    precomputedEvaluation ??
    (briefDef ? evaluateProjectSubmission(briefDef, input) : (brief as any));

  // Check for prior review on this project and mark stale if fingerprint differs
  const priorReview = profile.projectReviews?.[brief.id] || profile.projectSubmissions[brief.id]?.review;
  const isReviewStale = priorReview ? priorReview.submissionFingerprint !== evaluation.submissionFingerprint : false;
  const updatedReview = priorReview ? { ...priorReview, isStale: isReviewStale } : undefined;

  const evaluationWithReview: ProjectSubmissionRecord = {
    ...evaluation,
    review: updatedReview,
  };

  // Repeated submissions update existing record under projectId key (no duplicate ghost entries)
  const updatedSubmissions = {
    ...profile.projectSubmissions,
    [brief.id]: evaluationWithReview,
  };

  const updatedReviews = {
    ...(profile.projectReviews || {}),
    ...(updatedReview ? { [brief.id]: updatedReview } : {}),
  };

  const updatedSkillEvidence = { ...profile.skillEvidence };

  // Invalidation & Reversion Rule:
  // If a prior review existed for this project and became stale due to submission changes,
  // any skill evidence that was elevated to "practically_demonstrated" by that review must be reverted,
  // because the examined artifacts have been superseded by the newly submitted code.
  if (isReviewStale && priorReview) {
    Object.entries(updatedSkillEvidence).forEach(([skillId, ev]) => {
      if (
        ev.reviewId === priorReview.reviewId &&
        ev.state === "practically_demonstrated" &&
        ev.verificationLevel === "artifact_examined"
      ) {
        if (evaluation.status === "evaluated") {
          updatedSkillEvidence[skillId] = {
            skillId,
            state: "student_attested",
            sourceTitle: brief.title,
            sourceUrl: input.repoOrDemoUrl,
            assessedScore: evaluation.overallScore,
            reflection: input.reflection.slice(0, 300),
            verificationLevel: "student_attested",
            evaluationBasis: "Evaluated project submission (student-attested deliverables & reflection).",
            unverifiedNotice:
              "Prior peer/mentor review was superseded by subsequent code modifications. Awaiting re-examination.",
            isArtifactInspected: false,
            updatedAt: new Date().toISOString(),
          };
        } else {
          updatedSkillEvidence[skillId] = {
            skillId,
            state: "not_assessed",
            updatedAt: new Date().toISOString(),
          };
        }
      }
    });
  }

  // Honest Upgrade Rule:
  // Only upgrade mapped skills when evaluation status is "evaluated" (criteria met on student attestation & reflection).
  // State is set to "student_attested" (NOT "practically_demonstrated" or "independently_verified", as external artifacts are uninspected).
  if (evaluation.status === "evaluated") {
    evaluation.upgradedSkillIds.forEach((skillId: string) => {
      const existing = updatedSkillEvidence[skillId] || profile.skillEvidence[skillId];

      // Non-erasure rule: NEVER downgrade independently_verified
      if (existing?.state === "independently_verified") {
        updatedSkillEvidence[skillId] = {
          ...existing,
          sourceTitle: existing.sourceTitle || brief.title,
          updatedAt: new Date().toISOString(),
        };
      }
      // Non-erasure rule: NEVER downgrade practically_demonstrated
      else if (existing?.state === "practically_demonstrated") {
        updatedSkillEvidence[skillId] = {
          ...existing,
          sourceTitle: existing.sourceTitle || brief.title,
          updatedAt: new Date().toISOString(),
        };
      }
      // If already student_attested, update with higher/equal score
      else if (existing?.state === "student_attested") {
        updatedSkillEvidence[skillId] = {
          skillId,
          state: "student_attested",
          sourceTitle: brief.title,
          sourceUrl: input.repoOrDemoUrl,
          assessedScore: Math.max(existing.assessedScore ?? 0, evaluation.overallScore),
          reflection: input.reflection.slice(0, 300),
          verificationLevel: "student_attested",
          evaluationBasis: "Evaluated project submission (student-attested deliverables & reflection).",
          unverifiedNotice: existing?.unverifiedNotice || "Artifact at external URL was not inspected by Aaroh.",
          isArtifactInspected: false,
          updatedAt: new Date().toISOString(),
        };
      }
      // If coursework, self_reported, or not_assessed -> upgrade to student_attested
      else {
        updatedSkillEvidence[skillId] = {
          skillId,
          state: "student_attested",
          sourceTitle: brief.title,
          sourceUrl: input.repoOrDemoUrl,
          assessedScore: evaluation.overallScore,
          reflection: input.reflection.slice(0, 300),
          verificationLevel: "student_attested",
          evaluationBasis: "Evaluated project submission (student-attested deliverables & reflection).",
          unverifiedNotice: "Artifact at external URL was not inspected by Aaroh.",
          isArtifactInspected: false,
          updatedAt: new Date().toISOString(),
        };
      }
    });
  }

  const updatedProfile: UserProfile = {
    ...profile,
    projectSubmissions: updatedSubmissions,
    projectReviews: updatedReviews,
    skillEvidence: updatedSkillEvidence,
    updatedAt: new Date().toISOString(),
  };

  return { updatedProfile, evaluation: evaluationWithReview };
}

let memoryProfile: UserProfile = DEFAULT_GUEST_PROFILE;
let memoryRoadmap: Roadmap | null = null;
let isHydrated = false;
const storeListeners = new Set<() => void>();

function notifyStoreChange() {
  storeListeners.forEach((fn) => fn());
}

function initMemoryStorage() {
  if (typeof window === "undefined" || isHydrated) return;
  try {
    const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    const storedRoadmap = localStorage.getItem(STORAGE_KEY_ROADMAP);

    if (storedProfile) {
      memoryProfile = normalizeStoredProfile(storedProfile);
    } else {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(DEFAULT_GUEST_PROFILE));
    }

    if (storedRoadmap) {
      memoryRoadmap = JSON.parse(storedRoadmap);
    } else {
      memoryRoadmap = generateInitialRoadmap(
        memoryProfile.targetCareerSlug || "full-stack-systems-engineer",
        memoryProfile.weeklyCapacityHours,
        memoryProfile.isExamMode,
        memoryProfile.completedTrialIds || [],
        memoryProfile.projectSubmissions || {},
        memoryProfile.projectReviews || {}
      );
      localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(memoryRoadmap));
    }
  } catch (e) {
    console.warn("Storage hydration error; using in-memory state:", e);
  } finally {
    isHydrated = true;
  }
}

export function useAarohStore() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    initMemoryStorage();
    return memoryProfile;
  });
  const [roadmap, setRoadmap] = useState<Roadmap | null>(() => {
    initMemoryStorage();
    return memoryRoadmap;
  });
  const [isLoaded, setIsLoaded] = useState(isHydrated);

  // Subscribe to store updates and hydrate from localStorage
  useEffect(() => {
    initMemoryStorage();
    setProfile(memoryProfile);
    setRoadmap(memoryRoadmap);
    setIsLoaded(true);

    const handleChange = () => {
      setProfile(memoryProfile);
      setRoadmap(memoryRoadmap);
    };

    storeListeners.add(handleChange);
    return () => {
      storeListeners.delete(handleChange);
    };
  }, []);

  const saveProfile = (newProfile: UserProfile) => {
    memoryProfile = newProfile;
    setProfile(newProfile);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
      }
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
    notifyStoreChange();
  };

  const saveRoadmap = (newRoadmap: Roadmap) => {
    memoryRoadmap = newRoadmap;
    setRoadmap(newRoadmap);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(newRoadmap));
      }
    } catch (e) {
      console.error("Failed to save roadmap:", e);
    }
    notifyStoreChange();
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(updated);
  };

  const toggleSaveCareer = (slug: string) => {
    const exists = profile.savedCareerSlugs.includes(slug);
    const updatedSlugs = exists
      ? profile.savedCareerSlugs.filter((s) => s !== slug)
      : [...profile.savedCareerSlugs, slug];
    updateProfile({ savedCareerSlugs: updatedSlugs });
  };

  const setTargetCareer = (slug: string) => {
    const newRoadmap = generateInitialRoadmap(
      slug,
      profile.weeklyCapacityHours,
      profile.isExamMode,
      profile.completedTrialIds,
      profile.projectSubmissions,
      profile.projectReviews || {}
    );
    updateProfile({ targetCareerSlug: slug });
    saveRoadmap(newRoadmap);
  };

  const updateSkillEvidence = (skillId: string, state: EvidenceState, sourceTitle?: string, sourceUrl?: string, reflection?: string) => {
    const currentEvidence = profile.skillEvidence[skillId] || {
      skillId,
      state: "not_assessed",
      updatedAt: new Date().toISOString(),
    };

    const updatedEvidence: UserSkillEvidence = {
      ...currentEvidence,
      state,
      updatedAt: new Date().toISOString(),
      sourceTitle: sourceTitle ?? currentEvidence.sourceTitle,
      sourceUrl: sourceUrl ?? currentEvidence.sourceUrl,
      reflection: reflection ?? currentEvidence.reflection,
    };

    const newEvidenceMap = {
      ...profile.skillEvidence,
      [skillId]: updatedEvidence,
    };

    updateProfile({ skillEvidence: newEvidenceMap });
  };

  const recordTrialCompletion = (
    trialId: string,
    rating: number,
    reflection: string,
    details?: {
      selectedOptionId?: string;
      score?: number;
      criteriaScores?: { criterion: string; score: number; weight: number; feedback?: string }[];
      feedback?: string;
    }
  ) => {
    const completedIds = Array.from(new Set([...profile.completedTrialIds, trialId]));
    const reflections = {
      ...profile.trialReflections,
      [trialId]: {
        trialId,
        rating,
        reflection,
        selectedOptionId: details?.selectedOptionId,
        score: details?.score,
        criteriaScores: details?.criteriaScores,
        feedback: details?.feedback,
        submittedAt: new Date().toISOString(),
      },
    };
    updateProfile({
      completedTrialIds: completedIds,
      trialReflections: reflections,
    });

    // Cross-module synchronization: if active roadmap matches this trial's career, auto-complete task-1 and unlock task-2
    if (roadmap) {
      const trial = CAREER_TRIALS.find((t) => t.id === trialId);
      if (trial && trial.careerSlug === roadmap.careerSlug) {
        const task1 = roadmap.tasks.find((t) => t.id === "task-1");
        if (task1 && task1.status !== "completed") {
          const updatedTasks = roadmap.tasks.map((task) => {
            if (task.id === "task-1") {
              return {
                ...task,
                status: "completed" as const,
                completedAt: new Date().toISOString(),
                submittedEvidence: {
                  type: "reflection",
                  urlOrText: `Completed micro-trial with ${details?.score ?? 85}% rubric alignment.`,
                  notes: reflection,
                  submittedAt: new Date().toISOString(),
                },
              };
            }
            if (task.prerequisites.includes("task-1") && task.status === "locked") {
              return { ...task, status: "available" as const };
            }
            return task;
          });
          saveRoadmap({
            ...roadmap,
            tasks: updatedTasks,
            lastAdjustedAt: new Date().toISOString(),
          });
        }
      }
    }
  };

  const recordProjectSubmission = (
    projectId: string,
    input: {
      repoOrDemoUrl: string;
      checkedDeliverableIds: string[];
      reflection: string;
    }
  ): ProjectSubmissionRecord => {
    const brief = PROJECT_BRIEFS.find((p) => p.id === projectId);
    if (!brief) {
      throw new Error(`Project brief not found for id: ${projectId}`);
    }

    const { updatedProfile, evaluation } = applyProjectSubmissionToProfile(profile, brief, input);
    saveProfile(updatedProfile);

    // Cross-module Roadmap synchronization:
    // If submission meets brief criteria (status === "evaluated") and project career matches active roadmap,
    // auto-complete task-3 ("Vertical-Slice Starter Project") with student-attested evidence
    // and unlock task-4 ("Peer & Mentor Evidence Verification") for independent verification.
    // If review became stale due to code changes, reopen task-4 if no other valid review exists.
    if (roadmap && brief.careerSlug === roadmap.careerSlug) {
      let updatedTasks = [...roadmap.tasks];
      let roadmapChanged = false;

      if (evaluation.status === "evaluated") {
        const task3 = updatedTasks.find((t) => t.id === "task-3");
        if (task3 && task3.status !== "completed") {
          updatedTasks = updatedTasks.map((task) => {
            if (task.id === "task-3") {
              return {
                ...task,
                status: "completed" as const,
                completedAt: new Date().toISOString(),
                submittedEvidence: {
                  type: "github_repo",
                  urlOrText: input.repoOrDemoUrl,
                  notes: `Evaluated project submission (${evaluation.overallScore}% completeness): ${brief.title}`,
                  submittedAt: new Date().toISOString(),
                },
              };
            }
            if (task.prerequisites.includes("task-3") && task.status === "locked") {
              return { ...task, status: "available" as const };
            }
            return task;
          });
          roadmapChanged = true;
        }
      }

      // Reopen task-4 if the prior review became stale and no other active valid review exists for this career
      if (evaluation.review?.isStale) {
        const hasValidReview = Object.values(updatedProfile.projectReviews || {}).some((rev) => {
          const pBrief = PROJECT_BRIEFS.find((p) => p.id === rev.projectId);
          return (
            pBrief?.careerSlug === roadmap.careerSlug &&
            rev.overallDecision === "approved" &&
            rev.artifactExamined &&
            !rev.isStale &&
            rev.criteriaEvaluations.some((c) => c.passed && c.score >= 70)
          );
        });

        if (!hasValidReview) {
          const task4 = updatedTasks.find((t) => t.id === "task-4");
          if (task4 && task4.status === "completed") {
            updatedTasks = updatedTasks.map((task) => {
              if (task.id === "task-4") {
                return {
                  ...task,
                  status: "available" as const,
                  completedAt: undefined,
                  submittedEvidence: undefined,
                };
              }
              return task;
            });
            roadmapChanged = true;
          }
        }
      }

      if (roadmapChanged) {
        saveRoadmap({
          ...roadmap,
          tasks: updatedTasks,
          lastAdjustedAt: new Date().toISOString(),
        });
      }
    }

    return evaluation;
  };

  const toggleExamMode = () => {
    const nextExamMode = !profile.isExamMode;
    updateProfile({ isExamMode: nextExamMode });
    if (roadmap) {
      const adjustedWeeklyHours = nextExamMode
        ? Math.max(3, Math.round(profile.weeklyCapacityHours * 0.4))
        : profile.weeklyCapacityHours;
      saveRoadmap({
        ...roadmap,
        isExamMode: nextExamMode,
        weeklyCapacityHours: adjustedWeeklyHours,
        lastAdjustedAt: new Date().toISOString(),
      });
    }
  };

  const updateTaskStatus = (taskId: string, status: RoadmapTask["status"], submittedEvidence?: RoadmapTask["submittedEvidence"]) => {
    if (!roadmap) return;

    const updatedTasks = roadmap.tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          status,
          submittedEvidence: submittedEvidence ?? task.submittedEvidence,
          completedAt: status === "completed" ? new Date().toISOString() : task.completedAt,
        };
      }
      // Unlock subsequent task if prerequisites met
      if (status === "completed" && task.prerequisites.includes(taskId) && task.status === "locked") {
        return { ...task, status: "available" as const };
      }
      return task;
    });

    saveRoadmap({
      ...roadmap,
      tasks: updatedTasks,
      lastAdjustedAt: new Date().toISOString(),
    });
  };

  const importProjectReview = (
    projectId: string,
    rawInput: unknown
  ): {
    success: boolean;
    message: string;
    promotedSkills: string[];
    ignoredSkills: string[];
    review?: ProjectReviewRecord;
    isStale?: boolean;
  } => {
    const brief = PROJECT_BRIEFS.find((p) => p.id === projectId);
    if (!brief) {
      return {
        success: false,
        message: `Project brief not found for ID: ${projectId}`,
        promotedSkills: [],
        ignoredSkills: [],
      };
    }

    const currentSubmission = profile.projectSubmissions[projectId];
    if (!currentSubmission) {
      return {
        success: false,
        message: "Cannot import a review before submitting the project deliverable.",
        promotedSkills: [],
        ignoredSkills: [],
      };
    }

    const validation = validateAndParseReviewPacket(rawInput, currentSubmission, brief);
    if (!validation.isValid || !validation.review) {
      return {
        success: false,
        message: validation.error || "Failed to validate review packet.",
        promotedSkills: [],
        ignoredSkills: [],
      };
    }

    const { updatedProfile, promotedSkillIds, ignoredSkillIds, isStale, error } = applyReviewToProfile(
      profile,
      brief,
      validation.review
    );

    if (error) {
      return {
        success: false,
        message: error,
        promotedSkills: [],
        ignoredSkills: [],
        isStale,
      };
    }

    saveProfile(updatedProfile);

    // Cross-module Roadmap synchronization:
    // If review is approved, not stale, artifacts examined, and has >=1 passed criterion (score >= 70), complete task-4 on active roadmap
    const hasPassedCriteria = validation.review.criteriaEvaluations.some(
      (c) => c.passed && c.score >= 70
    );

    if (
      !isStale &&
      validation.review.overallDecision === "approved" &&
      validation.review.artifactExamined &&
      hasPassedCriteria &&
      roadmap &&
      brief.careerSlug === roadmap.careerSlug
    ) {
      const task4 = roadmap.tasks.find((t) => t.id === "task-4");
      if (task4 && task4.status !== "completed") {
        const updatedTasks = roadmap.tasks.map((task) => {
          if (task.id === "task-4") {
            return {
              ...task,
              status: "completed" as const,
              completedAt: validation.review!.reviewedAt,
              submittedEvidence: {
                type: "demo_link",
                urlOrText: currentSubmission.repoOrDemoUrl,
                notes: `Peer/mentor review by ${validation.review!.reviewerName} (${validation.review!.reviewerRole}): ${validation.review!.overallFeedback}`,
                submittedAt: validation.review!.reviewedAt,
              },
            };
          }
          return task;
        });

        saveRoadmap({
          ...roadmap,
          tasks: updatedTasks,
          lastAdjustedAt: new Date().toISOString(),
        });
      }
    }

    return {
      success: true,
      message: isStale
        ? "Review imported, but marked STALE because the submission was modified after review."
        : validation.review.overallDecision === "approved"
        ? `Review successfully imported! Elevated ${promotedSkillIds.length} skills to Demonstrated (Artifact Examined).`
        : "Review imported with changes requested. Deliverables need revision before skills are elevated.",
      promotedSkills: promotedSkillIds,
      ignoredSkills: ignoredSkillIds,
      review: validation.review,
      isStale,
    };
  };

  return {
    profile,
    roadmap,
    isLoaded,
    updateProfile,
    toggleSaveCareer,
    setTargetCareer,
    updateSkillEvidence,
    recordTrialCompletion,
    recordProjectSubmission,
    importProjectReview,
    toggleExamMode,
    updateTaskStatus,
  };
}
