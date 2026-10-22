import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AI_EVALUATION_DATASET } from "@/lib/ai-evaluation-dataset";
import { generateLocalGroundedResponse } from "@/lib/ai-knowledge";
import { POST } from "@/app/api/ai/chat/route";
import { NextRequest } from "next/server";
import { EMPTY_PROFILE } from "@/lib/store";

describe("Phase 5B: Comprehensive AI Intelligence Evaluation Benchmark (64 Cases)", () => {
  // 1. All 64 benchmark cases
  AI_EVALUATION_DATASET.forEach((testCase) => {
    it(`[${testCase.category}] ${testCase.id} - ${testCase.title}`, () => {
      const response = generateLocalGroundedResponse(testCase.messages, testCase.profile);

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe("string");
      expect(response.content.length).toBeGreaterThan(20);

      const result = testCase.validate(response);
      if (!result.pass) {
        console.warn(`Evaluation Failure on ${testCase.id} (${testCase.title}):\n` + result.reasons.join("\n"));
      }

      expect(result.pass, `Evaluation test failed for ${testCase.id}: ${result.reasons.join("; ")}`).toBe(true);
    });
  });

  // 2. Scorecard analysis & held-out set verification
  it("Scorecard: validates 100% pass rate on held-out test split (30 cases)", () => {
    const heldOutCases = AI_EVALUATION_DATASET.filter((c) => c.isHeldOut);
    expect(heldOutCases.length).toBe(30);

    heldOutCases.forEach((testCase) => {
      const response = generateLocalGroundedResponse(testCase.messages, testCase.profile);
      const result = testCase.validate(response);
      expect(result.pass, `Held-out case ${testCase.id} failed: ${result.reasons.join("; ")}`).toBe(true);
    });
  });

  it("Scorecard: validates 100% pass rate on tuning test split (34 cases)", () => {
    const tuningCases = AI_EVALUATION_DATASET.filter((c) => !c.isHeldOut);
    expect(tuningCases.length).toBe(34);

    tuningCases.forEach((testCase) => {
      const response = generateLocalGroundedResponse(testCase.messages, testCase.profile);
      const result = testCase.validate(response);
      expect(result.pass, `Tuning case ${testCase.id} failed: ${result.reasons.join("; ")}`).toBe(true);
    });
  });
});

describe("Phase 5B: Next.js API Route (/api/ai/chat) & Provider Contracts", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("Rejects empty or missing messages array with HTTP 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [], profile: EMPTY_PROFILE }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid request");
  });

  it("Rejects oversized conversation history (> 30 messages) with HTTP 400", async () => {
    const oversizedMsgs = Array.from({ length: 35 }, (_, i) => ({
      role: "user" as const,
      content: `Message ${i}`,
    }));
    const req = new NextRequest("http://localhost:3000/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages: oversizedMsgs, profile: EMPTY_PROFILE }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("exceeds maximum allowed history");
  });

  it("Rejects oversized single message (> 2500 characters) with HTTP 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "a".repeat(2600) }],
        profile: EMPTY_PROFILE,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("exceeds length limit");
  });

  it("Transparently falls back to local engine when no cloud keys are configured", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "What is the difference between Business Analyst and Data Analyst?" }],
        profile: EMPTY_PROFILE,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content).toBeDefined();
    expect(body.provider).toBe("local_grounded_engine");
    expect(body.content).toContain("Business Analyst");
  });

  it("Executes Gemini contract when GEMINI_API_KEY is present and handles mock response", async () => {
    process.env.GEMINI_API_KEY = "mock-gemini-key";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "Grounded Gemini guidance: Focus on SQL and data structures." }],
            },
          },
        ],
      }),
    });
    global.fetch = mockFetch;

    const req = new NextRequest("http://localhost:3000/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "What should I focus on this week?" }],
        profile: EMPTY_PROFILE,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(body.provider).toBe("cloud_llm");
    expect(body.content).toContain("Grounded Gemini guidance");
    expect(body.groundingNotice).toContain("Gemini 1.5");
  });

  it("Executes OpenAI contract when OPENAI_API_KEY is present and handles mock response", async () => {
    process.env.OPENAI_API_KEY = "mock-openai-key";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "Grounded OpenAI guidance: Prioritize building one clean project.",
            },
          },
        ],
      }),
    });
    global.fetch = mockFetch;

    const req = new NextRequest("http://localhost:3000/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "What is my next step?" }],
        profile: EMPTY_PROFILE,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(body.provider).toBe("cloud_llm");
    expect(body.content).toContain("Grounded OpenAI guidance");
    expect(body.groundingNotice).toContain("OpenAI gpt-4o-mini");
  });

  it("Seamlessly falls back to local engine when cloud provider call fails", async () => {
    process.env.GEMINI_API_KEY = "mock-gemini-key";

    // Simulate network error / timeout
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network timeout after 10000ms"));
    global.fetch = mockFetch;

    const req = new NextRequest("http://localhost:3000/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "What are the 7 career disciplines?" }],
        profile: EMPTY_PROFILE,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    // Provider should be local engine with fallback notice
    expect(body.provider).toBe("local_grounded_engine");
    expect(body.groundingNotice).toContain("timed out or unavailable");
    expect(body.content).toBeDefined();
  });
});

