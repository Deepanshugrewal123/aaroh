"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Trash2,
  Eye,
  ShieldCheck,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Compass,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAarohStore } from "@/lib/store";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { SKILLS_CATALOG } from "@/lib/skills-data";
import { MentorMessage } from "@/lib/types";
import { getDisciplineLabel } from "@/lib/utils";

const INITIAL_MESSAGES: MentorMessage[] = [
  {
    id: "msg-welcome",
    role: "assistant",
    content: "Hello! I am your Aaroh Career Intelligence Guide. I am here to help you dissect career options, review your practical work, explain skill gaps, and calibrate your schedule. I never promise guaranteed job outcomes or predict your destiny—we test hypotheses together through real evidence.",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    suggestedFollowUps: [
      "Why is my current target career recommended for me?",
      "What is the single most important skill gap I should tackle first?",
      "How does Exam Mode protect my schedule during midterms?",
    ],
  },
];

export default function AIMentorPage() {
  const { profile, roadmap, toggleExamMode } = useAarohStore();

  const [messages, setMessages] = useState<MentorMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);

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

    // Context-grounded response generator
    setTimeout(() => {
      let replyContent = "";
      let followUps: string[] = [];

      const lower = text.toLowerCase();
      if (lower.includes("why") || lower.includes("recommended") || lower.includes("fit")) {
        replyContent = `Your target career hypothesis (${targetCareer.title}) is suggested based on:
1. Academic Alignment: Your background in ${getDisciplineLabel(profile.discipline)}.
2. Work Style Synergy: Your interest in ${profile.selectedWorkStyles.join(" and ")} problem-solving.
3. Identified Unknowns: You still have unassessed skills in core domain areas. This is why we treat it as an exploration hypothesis rather than an absolute prediction. I recommend testing it directly in the Career Trial simulator.`;
        followUps = ["Take me to the micro-trial", "Show me the skill requirements"];
      } else if (lower.includes("skill") || lower.includes("gap") || lower.includes("tackle")) {
        const topReq = targetCareer.skillsRequired.find(
          (r) => !profile.skillEvidence[r.skillId] || profile.skillEvidence[r.skillId].state === "not_assessed"
        ) || targetCareer.skillsRequired[0];
        const skillName = SKILLS_CATALOG[topReq.skillId]?.name || topReq.skillId;

        replyContent = `Looking at your Skill Intelligence matrix for ${targetCareer.title}, your highest-priority gap is **${skillName}** (importance: ${topReq.importance}).
Rather than binge-watching video tutorials, I suggest building a tiny vertical-slice demo or writing an analysis brief that satisfies the practical rubric in Project Studio.`;
        followUps = ["Open Project Studio", "How is skill coverage calculated?"];
      } else if (lower.includes("exam") || lower.includes("midterm") || lower.includes("overwhelmed")) {
        replyContent = `Exam seasons require realistic balance, not guilt trips. 
In Aaroh, you can toggle **Exam Mode** directly from your sidebar or dashboard. This immediately caps your roadmap at ~3 hours/week of light concept maintenance, deferring heavy project milestones without breaking any streaks or sending manipulative push alerts.`;
        followUps = ["Toggle Exam Mode now", "View Adaptive Roadmap"];
      } else {
        replyContent = `Thank you for sharing that. As your guide, my focus is helping you turn that thought into verifiable evidence.
For **${targetCareer.title}**, what is one small artifact (a 1-page writeup, a wireframe, or a 20-line script) you could complete this week to test this interest?`;
        followUps = [
          "Suggest a beginner project brief",
          "What do people in this role do daily?",
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
    }, 600);
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-subtle gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="amber">Context-Aware AI</Badge>
              <span className="text-text-muted">•</span>
              <span className="text-xs text-text-muted">Honest Advice • No Hallucinations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-text-primary tracking-tight">
              AI Career Mentor
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
              Ask questions about career options, skill gaps, schedule adjustments, or project feedback grounded in your verified profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsContextModalOpen(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-subtle hover:border-amber-brand text-text-primary flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-amber-brand" />
              <span>Inspect AI Context</span>
            </button>
            <button
              onClick={handleClearHistory}
              title="Clear conversation history"
              className="p-2 rounded-lg bg-surface-secondary border border-border-subtle hover:text-rose-brand text-text-muted transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Stream Window */}
        <div className="p-4 sm:p-6 rounded-2xl bg-surface-card border border-border-subtle space-y-4 min-h-[460px] flex flex-col justify-between shadow-card">
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-amber-brand/10 border border-amber-brand/30 flex items-center justify-center text-amber-brand shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? "bg-surface-secondary/80 border border-border-subtle text-text-primary"
                        : "bg-amber-brand text-neutral-950 font-medium"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    <div
                      className={`text-[10px] mt-2 pt-1 border-t ${
                        isAssistant
                          ? "border-border-subtle/50 text-text-muted"
                          : "border-neutral-950/20 text-neutral-900"
                      }`}
                    >
                      {msg.timestamp}
                    </div>

                    {/* Suggested follow-ups */}
                    {isAssistant && msg.suggestedFollowUps && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-border-subtle/50">
                        {msg.suggestedFollowUps.map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(prompt)}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-surface-card border border-border-subtle hover:border-amber-brand text-text-muted hover:text-text-primary transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-amber-brand" />
                            <span>{prompt}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-surface-interactive flex items-center justify-center text-text-primary shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-text-muted animate-pulse">
                <Bot className="w-4 h-4 text-amber-brand" />
                <span>Thinking and cross-referencing your profile...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="pt-3 border-t border-border-subtle">
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
                placeholder="Ask about careers, skill verification, or planning..."
                className="flex-1 px-4 py-3 rounded-xl bg-surface-secondary border border-border-medium text-text-primary placeholder:text-text-muted/60 text-xs sm:text-sm focus:outline-none focus:border-amber-brand"
              />
              <Button type="submit" variant="primary" size="md" disabled={!inputText.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Modal: Transparent AI Context Inspector */}
        {isContextModalOpen && (
          <Modal
            isOpen={isContextModalOpen}
            onClose={() => setIsContextModalOpen(false)}
            title="Transparent AI Context Inspector"
            description="Aaroh only feeds confirmed, student-approved profile parameters to the AI assistant. Private credentials and unrelated documents are never sent."
            maxWidth="md"
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle space-y-1">
                <span className="font-semibold text-text-primary">Current Active Student Context:</span>
                <p className="text-text-muted">Student Name: {profile.name}</p>
                <p className="text-text-muted">Academic Stage: {profile.stage}</p>
                <p className="text-text-muted">Discipline: {getDisciplineLabel(profile.discipline)}</p>
                <p className="text-text-muted">Target Career: {targetCareer.title}</p>
                <p className="text-text-muted">Exam Mode: {profile.isExamMode ? "Active (3 hrs/wk)" : "Inactive"}</p>
                <p className="text-text-muted">Weekly Learning Capacity: {profile.weeklyCapacityHours} hrs/wk</p>
                <p className="text-text-muted">Completed Trials: {profile.completedTrialIds.length}</p>
              </div>

              <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-start gap-2 text-text-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-brand shrink-0 mt-0.5" />
                <span>You can edit or delete your profile information anytime from Onboarding or Settings.</span>
              </div>

              <div className="pt-2 text-right">
                <Button variant="outline" size="sm" onClick={() => setIsContextModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
