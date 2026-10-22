import { NextRequest, NextResponse } from "next/server";
import { UserProfile } from "@/lib/types";
import {
  ChatMessage,
  buildGroundedSystemPrompt,
  generateLocalGroundedResponse,
  AIResponsePayload,
} from "@/lib/ai-knowledge";
import { checkRateLimit, checkRateLimitAsync, extractClientIp } from "@/lib/rate-limiter";

const MAX_MESSAGES_COUNT = 30;
const MAX_MESSAGE_LENGTH = 2500;
const MAX_BODY_BYTES = 50 * 1024; // 50KB payload threshold

export async function POST(req: NextRequest) {
  try {
    // 1. Origin verification for browser callers
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");

    if (origin) {
      try {
        const originUrl = new URL(origin);
        const isLocal =
          originUrl.hostname === "localhost" ||
          originUrl.hostname === "127.0.0.1" ||
          originUrl.hostname === "0.0.0.0";
        const isHostMatch =
          host && (originUrl.host === host || originUrl.hostname === host.split(":")[0]);

        if (!isLocal && !isHostMatch) {
          return NextResponse.json(
            { error: "Forbidden: cross-origin request rejected." },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Forbidden: invalid origin header." },
          { status: 403 }
        );
      }
    }

    // 2. IP Rate Limiting (Distributed when Upstash Redis configured; in-memory fallback otherwise)
    // Secure extraction defends against arbitrary spoofed X-Forwarded-For headers
    const clientIp = extractClientIp(req.headers, (req as any).ip);

    const rateResult = await checkRateLimitAsync(clientIp);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before sending another message." },
        { status: 429, headers: { "Retry-After": String(rateResult.retryAfterSeconds || 60) } }
      );
    }

    // 3. Request body size check & safe JSON parse
    const rawBodyText = await req.text();
    if (rawBodyText.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Payload too large: request body exceeds 50KB limit." },
        { status: 413 }
      );
    }

    let body: any;
    try {
      body = JSON.parse(rawBodyText);
    } catch {
      return NextResponse.json(
        { error: "Malformed request: invalid JSON body." },
        { status: 400 }
      );
    }

    const { messages, profile, offlineOnly, cloudConsentGranted } = body as {
      messages: ChatMessage[];
      profile: UserProfile;
      offlineOnly?: boolean;
      cloudConsentGranted?: boolean;
    };

    // 4. Validate messages input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required." },
        { status: 400 }
      );
    }

    if (messages.length > MAX_MESSAGES_COUNT) {
      return NextResponse.json(
        { error: `Conversation exceeds maximum allowed history (${MAX_MESSAGES_COUNT} messages). Please reset chat.` },
        { status: 400 }
      );
    }

    // Validate each message structure and length
    for (const msg of messages) {
      if (!msg || typeof msg.content !== "string" || !["user", "assistant", "system"].includes(msg.role)) {
        return NextResponse.json(
          { error: "Malformed message object in history." },
          { status: 400 }
        );
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json(
          { error: `Single message exceeds length limit of ${MAX_MESSAGE_LENGTH} characters.` },
          { status: 400 }
        );
      }
    }

    // 5. Sanitize and extract only authorized profile context (prevent untrusted state pollution)
    const rawProfile = profile || ({} as Partial<UserProfile>);
    const safeProfile: UserProfile = {
      id: typeof rawProfile.id === "string" ? rawProfile.id.slice(0, 50) : "guest-fallback",
      name: typeof rawProfile.name === "string" ? rawProfile.name.slice(0, 50) : "Student Explorer",
      stage: rawProfile.stage || "first_second_year",
      discipline: rawProfile.discipline || "engineering",
      customDisciplineText: typeof rawProfile.customDisciplineText === "string" ? rawProfile.customDisciplineText.slice(0, 100) : undefined,
      currentSituation: typeof rawProfile.currentSituation === "string" ? rawProfile.currentSituation.slice(0, 300) : undefined,
      actualExperience: typeof rawProfile.actualExperience === "string" ? rawProfile.actualExperience.slice(0, 300) : undefined,
      selectedWorkStyles: Array.isArray(rawProfile.selectedWorkStyles) ? rawProfile.selectedWorkStyles.slice(0, 5) : ["analytical"],
      interests: Array.isArray(rawProfile.interests) ? rawProfile.interests.map((i) => String(i).slice(0, 50)).slice(0, 15) : ["Technology"],
      thingsToAvoid: typeof rawProfile.thingsToAvoid === "string" ? rawProfile.thingsToAvoid.slice(0, 200) : undefined,
      weeklyCapacityHours: typeof rawProfile.weeklyCapacityHours === "number" ? Math.min(40, Math.max(1, rawProfile.weeklyCapacityHours)) : 6,
      isExamMode: Boolean(rawProfile.isExamMode),
      targetCareerSlug: typeof rawProfile.targetCareerSlug === "string" ? rawProfile.targetCareerSlug.slice(0, 80) : undefined,
      targetCareerHypotheses: Array.isArray(rawProfile.targetCareerHypotheses) ? rawProfile.targetCareerHypotheses.slice(0, 5) : [],
      uncertainties: Array.isArray(rawProfile.uncertainties) ? rawProfile.uncertainties.map((u) => String(u).slice(0, 150)).slice(0, 10) : [],
      skillEvidence: {}, // Chat route does NOT receive or process raw skill mutation evidence
      completedTrialIds: Array.isArray(rawProfile.completedTrialIds) ? rawProfile.completedTrialIds.slice(0, 20) : [],
      trialReflections: {},
      projectSubmissions: {},
      savedCareerSlugs: [],
      createdAt: typeof rawProfile.createdAt === "string" ? rawProfile.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    // 6. Explicit Cloud AI Policy Enforcement:
    // Cloud LLM is ONLY contacted if:
    // a) User has NOT enabled offline-only mode
    // b) User has granted explicit informed consent (cloudConsentGranted === true)
    // c) Server has a configured API key
    const isCloudAllowed = !offlineOnly && cloudConsentGranted === true;

    // 7. Try Gemini if configured and explicitly consented
    if (isCloudAllowed && geminiKey) {
      try {
        const systemPrompt = buildGroundedSystemPrompt(safeProfile);
        const contents = [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        ];

        // Pass API key via header 'x-goog-api-key' rather than query parameter to prevent URL leakage
        const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          body: JSON.stringify({ contents }),
          signal: AbortSignal.timeout(10000),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText =
            data.candidates?.[0]?.content?.parts?.[0]?.text || "";

          if (candidateText.trim()) {
            const payload: AIResponsePayload = {
              content: candidateText.trim(),
              suggestedFollowUps: [
                "What is my highest-priority skill gap?",
                "How does Exam Mode protect my schedule?",
                "Suggest a concrete vertical-slice project brief",
              ],
              provider: "cloud_llm",
              groundingNotice: "Live cloud LLM (Gemini 1.5) response grounded in your Aaroh profile and knowledge base.",
            };
            return NextResponse.json(payload);
          }
        } else {
          console.warn("Gemini API call returned non-200 status code");
        }
      } catch (geminiError: any) {
        console.warn("Gemini call error or timeout; seamlessly falling back to local engine:", geminiError?.message ? "Upstream network failure" : "Unknown network error");
      }
    }

    // 8. Try OpenAI if configured and explicitly consented
    if (isCloudAllowed && openAiKey) {
      try {
        const systemPrompt = buildGroundedSystemPrompt(safeProfile);
        const openAiMessages = [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ];

        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: openAiMessages,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const candidateText = data.choices?.[0]?.message?.content || "";

          if (candidateText.trim()) {
            const payload: AIResponsePayload = {
              content: candidateText.trim(),
              suggestedFollowUps: [
                "What should I do this week?",
                "How do I prove this skill without formal experience?",
                "Take me to the practical micro-trial",
              ],
              provider: "cloud_llm",
              groundingNotice: "Live cloud LLM (OpenAI gpt-4o-mini) response grounded in your Aaroh profile and knowledge base.",
            };
            return NextResponse.json(payload);
          }
        } else {
          console.warn("OpenAI API call returned non-200 status code");
        }
      } catch (openAiError: any) {
        console.warn("OpenAI call error or timeout; seamlessly falling back to local engine:", openAiError?.message ? "Upstream network failure" : "Unknown network error");
      }
    }

    // 9. Fallback / Default: Local Grounded Intelligence Engine (Deterministic, transparent, honest)
    const localPayload = generateLocalGroundedResponse(messages, safeProfile);
    if (isCloudAllowed && (geminiKey || openAiKey)) {
      localPayload.groundingNotice =
        "Cloud model connection timed out or unavailable. Seamlessly fell back to Aaroh's grounded local reasoning engine.";
    }
    return NextResponse.json(localPayload);
  } catch (err: unknown) {
    const errorType = err instanceof Error ? err.name : "InternalError";
    console.error("AI chat route unexpected exception:", errorType);
    // Generic error response: never expose raw stack traces, error messages, or internal paths
    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing your query. Please try again.",
      },
      { status: 500 }
    );
  }
}
