"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Bot,
  User,
  HelpCircle,
  Clock,
  Compass,
  Layers,
  Zap,
  Calendar,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAarohStore } from "@/lib/store";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { MentorMessage } from "@/lib/types";
import { getDisciplineLabel } from "@/lib/utils";

const INITIAL_MESSAGES: MentorMessage[] = [
  {
    id: "msg-welcome",
    role: "assistant",
    content: `Hi there! I am your Aaroh Career Intelligence Guide.

Ask me anything about career options in India, day-to-day realities, transitioning across disciplines, bridging skill gaps, or protecting your schedule during exams.

I don't give generic motivational quotes or inflated salary claims. We focus on grounded facts, honest trade-offs, and practical proof of work.`,
    timestamp: "Just now",
    suggestedFollowUps: [
      "Why is my current target career recommended for me?",
      "Can I switch from my college stream to software or UX?",
      "What do entry-level roles in India actually pay?",
      "How do I balance semester exams with portfolio projects?",
    ],
  },
];

export default function AIMentorPage() {
  const { profile, toggleExamMode } = useAarohStore();

  const [messages, setMessages] = useState<MentorMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [showContextDetails, setShowContextDetails] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [offlineOnly, setOfflineOnly] = useState(false);
  const [cloudConsentGranted, setCloudConsentGranted] = useState(false);
  const [providerStatus, setProviderStatus] = useState<string>("Grounded Local Engine (Offline)");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const targetCareer =
    CAREERS_CATALOG.find((c) => c.slug === profile.targetCareerSlug) ||
    CAREERS_CATALOG.find((c) => c.slug === "full-stack-systems-engineer") ||
    CAREERS_CATALOG[0];

  // Hydrate conversation and privacy settings from storage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedChat = sessionStorage.getItem("aaroh_mentor_chat_v1");
      if (storedChat) {
        const parsed = JSON.parse(storedChat);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }

      const storedOffline = localStorage.getItem("aaroh_mentor_offline_only");
      if (storedOffline !== null) {
        setOfflineOnly(storedOffline === "true");
      }

      const storedConsent = localStorage.getItem("aaroh_cloud_ai_consent");
      if (storedConsent === "granted") {
        setCloudConsentGranted(true);
      }
    } catch (e) {
      console.warn("Failed to load mentor state from storage:", e);
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery.trim());
      window.history.replaceState({}, "", "/mentor");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdatePrivacySettings = (isOffline: boolean, consentGranted: boolean) => {
    setOfflineOnly(isOffline);
    setCloudConsentGranted(consentGranted);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("aaroh_mentor_offline_only", String(isOffline));
        localStorage.setItem("aaroh_cloud_ai_consent", consentGranted ? "granted" : "revoked");
      }
    } catch (e) {
      console.warn("Failed to persist privacy settings:", e);
    }
    setShowPrivacyModal(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const updateAndPersistMessages = (newMsgs: MentorMessage[]) => {
    setMessages(newMsgs);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("aaroh_mentor_chat_v1", JSON.stringify(newMsgs));
      }
    } catch (e) {
      console.warn("Failed to persist messages:", e);
    }
  };

  const handleClearChat = () => {
    updateAndPersistMessages(INITIAL_MESSAGES);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("aaroh_mentor_chat_v1");
      }
    } catch (e) {
      console.warn("Failed to clear session storage:", e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorNotice(null);

    const userMsg: MentorMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    updateAndPersistMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          profile,
          offlineOnly,
          cloudConsentGranted,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.provider === "cloud_llm") {
        setProviderStatus("Cloud LLM (Live)");
      } else if (offlineOnly) {
        setProviderStatus("Local Engine (Offline Enforced)");
      } else if (!cloudConsentGranted) {
        setProviderStatus("Local Engine (No Cloud Consent)");
      } else if (data.groundingNotice && data.groundingNotice.includes("timed out or unavailable")) {
        setProviderStatus("Local Fallback (Cloud Timed Out)");
      } else {
        setProviderStatus("Grounded Local Engine (Offline)");
      }

      const assistantMsg: MentorMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.content || "I couldn't process that query. Please try rephrasing.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        contextSummary: data.groundingNotice,
        suggestedFollowUps: data.suggestedFollowUps || [
          "Take the career micro-trial",
          "What is my next practical milestone?",
        ],
      };

      updateAndPersistMessages([...newMessages, assistantMsg]);
    } catch (err: any) {
      console.error("AI mentor query failed:", err);
      setErrorNotice("Could not reach the intelligence service. You can retry or check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AppShell>
      <div className="space-y-4 animate-fade-in max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border-subtle gap-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="primary">AI Career Guide</Badge>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs text-text-muted font-medium">
                Active: {targetCareer.title}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-text-primary tracking-tight">
              Open-Ended Career Intelligence
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                providerStatus.includes("Live")
                  ? "primary"
                  : providerStatus.includes("Timed Out")
                  ? "amber"
                  : "mint"
              }
              className="text-[11px]"
            >
              {providerStatus}
            </Badge>
            <button
              onClick={() => setShowPrivacyModal(true)}
              title="AI Privacy and Cloud Data Sharing Controls"
              className="p-1.5 rounded-lg bg-surface-secondary border border-border-subtle text-text-muted hover:text-text-primary transition-colors text-xs flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
              <span className="hidden sm:inline">AI Privacy</span>
            </button>
            <button
              onClick={handleClearChat}
              title="Reset conversation"
              className="p-1.5 rounded-lg bg-surface-secondary border border-border-subtle text-text-muted hover:text-text-primary transition-colors text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Chat</span>
            </button>
          </div>
        </div>

        {/* AI Privacy & Consent Modal */}
        <Modal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
          title="AI Privacy & Cloud Data Sharing"
          description="Control whether your career intelligence queries remain 100% on-device or connect to cloud models."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-text-muted">
            <div className="p-3 rounded-xl bg-surface-secondary/60 border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary">Current Active Mode:</span>
                <Badge variant={offlineOnly ? "mint" : cloudConsentGranted ? "primary" : "amber"}>
                  {offlineOnly
                    ? "100% Offline (Enforced)"
                    : cloudConsentGranted
                    ? "Cloud AI Permitted"
                    : "Offline (Consent Required)"}
                </Badge>
              </div>
              <p className="text-[11px] leading-relaxed">
                By default, Aaroh uses an offline deterministic semantic engine. No prompts, profile records, or reflections are ever transmitted to any external server.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-border-subtle bg-surface-card space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">Mode A: 100% Offline Local Engine (Recommended)</span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Queries are matched and synthesized locally using Aaroh&apos;s verified Indian tech and career catalog. Zero external API calls, zero tracking, zero data transmission.
                </p>
                <Button
                  size="sm"
                  variant={offlineOnly ? "primary" : "outline"}
                  onClick={() => handleUpdatePrivacySettings(true, false)}
                  className="w-full mt-2"
                >
                  {offlineOnly ? "✓ Active: Enforce Offline Mode" : "Select 100% Offline Mode"}
                </Button>
              </div>

              <div className="p-3 rounded-xl border border-border-subtle bg-surface-card space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">Mode B: Cloud AI (Google Gemini / OpenAI)</span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Requires server API keys. Transmits your message and student context (name, stage, discipline, situation) over HTTPS to Google or OpenAI for open-ended synthesis.
                </p>
                <Button
                  size="sm"
                  variant={!offlineOnly && cloudConsentGranted ? "primary" : "outline"}
                  onClick={() => handleUpdatePrivacySettings(false, true)}
                  className="w-full mt-2"
                >
                  {!offlineOnly && cloudConsentGranted ? "✓ Active: Cloud AI Permitted" : "Grant Consent & Enable Cloud AI"}
                </Button>
              </div>
            </div>

            <div className="text-[11px] text-text-muted border-t border-border-subtle pt-3">
              <span className="font-semibold text-text-primary">Informed Consent Notice: </span>
              Aaroh does not share your data with advertisers or data brokers. You can withdraw consent or switch back to 100% offline mode at any time.
            </div>
          </div>
        </Modal>

        {/* Student Context Disclosure Banner */}
        <div className="p-3 rounded-xl bg-surface-card border border-border-subtle text-xs space-y-2 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-primary" />
              <span className="font-semibold text-text-primary">
                Grounding Context for {profile.name || "Student Explorer"}
              </span>
            </div>
            <button
              onClick={() => setShowContextDetails(!showContextDetails)}
              className="text-brand-primary font-medium hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>{showContextDetails ? "Hide details" : "View context"}</span>
              {showContextDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showContextDetails && (
            <div className="pt-2 border-t border-border-subtle grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-text-muted animate-fade-in">
              <div>
                <span className="block font-semibold text-text-primary">Discipline:</span>
                <span>{getDisciplineLabel(profile.discipline)}</span>
              </div>
              <div>
                <span className="block font-semibold text-text-primary">Stage:</span>
                <span>{profile.stage.replace(/_/g, " ")}</span>
              </div>
              <div>
                <span className="block font-semibold text-text-primary">Weekly Capacity:</span>
                <span>{profile.weeklyCapacityHours} hrs/wk</span>
              </div>
              <div>
                <span className="block font-semibold text-text-primary">Exam Mode:</span>
                <span className={profile.isExamMode ? "text-brand-primary font-bold" : ""}>
                  {profile.isExamMode ? "Active (3h/wk)" : "Off"}
                </span>
              </div>
              {profile.uncertainties && profile.uncertainties.length > 0 && (
                <div className="col-span-2 sm:col-span-4 pt-1">
                  <span className="font-semibold text-text-primary">Uncertainties: </span>
                  <span>{profile.uncertainties.join("; ")}</span>
                </div>
              )}
              {/* Privacy Notice */}
              <div className="col-span-2 sm:col-span-4 pt-1.5 border-t border-border-subtle text-[11px] text-text-muted">
                <span className="font-semibold text-text-primary">Data Privacy & Provider Scope: </span>
                <span>
                  {providerStatus.includes("Live")
                    ? "Live Cloud LLM mode is active. Conversation text and profile context are transmitted to the configured cloud provider API for response generation."
                    : "Operating in Grounded Local Engine mode. All processing and responses are generated locally in your browser. No profile or chat data is sent to external servers unless cloud API keys are configured."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 space-y-4 py-2 overflow-y-auto">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-brand-primary" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-brand-primary text-neutral-950 font-medium rounded-tr-sm shadow-brand-glow"
                        : "bg-surface-card border border-border-medium text-text-primary rounded-tl-sm shadow-card"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans space-y-2">
                      {m.content}
                    </div>

                    {m.contextSummary && (
                      <div className="mt-2.5 pt-2 border-t border-border-subtle/60 text-[10px] text-text-muted flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-mint-brand shrink-0" />
                        <span>{m.contextSummary}</span>
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-1.5 text-right ${
                        isUser ? "text-neutral-950/70" : "text-text-muted"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {/* Suggested Follow-Ups */}
                  {!isUser && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestedFollowUps.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(chip)}
                          className="px-2.5 py-1 rounded-lg bg-surface-secondary border border-border-subtle hover:border-brand-primary/50 text-[11px] text-text-muted hover:text-text-primary transition-all flex items-center gap-1 group"
                        >
                          <Sparkles className="w-3 h-3 text-brand-primary group-hover:scale-110 transition-transform" />
                          <span>{chip}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-surface-interactive border border-border-medium flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-text-muted" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-fade-in">
              <div className="w-7 h-7 rounded-lg bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-brand-primary" />
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-card border border-border-medium text-xs text-text-muted flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                <span>Synthesizing grounded career intelligence...</span>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorNotice && (
            <div className="p-3 rounded-xl bg-rose-brand/10 border border-rose-brand/30 text-rose-brand text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorNotice}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage()}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-2 border-t border-border-subtle bg-canvas sticky bottom-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2 bg-surface-card border border-border-medium rounded-2xl p-2 shadow-card focus-within:border-brand-primary transition-colors"
          >
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onInput={(e) => setInputText((e.target as HTMLTextAreaElement).value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything: switching fields, Indian CTC realities, balancing exams, day-in-the-life..."
              className="flex-1 bg-transparent border-0 text-text-primary text-xs sm:text-sm p-2 focus:outline-none resize-none leading-relaxed"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!inputText.trim() || isLoading}
              aria-label="Send career query"
              className="shrink-0 rounded-xl font-bold"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-text-muted px-2 pt-1.5">
            <span>Press Enter to send • Shift+Enter for new line</span>
            <Link href="/trials" className="text-brand-primary hover:underline font-medium">
              Want to test a role? Try 15-Min Micro-Trials →
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
