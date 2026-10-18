"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Zap,
  Target,
  Layers,
  BookOpen,
  FolderGit2,
  Sparkles,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  User,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAarohStore } from "@/lib/store";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { cn, getDisciplineLabel } from "@/lib/utils";

// 5 Core Primary Navigation Items
const PRIMARY_NAV = [
  { title: "Home", href: "/dashboard", icon: Target },
  { title: "Explore", href: "/explore", icon: Compass },
  { title: "Roadmap", href: "/roadmap", icon: BookOpen },
  { title: "Projects", href: "/projects", icon: FolderGit2 },
  { title: "Mentor", href: "/mentor", icon: Sparkles },
];

// Secondary / Specialized Tools
const SECONDARY_NAV = [
  { title: "Micro-Trials", href: "/trials", icon: Zap },
  { title: "Skill Evidence", href: "/skills", icon: Layers },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, toggleExamMode } = useAarohStore();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const targetCareer = CAREERS_CATALOG.find((c) => c.slug === profile.targetCareerSlug);

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface-secondary/90 backdrop-blur-md border-b border-border-subtle sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-brand to-amber-hover flex items-center justify-center font-bold text-neutral-950 text-sm font-display shadow-sm">
            आ
          </div>
          <span className="font-display font-extrabold text-base tracking-tight text-text-primary">
            Aaroh
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-1.5 rounded-lg bg-surface-interactive text-text-muted hover:text-text-primary border border-border-subtle"
            aria-label="Toggle profile and secondary menu"
          >
            {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Top Drawer for Secondary Tools & Profile */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 top-13 z-40 bg-black/75 backdrop-blur-sm p-4 animate-fade-in flex flex-col">
          <div className="bg-surface-card rounded-2xl border border-border-medium p-4 space-y-3">
            <div className="p-3 bg-surface-secondary rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Target Career</p>
                <p className="text-sm font-bold text-text-primary">
                  {targetCareer?.title || "Exploring paths"}
                </p>
              </div>
              <Link href="/onboarding" onClick={() => setMobileDrawerOpen(false)}>
                <span className="text-xs text-amber-brand font-medium hover:underline">
                  Edit
                </span>
              </Link>
            </div>

            <div className="space-y-1 pt-1">
              <p className="text-[11px] font-semibold text-text-muted uppercase px-2">
                Secondary Tools
              </p>
              {SECONDARY_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-amber-brand text-neutral-950 font-semibold"
                        : "text-text-muted hover:text-text-primary hover:bg-surface-interactive"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs px-2">
              <span className="text-text-muted">College Exam Mode</span>
              <button
                onClick={toggleExamMode}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors",
                  profile.isExamMode
                    ? "bg-amber-brand text-neutral-950 border-amber-brand"
                    : "bg-surface-interactive text-text-muted border-border-subtle"
                )}
              >
                {profile.isExamMode ? "Active (3h/wk)" : "Inactive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border-subtle bg-surface-secondary shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-brand to-amber-hover flex items-center justify-center font-bold text-neutral-950 text-sm font-display shadow-sm group-hover:scale-105 transition-transform">
              आ
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight text-text-primary block leading-none">
                Aaroh
              </span>
              <span className="text-[10px] tracking-wider uppercase text-text-muted font-medium">
                Career Guide
              </span>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        {/* Student Target Summary */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-surface-card border border-border-subtle/70">
          <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
            <span>Target Path</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-brand" />
          </div>
          <p className="text-xs font-bold text-text-primary truncate" title={targetCareer?.title}>
            {targetCareer?.title || "Exploring Options"}
          </p>
          <p className="text-[11px] text-text-muted truncate mt-0.5">
            {profile.name} • {getDisciplineLabel(profile.discipline).split(" ")[0]}
          </p>
        </div>

        {/* 5 Primary Navigation Links */}
        <nav className="flex-1 px-3 space-y-1">
          <p className="text-[10px] uppercase font-bold text-text-muted/70 tracking-wider px-3 pb-1">
            Menu
          </p>
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                  isActive
                    ? "bg-amber-brand text-neutral-950 font-bold shadow-sm"
                    : "text-text-muted hover:text-text-primary hover:bg-surface-interactive/60"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-neutral-950" : "text-text-muted group-hover:text-amber-brand"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}

          {/* Secondary Tools Section */}
          <div className="pt-4 mt-3 border-t border-border-subtle/60">
            <p className="text-[10px] uppercase font-bold text-text-muted/70 tracking-wider px-3 pb-1">
              Deep Dives
            </p>
            {SECONDARY_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    isActive
                      ? "text-amber-brand font-semibold bg-surface-interactive/70"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-interactive/40"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Exam Mode Throttle (Anti-Burnout) */}
        <div className="p-3 m-3 rounded-xl bg-surface-card border border-border-subtle">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-brand" />
              <span>Exam Mode</span>
            </span>
            <button
              onClick={toggleExamMode}
              className={cn(
                "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                profile.isExamMode ? "bg-amber-brand" : "bg-surface-interactive"
              )}
              aria-label="Toggle exam lighter schedule mode"
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white transition duration-200",
                  profile.isExamMode ? "translate-x-3 bg-neutral-950" : "translate-x-0"
                )}
              />
            </button>
          </div>
          <p className="text-[10px] text-text-muted leading-tight">
            {profile.isExamMode ? "3h/wk light plan active. No guilt." : `${profile.weeklyCapacityHours}h/wk standard capacity.`}
          </p>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-subtle text-[11px] text-text-muted flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-brand" />
            <span>Honest Guide</span>
          </div>
          <Link href="/onboarding" className="hover:text-amber-brand transition-colors text-[11px]">
            Edit Profile
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (5 Primary Items) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-border-subtle px-2 py-1.5 flex items-center justify-around shadow-lg">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors min-w-[56px]",
                isActive
                  ? "text-amber-brand font-bold"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-0.5", isActive ? "text-amber-brand" : "text-text-muted")} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
