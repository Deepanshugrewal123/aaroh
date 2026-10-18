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
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Flame,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAarohStore } from "@/lib/store";
import { CAREERS_CATALOG } from "@/lib/careers-data";
import { cn, getDisciplineLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: Target },
  { title: "Career Explorer", href: "/explore", icon: Compass },
  { title: "Career Trials", href: "/trials", icon: Zap, badge: "Signature" },
  { title: "Skill Intelligence", href: "/skills", icon: Layers },
  { title: "Adaptive Roadmap", href: "/roadmap", icon: BookOpen },
  { title: "Project Studio", href: "/projects", icon: FolderGit2 },
  { title: "AI Mentor", href: "/mentor", icon: Sparkles },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, toggleExamMode } = useAarohStore();

  const targetCareer = CAREERS_CATALOG.find((c) => c.slug === profile.targetCareerSlug);

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface-secondary border-b border-border-subtle sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-brand to-amber-hover flex items-center justify-center font-bold text-neutral-950 font-display shadow-amber-subtle">
            आ
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight text-text-primary">
            Aaroh
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-surface-interactive text-text-primary border border-border-subtle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 animate-fade-in">
          <div className="bg-surface-card rounded-2xl border border-border-medium p-4 flex flex-col space-y-2">
            <div className="p-3 bg-surface-secondary/70 rounded-xl mb-2">
              <p className="text-xs text-text-muted">Target Career Hypothesis</p>
              <p className="text-sm font-semibold text-text-primary">
                {targetCareer?.title || "Exploring Options"}
              </p>
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-amber-brand text-neutral-950 font-semibold"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-interactive"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge variant={isActive ? "neutral" : "amber"}>{item.badge}</Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border-subtle bg-surface-secondary shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-brand to-amber-hover flex items-center justify-center font-bold text-neutral-950 font-display shadow-amber-subtle group-hover:scale-105 transition-transform">
              आ
            </div>
            <div>
              <span className="font-display font-black text-xl tracking-tight text-text-primary block leading-none">
                Aaroh
              </span>
              <span className="text-[10px] tracking-wider uppercase text-text-muted font-medium">
                Career Intelligence
              </span>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        {/* Current Student Profile Snapshot */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-surface-card border border-border-subtle/80 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
              Student Profile
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-brand animate-pulse" />
          </div>
          <p className="text-sm font-bold text-text-primary truncate">{profile.name}</p>
          <p className="text-xs text-text-muted truncate mb-2">
            {getDisciplineLabel(profile.discipline)}
          </p>

          <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between text-xs">
            <span className="text-text-muted">Target Path:</span>
            <span className="font-medium text-amber-brand truncate max-w-[110px]" title={targetCareer?.title}>
              {targetCareer?.title.split(" ")[0]}...
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-amber-brand text-neutral-950 font-semibold shadow-sm"
                    : "text-text-muted hover:text-text-primary hover:bg-surface-interactive/70"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-neutral-950" : "text-text-muted group-hover:text-amber-brand"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge variant={isActive ? "neutral" : "amber"}>{item.badge}</Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Exam Mode / Capacity Throttle Controller */}
        <div className="p-4 m-3 rounded-xl bg-surface-card border border-border-subtle">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <Calendar className="w-3.5 h-3.5 text-amber-brand" />
              <span>Exam Mode</span>
            </div>
            <button
              onClick={toggleExamMode}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                profile.isExamMode ? "bg-amber-brand" : "bg-surface-interactive"
              )}
              aria-label="Toggle exam lighter schedule mode"
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  profile.isExamMode ? "translate-x-4 bg-neutral-950" : "translate-x-0"
                )}
              />
            </button>
          </div>
          <p className="text-[11px] text-text-muted leading-tight">
            {profile.isExamMode
              ? "Lighter plan active (~3 hrs/wk). No guilt, realistic targets."
              : "Standard capacity active (~" + profile.weeklyCapacityHours + " hrs/wk)."}
          </p>
        </div>

        {/* Footer info & transparent pledge */}
        <div className="p-4 border-t border-border-subtle text-[11px] text-text-muted flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-brand" />
            <span>Non-deterministic AI</span>
          </div>
          <Link href="/onboarding" className="hover:text-amber-brand transition-colors">
            Edit Profile
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
