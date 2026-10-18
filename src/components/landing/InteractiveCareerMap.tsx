"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Compass, Zap, ArrowRight, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface MapNode {
  id: string;
  category: "interest" | "career" | "skill";
  title: string;
  discipline: string;
  summary: string;
  slug?: string;
  connectedSkills?: string[];
  trialTime?: string;
}

const NODES_DATA: MapNode[] = [
  {
    id: "interest-systems",
    category: "interest",
    title: "How Complex Systems Work",
    discipline: "Engineering",
    summary: "Curiosity about databases, networked services, APIs, and resilient infrastructure.",
  },
  {
    id: "interest-empathy",
    category: "interest",
    title: "Human Behavior & Interaction",
    discipline: "Design & Humanities",
    summary: "Fascinated by how visual affordances, psychology, and layout affect user choices.",
  },
  {
    id: "interest-markets",
    category: "interest",
    title: "Capital, Margins & Strategy",
    discipline: "Commerce",
    summary: "Driven by unit economics, valuation modeling, cash flows, and resource allocation.",
  },
  {
    id: "career-fullstack",
    category: "career",
    title: "Full-Stack Web & Systems Engineer",
    discipline: "Engineering",
    summary: "Architects responsive apps and robust database backends.",
    slug: "full-stack-systems-engineer",
    connectedSkills: ["TypeScript / React", "SQL & Relational Modeling", "Git Collaboration"],
    trialTime: "15 min trial",
  },
  {
    id: "career-ux",
    category: "career",
    title: "Digital Product & UX Designer",
    discipline: "Design",
    summary: "Bridges user friction and software through prototyping and accessibility audits.",
    slug: "product-ux-designer",
    connectedSkills: ["User Research", "UI Prototyping", "Visual Hierarchy"],
    trialTime: "12 min trial",
  },
  {
    id: "career-finance",
    category: "career",
    title: "Financial Analyst & Valuation Associate",
    discipline: "Commerce",
    summary: "Models corporate cash flows, margin sensitivity, and valuation scenarios.",
    slug: "financial-analyst",
    connectedSkills: ["Financial Modeling", "Corporate Accounting", "Quantitative Fluency"],
    trialTime: "15 min trial",
  },
];

export function InteractiveCareerMap() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("career-fullstack");

  const selectedNode = NODES_DATA.find((n) => n.id === selectedNodeId) || NODES_DATA[3];

  return (
    <div className="w-full rounded-2xl bg-surface-card border border-border-subtle p-6 lg:p-8 shadow-card overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border-subtle/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-brand animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-brand">
              Interactive Path Discovery Graph
            </span>
          </div>
          <h3 className="text-lg font-bold text-text-primary mt-1 font-display">
            Explore How Interests Connect to Real Work & Evidence
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted bg-surface-secondary px-3 py-1.5 rounded-lg border border-border-subtle">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-brand shrink-0" />
          <span>Exploratory hypotheses, not deterministic predictions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* Visual Node Graph Selector */}
        <div className="lg:col-span-7 space-y-4">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
            Step 1: Select an interest or career path to trace its relationships
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NODES_DATA.map((node) => {
              const isSelected = node.id === selectedNodeId;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-amber-brand/10 border-amber-brand/60 shadow-amber-subtle translate-x-1"
                      : "bg-surface-secondary/70 border-border-subtle hover:border-border-medium hover:bg-surface-interactive/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={node.category === "interest" ? "neutral" : "amber"}>
                      {node.category === "interest" ? "Starting Spark" : "Career Path"}
                    </Badge>
                    <span className="text-[11px] text-text-muted">{node.discipline}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-text-primary leading-tight font-display">
                    {node.title}
                  </h4>
                  <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {node.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Path Inspector Drawer */}
        <div className="lg:col-span-5 bg-surface-secondary/80 rounded-xl border border-border-subtle p-5 flex flex-col justify-between min-h-[340px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="emerald">Live Inspection</Badge>
              {selectedNode.trialTime && (
                <span className="text-xs text-amber-brand font-medium flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  {selectedNode.trialTime}
                </span>
              )}
            </div>

            <div>
              <h4 className="text-base font-bold text-text-primary font-display">
                {selectedNode.title}
              </h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                {selectedNode.summary}
              </p>
            </div>

            {selectedNode.connectedSkills && (
              <div className="space-y-2 pt-2 border-t border-border-subtle/70">
                <p className="text-xs font-semibold text-text-primary">
                  Demonstrable Skills Required:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.connectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-surface-card border border-border-subtle text-text-primary"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-brand shrink-0" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-surface-card border border-border-subtle/80 space-y-1">
              <p className="text-[11px] font-semibold text-amber-brand uppercase tracking-wider">
                Aaroh Signature Philosophy
              </p>
              <p className="text-xs text-text-muted leading-relaxed">
                Never pick a career blindly based on a salary rumor. Try the actual daily work in a 12-minute micro-trial first.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle/80 flex items-center justify-between gap-3 mt-4">
            <Link
              href={selectedNode.slug ? `/trials?career=${selectedNode.slug}` : "/explore"}
              className="w-full"
            >
              <Button size="sm" className="w-full justify-between">
                <span>{selectedNode.slug ? "Try Micro-Trial First" : "Explore Related Paths"}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
