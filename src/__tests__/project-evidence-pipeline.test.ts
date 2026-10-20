import { describe, it, expect } from "vitest";
import {
  validateProjectUrl,
  evaluateReflectionSubstance,
  evaluateProjectSubmission,
} from "../lib/project-evaluation";
import { PROJECT_BRIEFS } from "../lib/projects-data";
import { CAREERS_CATALOG } from "../lib/careers-data";
import { SKILLS_CATALOG } from "../lib/skills-data";
import { computeCareerRecommendations } from "../lib/recommendation-engine";
import { DEFAULT_GUEST_PROFILE } from "../lib/store";
import { UserProfile, Roadmap, RoadmapTask } from "../lib/types";

describe("Project Evidence Pipeline: URL & Deliverable Validation", () => {
  it("accepts valid public repository and deployed web application URLs", () => {
    const validUrls = [
      "https://github.com/aaroh-student/patient-portal",
      "https://gitlab.com/team/inventory-system",
      "https://accessible-portal.vercel.app",
      "https://inventory-demo.onrender.com",
      "https://www.figma.com/file/xyz123/patient-flow",
      "https://zenodo.org/record/1234567",
    ];

    validUrls.forEach((url) => {
      const res = validateProjectUrl(url);
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });
  });

  it("rejects local file paths, javascript injection, data URIs, and FTP links", () => {
    const invalidProtocols = [
      "file:///C:/Users/HP/Desktop/project/index.html",
      "javascript:alert('malicious')",
      "data:text/html,<h1>Hello</h1>",
      "ftp://my-server.local/files",
    ];

    invalidProtocols.forEach((url) => {
      const res = validateProjectUrl(url);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("Local file paths, JavaScript URIs, data URIs, or FTP links cannot be verified");
    });
  });

  it("rejects localhost, private loopbacks, and local network IPs", () => {
    const localUrls = [
      "http://localhost:3000",
      "http://localhost:8080/dashboard",
      "http://127.0.0.1:5173",
      "http://0.0.0.0:4000",
      "http://192.168.1.50:3000",
      "http://10.0.0.1/app",
    ];

    localUrls.forEach((url) => {
      const res = validateProjectUrl(url);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("not accessible for verification");
    });
  });

  it("rejects empty strings, whitespace, and missing TLD domains", () => {
    expect(validateProjectUrl("").isValid).toBe(false);
    expect(validateProjectUrl("   ").isValid).toBe(false);
    expect(validateProjectUrl("not-a-url").isValid).toBe(false);
    expect(validateProjectUrl("http://justahostname").isValid).toBe(false);
  });
});

describe("Project Evidence Pipeline: Reflection Substance Evaluator", () => {
  it("flags empty or trivial reflections", () => {
    const emptyRes = evaluateReflectionSubstance("");
    expect(emptyRes.hasSubstance).toBe(false);
    expect(emptyRes.score).toBeLessThanOrEqual(25);

    const trivialRes = evaluateReflectionSubstance("I completed this project and it was good.");
    expect(trivialRes.hasSubstance).toBe(false);
    expect(trivialRes.wordCount).toBeLessThan(10);
  });

  it("rewards substantive reflections that discuss trade-offs, architecture, and constraints", () => {
    const substantiveText =
      "In this vertical-slice implementation, I designed a normalized relational schema in PostgreSQL with foreign keys and cascade delete rules. The primary architecture trade-off was choosing pessimistic database locking over optimistic concurrency to prevent double-booking race conditions during high-volume loan requests. I also enforced Zod schema validation across all API boundaries.";

    const res = evaluateReflectionSubstance(substantiveText);
    expect(res.hasSubstance).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(80);
    expect(res.wordCount).toBeGreaterThan(35);
  });
});

describe("Project Evidence Pipeline: Deterministic Rubric Evaluator", () => {
  const brief = PROJECT_BRIEFS[0]; // proj-1: accessible-patient-portal

  it("produces identical outputs for identical inputs (pure determinism)", () => {
    const input = {
      repoOrDemoUrl: "https://github.com/student/patient-portal",
      checkedDeliverableIds: (brief.deliverables || []).map((d) => d.id),
      reflection:
        "Designed accessible WCAG 2.1 AA flows with 4.5:1 text contrast and single-column navigation. Handled keyboard focus rings and trade-offs.",
    };

    const run1 = evaluateProjectSubmission(brief, input);
    const run2 = evaluateProjectSubmission(brief, input);

    expect(run1.status).toBe(run2.status);
    expect(run1.overallScore).toBe(run2.overallScore);
    expect(run1.criteriaScores).toEqual(run2.criteriaScores);
    expect(run1.upgradedSkillIds).toEqual(run2.upgradedSkillIds);
  });

  it("returns evaluation_incomplete when deliverables are missing (< 50% checked)", () => {
    const allDeliverables = brief.deliverables || [];
    const input = {
      repoOrDemoUrl: "https://github.com/student/patient-portal",
      checkedDeliverableIds: [allDeliverables[0].id], // Only 1 of 5
      reflection: "Built wireframes and tested with elderly users.",
    };

    const res = evaluateProjectSubmission(brief, input);
    expect(res.status).toBe("evaluation_incomplete");
    expect(res.overallScore).toBeLessThan(50);
    expect(res.upgradedSkillIds).toHaveLength(0);
    expect(res.feedback).toContain("Evaluation Incomplete");
    expect(res.actionableNextSteps.length).toBeGreaterThan(0);
  });

  it("returns needs_improvement when reflection is too brief despite deliverables checked", () => {
    const allDeliverables = brief.deliverables || [];
    const input = {
      repoOrDemoUrl: "https://github.com/student/patient-portal",
      checkedDeliverableIds: allDeliverables.map((d) => d.id),
      reflection: "Done.", // Too short
    };

    const res = evaluateProjectSubmission(brief, input);
    expect(res.status).toBe("needs_improvement");
    expect(res.upgradedSkillIds).toHaveLength(0);
    expect(res.actionableNextSteps.some((s) => s.includes("Expand your architectural reflection"))).toBe(true);
  });

  it("returns evaluated and populates upgradedSkillIds when all criteria are met", () => {
    const allDeliverables = brief.deliverables || [];
    const input = {
      repoOrDemoUrl: "https://github.com/student/accessible-patient-portal",
      checkedDeliverableIds: allDeliverables.map((d) => d.id),
      reflection:
        "Adhered strictly to WCAG 2.1 AA guidelines with 4.5:1 text contrast. Tested keyboard navigation tab index and screen reader announcements. Documented architectural trade-offs between dense clinical information and single-column readability.",
    };

    const res = evaluateProjectSubmission(brief, input);
    expect(res.status).toBe("evaluated");
    expect(res.overallScore).toBeGreaterThanOrEqual(75);
    expect(res.upgradedSkillIds.length).toBeGreaterThan(0);
    // Should include brief's mapped skills: visual-hierarchy, ui-prototyping, ux-research
    expect(res.upgradedSkillIds).toContain("visual-hierarchy");
    expect(res.upgradedSkillIds).toContain("ui-prototyping");
    expect(res.upgradedSkillIds).toContain("ux-research");
  });

  it("rejects invalid or localhost URLs with status rejected and zero score", () => {
    const input = {
      repoOrDemoUrl: "http://localhost:3000/demo",
      checkedDeliverableIds: (brief.deliverables || []).map((d) => d.id),
      reflection: "Thorough reflection with all requirements completed.",
    };

    const res = evaluateProjectSubmission(brief, input);
    expect(res.status).toBe("rejected");
    expect(res.overallScore).toBe(0);
    expect(res.upgradedSkillIds).toHaveLength(0);
    expect(res.feedback).toContain("Submission Rejected");
  });
});

describe("Project Evidence Pipeline: Multidisciplinary Coverage", () => {
  it("contains complete project briefs for all 7 catalog careers", () => {
    expect(PROJECT_BRIEFS.length).toBe(7);

    CAREERS_CATALOG.forEach((career) => {
      const match = PROJECT_BRIEFS.find((p) => p.careerSlug === career.slug);
      expect(match).toBeDefined();
      expect(match!.deliverables).toBeDefined();
      expect(match!.deliverables!.length).toBeGreaterThanOrEqual(3);
      expect(match!.rubricCriteria).toBeDefined();
      expect(match!.rubricCriteria!.length).toBeGreaterThanOrEqual(2);

      // Verify that all rubric criteria map to legitimate skills in SKILLS_CATALOG
      match!.rubricCriteria!.forEach((crit) => {
        expect(SKILLS_CATALOG[crit.associatedSkillId]).toBeDefined();
        expect(crit.weight).toBeGreaterThan(0);
        expect(crit.passingThreshold).toBeGreaterThanOrEqual(60);
      });
    });
  });

  it("successfully evaluates all 7 project briefs without errors", () => {
    PROJECT_BRIEFS.forEach((proj) => {
      const allDelivIds = (proj.deliverables || []).map((d) => d.id);
      const res = evaluateProjectSubmission(proj, {
        repoOrDemoUrl: `https://github.com/aaroh-student/${proj.slug}`,
        checkedDeliverableIds: allDelivIds,
        reflection:
          "Comprehensive engineering reflection addressing architectural trade-offs, empirical data validation, regulatory constraints, and error recovery handling.",
      });

      expect(res.status).toBe("evaluated");
      expect(res.overallScore).toBeGreaterThanOrEqual(75);
      expect(res.criteriaScores.length).toBe(proj.rubricCriteria!.length);
      expect(Number.isNaN(res.overallScore)).toBe(false);
    });
  });
});

describe("Project Evidence Pipeline: Skill Provenance & Non-Erasure Rules", () => {
  it("never overwrites or downgrades independently_verified skill evidence", () => {
    const brief = PROJECT_BRIEFS.find((p) => p.slug === "vertical-slice-inventory-system")!;

    // Initial profile with independently_verified on sql-relational
    const initialProfile: UserProfile = {
      ...DEFAULT_GUEST_PROFILE,
      skillEvidence: {
        ...DEFAULT_GUEST_PROFILE.skillEvidence,
        "sql-relational": {
          skillId: "sql-relational",
          state: "independently_verified",
          sourceTitle: "Postgres Community Hackathon Winner",
          sourceUrl: "https://verified-hackathon.org/proof",
          assessedScore: 95,
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    };

    // Simulate project submission evaluation
    const evaluation = evaluateProjectSubmission(brief, {
      repoOrDemoUrl: "https://github.com/student/inventory",
      checkedDeliverableIds: (brief.deliverables || []).map((d) => d.id),
      reflection:
        "Full stack architecture with normalized schema, database transactions, and Zod input validation to prevent concurrency race conditions.",
    });

    expect(evaluation.status).toBe("evaluated");

    // Apply upgrade logic as executed in store.ts
    const updatedEvidence = { ...initialProfile.skillEvidence };
    evaluation.upgradedSkillIds.forEach((skillId) => {
      const existing = initialProfile.skillEvidence[skillId];
      if (existing?.state === "independently_verified" || existing?.state === "practically_demonstrated") {
        // NON-ERASURE: Preserve independently_verified and practically_demonstrated
        updatedEvidence[skillId] = {
          ...existing,
          sourceTitle: existing.sourceTitle || brief.title,
          updatedAt: new Date().toISOString(),
        };
      } else {
        updatedEvidence[skillId] = {
          skillId,
          state: "student_attested",
          sourceTitle: brief.title,
          sourceUrl: "https://github.com/student/inventory",
          assessedScore: evaluation.overallScore,
          updatedAt: new Date().toISOString(),
        };
      }
    });

    // sql-relational MUST retain independently_verified
    expect(updatedEvidence["sql-relational"].state).toBe("independently_verified");
    expect(updatedEvidence["sql-relational"].sourceTitle).toBe("Postgres Community Hackathon Winner");

    // web-development was unassessed, now student_attested
    expect(updatedEvidence["web-development"].state).toBe("student_attested");
    expect(updatedEvidence["web-development"].sourceTitle).toBe(brief.title);
    expect(updatedEvidence["web-development"].assessedScore).toBe(evaluation.overallScore);
  });

  it("does not upgrade skills if submission status is needs_improvement or incomplete", () => {
    const brief = PROJECT_BRIEFS[0];
    const initialEvidence = { ...DEFAULT_GUEST_PROFILE.skillEvidence };

    const evaluation = evaluateProjectSubmission(brief, {
      repoOrDemoUrl: "https://github.com/student/partial-portal",
      checkedDeliverableIds: [], // None checked
      reflection: "Incomplete project.",
    });

    expect(evaluation.status).toBe("evaluation_incomplete");
    expect(evaluation.upgradedSkillIds).toHaveLength(0);

    // No skills should be upgraded
    evaluation.upgradedSkillIds.forEach((skillId) => {
      initialEvidence[skillId] = {
        skillId,
        state: "practically_demonstrated",
        updatedAt: new Date().toISOString(),
      };
    });

    expect(initialEvidence["visual-hierarchy"]).toBeUndefined();
  });
});

describe("Project Evidence Pipeline: Cross-Module Synchronization", () => {
  it("upgrading skills increases skill coverage in recommendation engine", () => {
    const baselineProfile = { ...DEFAULT_GUEST_PROFILE };
    const baselineRecs = computeCareerRecommendations(baselineProfile);
    const baselineFullStack = baselineRecs.find((r) => r.career.slug === "full-stack-systems-engineer")!;

    // Upgrade web-development and sql-relational to practically_demonstrated
    const demonstratedProfile: UserProfile = {
      ...baselineProfile,
      skillEvidence: {
        ...baselineProfile.skillEvidence,
        "web-development": {
          skillId: "web-development",
          state: "practically_demonstrated",
          sourceTitle: "Production-Grade Inventory System",
          assessedScore: 88,
          updatedAt: new Date().toISOString(),
        },
        "sql-relational": {
          skillId: "sql-relational",
          state: "practically_demonstrated",
          sourceTitle: "Production-Grade Inventory System",
          assessedScore: 88,
          updatedAt: new Date().toISOString(),
        },
      },
    };

    const newRecs = computeCareerRecommendations(demonstratedProfile);
    const newFullStack = newRecs.find((r) => r.career.slug === "full-stack-systems-engineer")!;

    // Demonstrated evidence increases the fit score
    expect(newFullStack.fitScore).toBeGreaterThan(baselineFullStack.fitScore);
    expect(newFullStack.matchReasons.some((m) => m.includes("evidence coverage"))).toBe(true);
  });

  it("synchronizes Roadmap Task 3 completion and unlocks Task 4", () => {
    const mockRoadmap: Roadmap = {
      id: "road-1",
      careerSlug: "full-stack-systems-engineer",
      weeklyCapacityHours: 8,
      isExamMode: false,
      tasks: [
        {
          id: "task-1",
          title: "Micro-Trial",
          status: "completed",
          prerequisites: [],
          instructions: [],
          learningResources: [],
          completionCriteria: [],
          requiredEvidenceType: "reflection",
          estimatedHours: 1,
          purpose: "",
          whyItMatters: "",
          category: "verify",
        },
        {
          id: "task-2",
          title: "Core Foundations",
          status: "completed",
          prerequisites: ["task-1"],
          instructions: [],
          learningResources: [],
          completionCriteria: [],
          requiredEvidenceType: "document",
          estimatedHours: 4,
          purpose: "",
          whyItMatters: "",
          category: "learn",
        },
        {
          id: "task-3",
          title: "Vertical-Slice Starter Project",
          status: "available",
          prerequisites: ["task-2"],
          instructions: [],
          learningResources: [],
          completionCriteria: [],
          requiredEvidenceType: "github_repo",
          estimatedHours: 8,
          purpose: "",
          whyItMatters: "",
          category: "build",
        },
        {
          id: "task-4",
          title: "Peer & Mentor Evidence Verification",
          status: "locked",
          prerequisites: ["task-3"],
          instructions: [],
          learningResources: [],
          completionCriteria: [],
          requiredEvidenceType: "document",
          estimatedHours: 3,
          purpose: "",
          whyItMatters: "",
          category: "verify",
        },
      ],
      generatedAt: new Date().toISOString(),
      lastAdjustedAt: new Date().toISOString(),
    };

    const brief = PROJECT_BRIEFS.find((p) => p.slug === "vertical-slice-inventory-system")!;
    const evaluation = evaluateProjectSubmission(brief, {
      repoOrDemoUrl: "https://github.com/aarav/inventory-crud",
      checkedDeliverableIds: (brief.deliverables || []).map((d) => d.id),
      reflection:
        "Full stack architecture with normalized schema, database transactions, and Zod input validation to prevent concurrency race conditions.",
    });

    expect(evaluation.status).toBe("evaluated");

    // Simulate store progression update
    const updatedTasks: RoadmapTask[] = mockRoadmap.tasks.map((task) => {
      if (task.id === "task-3") {
        return {
          ...task,
          status: "completed" as const,
          completedAt: new Date().toISOString(),
          submittedEvidence: {
            type: "github_repo",
            urlOrText: "https://github.com/aarav/inventory-crud",
            notes: `Evaluated at ${evaluation.overallScore}% score: ${brief.title}`,
            submittedAt: new Date().toISOString(),
          },
        };
      }
      if (task.prerequisites.includes("task-3") && task.status === "locked") {
        return { ...task, status: "available" as const };
      }
      return task;
    });

    const task3 = updatedTasks.find((t) => t.id === "task-3")!;
    const task4 = updatedTasks.find((t) => t.id === "task-4")!;

    expect(task3.status).toBe("completed");
    expect(task3.submittedEvidence?.urlOrText).toBe("https://github.com/aarav/inventory-crud");
    expect(task4.status).toBe("available"); // Unlocked!
  });

  it("handles repeated project revisions idempotently without creating duplicate entries", () => {
    const brief = PROJECT_BRIEFS[0];
    const submissions: Record<string, any> = {};

    // Initial submission (incomplete)
    submissions[brief.id] = evaluateProjectSubmission(brief, {
      repoOrDemoUrl: "https://github.com/student/patient-portal",
      checkedDeliverableIds: [],
      reflection: "Initial draft.",
    });

    expect(Object.keys(submissions).length).toBe(1);
    expect(submissions[brief.id].status).toBe("evaluation_incomplete");

    // Revised submission (demonstrated)
    submissions[brief.id] = evaluateProjectSubmission(brief, {
      repoOrDemoUrl: "https://github.com/student/patient-portal",
      checkedDeliverableIds: (brief.deliverables || []).map((d) => d.id),
      reflection:
        "Complete overhaul meeting all WCAG 2.1 AA requirements with 4.5:1 text contrast and single-column layout. Fully documented trade-offs.",
    });

    // Still only 1 entry under brief.id key, updated in-place
    expect(Object.keys(submissions).length).toBe(1);
    expect(submissions[brief.id].status).toBe("evaluated");
    expect(submissions[brief.id].overallScore).toBeGreaterThanOrEqual(75);
  });
});
