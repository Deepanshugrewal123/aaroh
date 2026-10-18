export type EducationalDiscipline =
  | "engineering"
  | "commerce_business"
  | "arts_design"
  | "science_research"
  | "healthcare"
  | "law_public_service"
  | "media_communication"
  | "undecided";

export type EducationStage =
  | "high_school"
  | "first_second_year"
  | "pre_final_year"
  | "final_year"
  | "recent_graduate"
  | "career_changer";

export type WorkStyle =
  | "analytical"
  | "creative"
  | "collaborative"
  | "independent"
  | "practical_hands_on"
  | "strategic";

export type EvidenceState =
  | "not_assessed"
  | "self_reported"
  | "coursework"
  | "practically_demonstrated"
  | "independently_verified";

export type SkillCategory =
  | "foundational"
  | "technical"
  | "applied"
  | "communication"
  | "domain_knowledge";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  prerequisites?: string[]; // IDs of prerequisite skills
  verificationRubric?: string;
}

export interface CareerSkillRequirement {
  skillId: string;
  importance: "essential" | "advantageous" | "advanced";
  minimumLevel: 1 | 2 | 3; // 1: Beginner/Foundational, 2: Working, 3: Advanced
}

export interface CareerTrial {
  id: string;
  careerSlug: string;
  title: string;
  discipline: EducationalDiscipline;
  estimatedMinutes: number;
  objective: string;
  scenario: string;
  instructions: string[];
  practicalTask: {
    prompt: string;
    starterContent?: string;
    options?: { id: string; label: string; explanation: string; score: number }[];
    type: "choice_and_rationale" | "text_submission" | "code_or_data";
  };
  evaluationCriteria: {
    criterion: string;
    weight: number;
    description: string;
  }[];
  reflectionQuestions: string[];
  suggestedNextStep: string;
}

export interface CareerRole {
  id: string;
  slug: string;
  title: string;
  discipline: EducationalDiscipline;
  tagline: string;
  summary: string;
  workStyle: WorkStyle[];
  beginnerAccessibility: "high" | "medium" | "rigorous";
  dayInTheLife: {
    typicalHours: string;
    coreActivities: string[];
    realWorkExamples: string[];
  };
  skillsRequired: CareerSkillRequirement[];
  entryPathways: {
    pathTitle: string;
    description: string;
    timelineMonths: string;
    firstProject: string;
  }[];
  tradeoffsAndRealities: {
    positives: string[];
    challenges: string[];
    commonMisconceptions: string[];
  };
  verifiedSources: {
    title: string;
    url?: string;
    retrievedYear: number;
    notes: string;
  }[];
}

export interface UserSkillEvidence {
  skillId: string;
  state: EvidenceState;
  updatedAt: string;
  sourceTitle?: string;
  sourceUrl?: string;
  reflection?: string;
  assessedScore?: number; // 0-100
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  stage: EducationStage;
  discipline: EducationalDiscipline;
  selectedWorkStyles: WorkStyle[];
  interests: string[];
  weeklyCapacityHours: number;
  isExamMode: boolean;
  targetCareerSlug?: string;
  targetCareerHypotheses: string[]; // List of career slugs currently considering
  skillEvidence: Record<string, UserSkillEvidence>; // skillId -> evidence
  completedTrialIds: string[];
  trialReflections: Record<string, { rating: number; reflection: string; submittedAt: string }>;
  savedCareerSlugs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapTask {
  id: string;
  title: string;
  purpose: string;
  whyItMatters: string;
  category: "learn" | "build" | "verify" | "apply";
  skillId?: string;
  estimatedHours: number;
  prerequisites: string[]; // Task IDs
  instructions: string[];
  learningResources: { title: string; url: string; isFree: boolean }[];
  completionCriteria: string[];
  requiredEvidenceType: "github_repo" | "document" | "demo_link" | "reflection";
  status: "locked" | "available" | "in_progress" | "completed" | "deferred";
  dueDate?: string;
  completedAt?: string;
  submittedEvidence?: {
    type: string;
    urlOrText: string;
    notes?: string;
    submittedAt: string;
  };
}

export interface Roadmap {
  id: string;
  careerSlug: string;
  weeklyCapacityHours: number;
  isExamMode: boolean;
  tasks: RoadmapTask[];
  generatedAt: string;
  lastAdjustedAt: string;
}

export interface ProjectBrief {
  id: string;
  slug: string;
  title: string;
  careerSlug: string;
  discipline: EducationalDiscipline;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedEffortHours: number;
  problemStatement: string;
  targetUsers: string;
  scopeAndFeatures: string[];
  requiredSkills: string[];
  milestones: {
    title: string;
    deliverables: string[];
    criteria: string;
  }[];
  suggestedDatasetsOrAPIs?: { name: string; url: string; note: string }[];
  testingChecklist: string[];
  readmeTemplateOutline: string[];
  deploymentAndDemoChecklist: string[];
}

export interface MentorMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  contextSummary?: string;
  suggestedFollowUps?: string[];
}
