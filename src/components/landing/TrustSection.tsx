"use client";

import React from "react";
import { ShieldCheck, Lock, HardDrive, EyeOff, FileText, CheckCircle2 } from "lucide-react";
import { TiltCard } from "./TiltCard";
import { Badge } from "@/components/ui/Badge";

const TRUST_PILLARS = [
  {
    icon: HardDrive,
    title: "100% Local-First Architecture",
    description:
      "Your career progress, reflections, and milestones are saved directly in your browser's local storage. You own your telemetry without mandatory cloud accounts.",
  },
  {
    icon: Lock,
    title: "AES-256-GCM Encrypted Backups",
    description:
      "Export your complete student snapshot anytime with client-side Web Crypto AES-256-GCM encryption and PBKDF2 key derivation (100,000 iterations).",
  },
  {
    icon: EyeOff,
    title: "Zero Data Monetization",
    description:
      "We never sell student data to predatory recruiters or educational lead-gen networks. We require no resume upload before providing full platform value.",
  },
  {
    icon: FileText,
    title: "Zero Fabricated Salaries",
    description:
      "No inflated ₹50 LPA placement marketing. We present verified Indian salary telemetry with explicit tax breakdowns, deductions, and real take-home pay.",
  },
];

export function TrustSection() {
  return (
    <section id="trust" className="relative py-20 px-4 sm:px-6 max-w-5xl mx-auto z-10">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-secondary border border-border-subtle text-xs font-mono uppercase tracking-wider text-mint-brand">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Student Sovereignty</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black font-display text-text-primary tracking-tight">
          Transparency & Privacy Standards
        </h2>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          How Aaroh protects student integrity, telemetry privacy, and truthful career data:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {TRUST_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <TiltCard
              key={pillar.title}
              maxTilt={4}
              className="bg-surface-card/85 backdrop-blur-md border border-border-subtle hover:border-mint-brand/40 p-6 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-mint-brand/10 text-mint-brand flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-text-primary font-display">
                  {pillar.title}
                </h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {pillar.description}
              </p>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}
