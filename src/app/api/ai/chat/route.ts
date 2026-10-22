import { NextRequest, NextResponse } from "next/server";
import { UserProfile } from "@/lib/types";
import {
  ChatMessage,
  buildGroundedSystemPrompt,
  generateLocalGroundedResponse,
  AIResponsePayload,
} from "@/lib/ai-knowledge";

const MAX_MESSAGES_COUNT = 30;
const MAX_MESSAGE_LENGTH = 2500;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, profile } = body as {
      messages: ChatMessage[];
      profile: UserProfile;
    };

    // 1. Validate messages input
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

    // 2. Sanitize and extract only authorized profile context (prevent untrusted state pollution)
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

    // 3. Try Gemini if configured
    if (geminiKey) {
      try {
        const systemPrompt = buildGroundedSystemPrompt(safeProfile);
        const contents = [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        ];

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
          console.warn("Gemini API call returned non-200 status:", geminiRes.status);
        }
      } catch (geminiError: any) {
        console.warn("Gemini call error or timeout; seamlessly falling back to local engine:", geminiError?.message || geminiError);
      }
    }

    // 4. Try OpenAI if configured
    if (openAiKey) {
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
          console.warn("OpenAI API call returned non-200 status:", openAiRes.status);
        }
      } catch (openAiError: any) {
        console.warn("OpenAI call error or timeout; seamlessly falling back to local engine:", openAiError?.message || openAiError);
      }
    }

    // 5. Fallback: Local Grounded Intelligence Engine (Deterministic, transparent, honest)
    const localPayload = generateLocalGroundedResponse(messages, safeProfile);
    if (geminiKey || openAiKey) {
      localPayload.groundingNotice =
        "Cloud model connection timed out or unavailable. Seamlessly fell back to Aaroh's grounded local reasoning engine.";
    }
    return NextResponse.json(localPayload);
  } catch (err: any) {
    console.error("AI chat route unexpected exception:", err);
    return NextResponse.json(
      {
        error: "Internal server error processing career intelligence query.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
