import { describe, it, expect } from "vitest";
import { EMPTY_PROFILE, DEFAULT_GUEST_PROFILE, normalizeStoredProfile } from "@/lib/store";
import { computeCareerRecommendations } from "@/lib/recommendation-engine";
import {
  buildGroundedSystemPrompt,
  generateLocalGroundedResponse,
  ChatMessage,
} from "@/lib/ai-knowledge";
import { UserProfile } from "@/lib/types";

describe("Question-First Career Intelligence, Open-Ended AI & Rebrand Tests", () => {
  // 1. Empty Profile vs Test Fixture Isolation
  describe("1. Empty Profile and First-Run Invariants", () => {
    it("EMPTY_PROFILE starts with clean slate, zero fake evidence, and uncompleted onboarding", () => {
      expect(EMPTY_PROFILE.hasCompletedOnboarding).toBe(false);
      expect(EMPTY_PROFILE.name).toBe("");
      expect(EMPTY_PROFILE.discipline).toBe("undecided");
      expect(Object.keys(EMPTY_PROFILE.skillEvidence)).toHaveLength(0);
      expect(EMPTY_PROFILE.completedTrialIds).toHaveLength(0);
      expect(Object.keys(EMPTY_PROFILE.projectSubmissions)).toHaveLength(0);
      expect(EMPTY_PROFILE.targetCareerSlug).toBeUndefined();
    });

    it("DEFAULT_GUEST_PROFILE is preserved for test suites without leaking into fresh state", () => {
      expect(DEFAULT_GUEST_PROFILE.hasCompletedOnboarding).toBe(true);
      expect(DEFAULT_GUEST_PROFILE.name).toBe("Aarav Sharma");
      expect(DEFAULT_GUEST_PROFILE.targetCareerSlug).toBe("full-stack-systems-engineer");
      expect(Object.keys(DEFAULT_GUEST_PROFILE.skillEvidence).length).toBeGreaterThan(0);
    });

    it("normalizeStoredProfile preserves EMPTY_PROFILE with zero phantom skills", () => {
      const serialized = JSON.stringify(EMPTY_PROFILE);
      const normalized = normalizeStoredProfile(serialized);
      expect(normalized.hasCompletedOnboarding).toBe(false);
      expect(Object.keys(normalized.skillEvidence)).toHaveLength(0);
      expect(normalized.targetCareerSlug).toBeUndefined();
    });

    it("normalizeStoredProfile preserves DEFAULT_GUEST_PROFILE when null is provided", () => {
      const normalized = normalizeStoredProfile(null);
      expect(normalized.id).toBe(DEFAULT_GUEST_PROFILE.id);
      expect(normalized.name).toBe(DEFAULT_GUEST_PROFILE.name);
    });
  });

  // 2. Question-First Onboarding to Hypothesis Pipeline
  describe("2. Question-First Discovery to Recommendations", () => {
    it("generates honest hypotheses for a complete beginner in healthcare", () => {
      const beginnerProfile: UserProfile = {
        ...EMPTY_PROFILE,
        id: "student-health-1",
        name: "Meera",
        stage: "first_second_year",
        discipline: "healthcare",
        customDisciplineText: "B.Sc Biotechnology",
        selectedWorkStyles: ["analytical", "collaborative"],
        interests: ["Clinical Workflows", "Patient Care"],
        hasCompletedOnboarding: true,
        uncertainties: ["Not sure what non-hospital clinical careers exist in India."],
      };

      const recs = computeCareerRecommendations(beginnerProfile);
      expect(recs.length).toBeGreaterThan(0);

      // Top recommendation should align with healthcare
      const topRec = recs[0];
      expect(topRec.career.discipline).toBe("healthcare");
      expect(topRec.career.slug).toBe("clinical-research-coordinator");
      expect(topRec.fitScore).toBeGreaterThanOrEqual(40);
      expect(topRec.matchReasons.some((r) => r.toLowerCase().includes("healthcare"))).toBe(true);
    });

    it("generates multi-disciplinary exploratory bridge hypotheses for undecided explorers", () => {
      const undecidedProfile: UserProfile = {
        ...EMPTY_PROFILE,
        id: "student-undecided-1",
        name: "Kabir",
        discipline: "undecided",
        selectedWorkStyles: ["creative", "analytical"],
        interests: ["Environmental Data", "UI Prototyping"],
        hasCompletedOnboarding: true,
      };

      const recs = computeCareerRecommendations(undecidedProfile);
      expect(recs.length).toBeGreaterThanOrEqual(2);
      expect(recs.some((r) => r.career.slug === "environmental-data-researcher")).toBe(true);
      expect(recs.some((r) => r.career.slug === "product-ux-designer")).toBe(true);
    });
  });

  // 3. Grounded AI Career Guide & Open-Ended Query Answering
  describe("3. Open-Ended AI Intelligence Engine & Context Grounding", () => {
    const studentProfile: UserProfile = {
      ...EMPTY_PROFILE,
      id: "student-query-test",
      name: "Rohan",
      stage: "pre_final_year",
      discipline: "engineering",
      customDisciplineText: "Mechanical Engineering",
      selectedWorkStyles: ["analytical", "creative"],
      interests: ["UX & Product Design", "Figma"],
      weeklyCapacityHours: 6,
      isExamMode: false,
      targetCareerSlug: "product-ux-designer",
      uncertainties: [
        "Can I transition from Mechanical to UX in India without a design degree?",
      ],
      hasCompletedOnboarding: true,
    };

    it("builds a grounded system prompt reflecting student's real context", () => {
      const prompt = buildGroundedSystemPrompt(studentProfile);
      expect(prompt).toContain("Rohan");
      expect(prompt).toContain("Mechanical Engineering");
      expect(prompt).toContain("Digital Product & UX Designer");
      expect(prompt).toContain("Can I transition from Mechanical to UX");
      expect(prompt).toContain("6 hours/week");
    });

    it("handles cross-disciplinary transition query with actionable guidance", () => {
      const messages: ChatMessage[] = [
        {
          role: "user",
          content: "Can I switch from mechanical engineering to UX design in India?",
        },
      ];

      const response = generateLocalGroundedResponse(messages, studentProfile);
      expect(response.provider).toBe("local_grounded_engine");
      expect(response.content).toContain("Product/UX Design");
      expect(response.content.toLowerCase()).toContain("dribbble");
      expect(response.content.toLowerCase()).toContain("micro-trial");
      expect(response.suggestedFollowUps.length).toBeGreaterThan(0);
      expect(response.referencedCareers).toContain("product-ux-designer");
    });

    it("handles realistic Indian CTC and salary queries without fake hype", () => {
      const messages: ChatMessage[] = [
        {
          role: "user",
          content: "What is the real salary package for entry-level developers in India?",
        },
      ];

      const response = generateLocalGroundedResponse(messages, studentProfile);
      expect(response.content).toContain("LPA");
      expect(response.content).toContain("Base In-Hand Salary");
      expect(response.content).toContain("Mass IT");
      expect(response.suggestedFollowUps.length).toBeGreaterThan(0);
    });

    it("handles Exam Mode and burnout queries with clear schedule advice", () => {
      const messages: ChatMessage[] = [
        {
          role: "user",
          content: "I have semester exams coming up and I feel overwhelmed. How do I balance this?",
        },
      ];

      const response = generateLocalGroundedResponse(messages, studentProfile);
      expect(response.content).toContain("Exam Mode");
      expect(response.content).toContain("3 hours/week");
      expect(response.content).toContain("maintenance");
    });

    it("handles specialized multidisciplinary career queries: Environmental Data and Journalism", () => {
      const envMessages: ChatMessage[] = [
        {
          role: "user",
          content: "What does an environmental data researcher actually do with GIS and satellite sensors?",
        },
      ];
      const envRes = generateLocalGroundedResponse(envMessages, studentProfile);
      expect(envRes.content).toContain("Environmental Data");
      expect(envRes.content.toLowerCase()).toContain("geopandas");
      expect(envRes.referencedCareers).toContain("environmental-data-researcher");

      const journalMessages: ChatMessage[] = [
        {
          role: "user",
          content: "How can I become an investigative tech journalist covering Indian startups?",
        },
      ];
      const journalRes = generateLocalGroundedResponse(journalMessages, studentProfile);
      expect(journalRes.content).toContain("Investigative Tech Journalism");
      expect(journalRes.referencedCareers).toContain("investigative-tech-journalist");
    });

    it("gracefully answers arbitrary open-ended queries without crashing", () => {
      const arbitraryMessages: ChatMessage[] = [
        {
          role: "user",
          content: "What is the best way to spend 45 minutes every evening after college?",
        },
      ];
      const res = generateLocalGroundedResponse(arbitraryMessages, studentProfile);
      expect(res.content.length).toBeGreaterThan(50);
      expect(res.suggestedFollowUps.length).toBeGreaterThan(0);
    });
  });
});
