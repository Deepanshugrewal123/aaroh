"use client";

import { useEffect, useState } from "react";
import { UserProfile, Roadmap, UserSkillEvidence, EvidenceState, RoadmapTask } from "./types";
import { CAREERS_CATALOG } from "./careers-data";
import { SKILLS_CATALOG } from "./skills-data";

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
  savedCareerSlugs: ["full-stack-systems-engineer", "product-ux-designer"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function generateInitialRoadmap(careerSlug: string, weeklyCapacityHours: number, isExamMode: boolean): Roadmap {
  const career = CAREERS_CATALOG.find((c) => c.slug === careerSlug) || CAREERS_CATALOG[2]; // Default to full-stack

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
      status: "available",
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
      status: "locked",
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
      status: "locked",
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
        "Run the Project Studio audit checklist against your submission.",
        "Submit evidence to update your Skill Intelligence matrix to Practically Demonstrated.",
      ],
      learningResources: [
        { title: "Aaroh Verification Rubric", url: "/skills", isFree: true },
      ],
      completionCriteria: [
        "All rubric checks satisfied",
        "Evidence link verified and active",
      ],
      requiredEvidenceType: "demo_link",
      status: "locked",
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

export function useAarohStore() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_GUEST_PROFILE);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      const storedRoadmap = localStorage.getItem(STORAGE_KEY_ROADMAP);

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(DEFAULT_GUEST_PROFILE));
      }

      if (storedRoadmap) {
        setRoadmap(JSON.parse(storedRoadmap));
      } else {
        const initialRoadmap = generateInitialRoadmap(
          DEFAULT_GUEST_PROFILE.targetCareerSlug || "full-stack-systems-engineer",
          DEFAULT_GUEST_PROFILE.weeklyCapacityHours,
          DEFAULT_GUEST_PROFILE.isExamMode
        );
        setRoadmap(initialRoadmap);
        localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(initialRoadmap));
      }
    } catch (e) {
      console.warn("Storage hydration error; using in-memory state:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  const saveRoadmap = (newRoadmap: Roadmap) => {
    setRoadmap(newRoadmap);
    try {
      localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(newRoadmap));
    } catch (e) {
      console.error("Failed to save roadmap:", e);
    }
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
    const newRoadmap = generateInitialRoadmap(slug, profile.weeklyCapacityHours, profile.isExamMode);
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

  const recordTrialCompletion = (trialId: string, rating: number, reflection: string) => {
    const completedIds = Array.from(new Set([...profile.completedTrialIds, trialId]));
    const reflections = {
      ...profile.trialReflections,
      [trialId]: { rating, reflection, submittedAt: new Date().toISOString() },
    };
    updateProfile({
      completedTrialIds: completedIds,
      trialReflections: reflections,
    });
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

  return {
    profile,
    roadmap,
    isLoaded,
    updateProfile,
    toggleSaveCareer,
    setTargetCareer,
    updateSkillEvidence,
    recordTrialCompletion,
    toggleExamMode,
    updateTaskStatus,
  };
}
