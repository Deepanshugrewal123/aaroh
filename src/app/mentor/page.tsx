"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAarohStore } from "@/lib/store";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { SKILLS_CATALOG } from "@/lib/skills-data";
import { MentorMessage } from "@/lib/types";
import { getDisciplineLabel } from "@/lib/utils";

const INITIAL_MESSAGES: MentorMessage[] = [
  {
    id: "msg-welcome",
    role: "assistant",
    content: "Hi there! I am your Aaroh Career Intelligence Guide. Ask me anything about career options, what people in these roles actually do, how to bridge skill gaps, or how to calibrate your weekly schedule. I don't give generic motivational quotes or false salary promises—we explore grounded facts and practical next steps.",
    timestamp: "Just now",
    suggestedFollowUps: [
      "Why is my current target career recommended for me?",
      "What is the single most important skill gap I should tackle first?",
      "How does Exam Mode protect my schedule during midterms?",
    ],
  },
];

export default function AIMentorPage() {
  const { profile, toggleExamMode } = useAarohStore();

  const [messages, setMessages] = useState<MentorMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContextDisclosure, setShowContextDisclosure] = useState(false);

  const targetCareer = CAREERS_CATALOG.find((c) => c.slug === profile.targetCareerSlug) || CAREERS_CATALOG[2];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: MentorMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Fast, deterministic contextual reply engine
    setTimeout(() => {
      let replyContent = "";
      let followUps: string[] = [];

      const lower = text.toLowerCase();
      if (lower.includes("why") || lower.includes("recommended") || lower.includes("fit")) {
        replyContent = `Here is why **${targetCareer.title}** was suggested as a starting hypothesis:
• Your Field: Aligned with your background in ${getDisciplineLabel(profile.discipline)}.
• Your Working Style: Matches your interest in ${profile.selectedWorkStyles.join(" and ")} problem-solving.
• Unassessed Areas: You still have skills in this domain that haven't been evaluated yet. This is why we treat it as an exploratory hypothesis rather than an absolute prediction. Testing it in the 12-minute micro-trial is the best next step!`;
        followUps = ["Take me to the micro-trial", "Show me the skill requirements"];
      } else if (lower.includes("skill") || lower.includes("gap") || lower.includes("tackle")) {
        const topReq = targetCareer.skillsRequired.find(
          (r) => !profile.skillEvidence[r.skillId] || profile.skillEvidence[r.skillId].state === "not_assessed"
        ) || targetCareer.skillsRequired[0];
        const skillName = SKILLS_CATALOG[topReq.skillId]?.name || topReq.skillId;

        replyContent = `For **${targetCareer.title}**, your highest-priority focus area is **${skillName}** (${topReq.importance} requirement).
Rather than binge-watching generic tutorial videos, I recommend building a small vertical-slice project from Project Studio that proves you can apply this skill to a real problem.`;
        followUps = ["Open Project Studio", "How is skill coverage measured?"];
      } else if (lower.includes("exam") || lower.includes("midterm") || lower.includes("overwhelmed")) {
        replyContent = `College exam season requires realistic breathing room, not guilt trips.
In Aaroh, you can toggle **Exam Mode** with one tap from the sidebar or dashboard. This caps your weekly schedule at ~3 hours of light concept maintenance, deferring project milestones without breaking streaks or sending nagging alerts.`;
        followUps = ["Toggle Exam Mode now", "View Adaptive Roadmap"];
      } else {
        replyContent = `That's a great question. As your guide, my goal is to help you turn curiosity into tangible proof of work.
For **${targetCareer.title}**, what is one small exercise (a 1-page brief, a UI wireframe, or a 20-line script) you could complete this week to test this interest?`;
        followUps = [
          "Suggest a beginner project brief",
          "What do people do daily in this role?",
        ];
      }

      const assistantMsg: MentorMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedFollowUps: followUps,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <AppShell>
      <div className="space-y-4 animate-fade-in max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Badge variant="amber">AI Guide</Badge>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs text-text-muted">Target: {targetCareer.title}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-text-primary tracking-tight">
              Career Guide & Mentor
            </h1>
          </div>

          <button
            onClick={() => setMessages(INITIAL_MESSAGES)}
            title="Reset conversation"
            className="p-1.5 rounded-lg bg-surface-secondary border border-border-subtle text-text-muted hover:text-text-primary transition-colors text-xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>

        {/* Optional Context Disclosure (Simple & non-intrusive) */}
        <div className="p-3 rounded-xl bg-surface-card border border-border-subtle text-xs">
          <button
            onClick={() => setShowContextDisclosure(!showContextDisclosure)}
            className="w-full flex items-center justify-between text-text-muted hover:text-text-primary transition-colors font-medium"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-brand" />
              <span>How advice is personalized to you</span>
            </span>
            {showContextDisclosure ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showContextDisclosure && (
            <div className="pt-2 mt-2 border-t border-border-subtle/60 text-text-muted space-y-1 animate-fade-in text-[11px]">
              <p>• Exploring: <strong className="text-text-primary">{targetCareer.title}</strong></p>
              <p>• Background: <strong className="text-text-primary">{getDisciplineLabel(profile.discipline)}</strong></p>
              <p>• Work Styles: <strong className="text-text-primary">{profile.selectedWorkStyles.join(", ")}</strong></p>
              <p>• Capacity: <strong className="text-text-primary">{profile.isExamMode ? "3 hrs/wk (Exam Mode)" : `${profile.weeklyCapacityHours} hrs/wk`}</strong></p>
              <p className="text-amber-brand pt-1">Aaroh never sends resumes, passwords, or private notes to external servers.</p>
            </div>
          )}
        </div>

        {/* Chat Stream Window */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border-subtle space-y-4 min-h-[420px] flex flex-col justify-between shadow-card">
          <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-amber-brand/10 border border-amber-brand/30 flex items-center justify-center text-amber-brand shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isAssistant
                        ? "bg-surface-secondary/80 border border-border-subtle text-text-primary"
                        : "bg-amber-brand text-neutral-950 font-semibold"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Suggested follow-up prompt chips */}
                    {isAssistant && msg.suggestedFollowUps && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-border-subtle/50">
                        {msg.suggestedFollowUps.map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(prompt)}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-surface-card border border-border-subtle hover:border-amber-brand text-text-muted hover:text-text-primary transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-amber-brand shrink-0" />
                            <span>{prompt}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-surface-interactive flex items-center justify-center text-text-primary shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-text-muted animate-pulse">
                <Bot className="w-3.5 h-3.5 text-amber-brand" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="pt-2 border-t border-border-subtle">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about careers, skill gaps, or planning..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border-medium text-text-primary placeholder:text-text-muted/60 text-xs focus:outline-none focus:border-amber-brand transition-colors"
              />
              <Button type="submit" variant="primary" size="sm" disabled={!inputText.trim() || isTyping}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
