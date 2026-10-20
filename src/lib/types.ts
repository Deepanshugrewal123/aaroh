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
  | "student_attested"
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

export interface TrialReferenceData {
  title: string;
  disclosureNotice?: string;
  headers: string[];
  rows: string[][];
  notes?: string[];
}

export interface TrialSourceExcerpt {
  id: string;
  sourceLabel: string;
  sourceType: "internal_leak" | "company_pr" | "independent_audit" | "user_opinion";
  excerptText: string;
  classification: "supported" | "disputed" | "unverified" | "opinion";
  analysis: string;
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
  disclaimerNotice?: string;
  referenceData?: TrialReferenceData;
  sourceExcerpts?: TrialSourceExcerpt[];
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
  assessedScore?: number; // 0-100 heuristic completeness score
  verificationLevel?: "unverified_claim" | "student_attested" | "evaluated_reflection" | "artifact_examined" | "independently_verified";
  evaluationBasis?: string; // Explicit statement of what was evaluated
  unverifiedNotice?: string; // Explicit disclosure when destination artifact has not been inspected
  isArtifactInspected?: boolean; // Whether the remote code or artifact was inspected
  reviewerName?: string;
  reviewerRole?: "peer" | "mentor" | "community";
  reviewId?: string;
  reviewedAt?: string;
}

export interface TrialSubmissionRecord {
  trialId: string;
  rating: number; // 1-5
  reflection: string;
  selectedOptionId?: string;
  score?: number; // 0-100 rubric score
  criteriaScores?: {
    criterion: string;
    score: number;
    weight: number;
    feedback?: string;
  }[];
  feedback?: string;
  submittedAt: string;
}

export type ProjectSubmissionStatus =
  | "not_started"
  | "submitted"
  | "evaluation_incomplete"
  | "needs_improvement"
  | "evaluated"
  | "rejected";

export interface ProjectDeliverableItem {
  id: string;
  label: string;
  description?: string;
  isRequired: boolean;
}

export interface ProjectRubricCriterion {
  id: string;
  title: string;
  description: string;
  weight: number; // percentage weighting, e.g. 25
  associatedSkillId: string;
  passingThreshold: number; // 0-100 threshold, e.g. 70
}

export interface ProjectCriterionScore {
  criterionId: string;
  title: string;
  associatedSkillId: string;
  score: number; // 0-100
  weight: number;
  passed: boolean;
  feedback: string;
  evaluationBasis?: string;
}

export interface ProjectSubmissionRecord {
  projectId: string;
  projectSlug: string;
  careerSlug: string;
  repoOrDemoUrl: string;
  reflection: string;
  checkedDeliverableIds: string[];
  status: ProjectSubmissionStatus;
  overallScore: number; // 0-100 submission completeness score
  criteriaScores: ProjectCriterionScore[];
  upgradedSkillIds: string[];
  feedback: string;
  actionableNextSteps: string[];
  isArtifactInspected: false; // Explicit architectural disclosure: local-first client does not execute or inspect remote code
  verificationLimitationNotice: string; // Plain-language limitation notice
  verificationLevel?: "student_attested" | "evaluated_reflection" | "artifact_examined" | "independently_verified";
  submissionFingerprint?: string; // Deterministic hash of URL, deliverables, and brief
  review?: ProjectReviewRecord; // Attached peer/mentor review record
  submittedAt: string;
  evaluatedAt: string;
}

export type ReviewTrustLevel =
  | "unauthenticated_peer"
  | "unauthenticated_mentor"
  | "institutional_proctored";

export interface ReviewCriterionEvaluation {
  criterionId: string;
  passed: boolean;
  score: number; // 0-100
  feedback: string;
}

export interface ProjectReviewRecord {
  reviewId: string;
  projectId: string;
  projectSlug: string;
  submissionFingerprint: string;
  reviewerName: string;
  reviewerRole: "peer" | "mentor" | "community";
  trustLevel: ReviewTrustLevel;
  criteriaEvaluations: ReviewCriterionEvaluation[];
  overallFeedback: string;
  overallDecision: "approved" | "changes_requested";
  artifactExamined: boolean; // Must be true for criterion promotion; reviewer inspected actual code/demo
  reviewedAt: string;
  isStale?: boolean; // Set to true if submission was modified after this review was conducted
  trustDisclosure: string; // Explicit notice that review is unauthenticated local evidence
}

export interface AarohReviewPacket {
  schemaVersion: "1.0";
  type: "aaroh_review_packet";
  exportedAt: string;
  studentName: string;
  projectId: string;
  projectTitle: string;
  careerSlug: string;
  submissionFingerprint: string;
  submittedAt: string;
  repoOrDemoUrl: string;
  checkedDeliverableIds: string[];
  deliverables: ProjectDeliverableItem[];
  reflection: string;
  rubricCriteria: ProjectRubricCriterion[];
  review?: ProjectReviewRecord;
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
  trialReflections: Record<string, TrialSubmissionRecord>;
  projectSubmissions: Record<string, ProjectSubmissionRecord>; // projectId -> record
  projectReviews?: Record<string, ProjectReviewRecord>; // projectId -> review record
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
  deliverables?: ProjectDeliverableItem[];
  rubricCriteria?: ProjectRubricCriterion[];
}

export interface MentorMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  contextSummary?: string;
  suggestedFollowUps?: string[];
}
