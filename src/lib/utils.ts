import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes external URLs before rendering them in <a> tags to prevent javascript: or data: XSS attacks.
 * Allows only http: and https: protocols without embedded credentials.
 */
export function sanitizeExternalUrl(rawUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      if (parsed.username || parsed.password) return null;
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

export function formatHours(hours: number): string {
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

export function getDisciplineLabel(discipline: string): string {
  const map: Record<string, string> = {
    engineering: "Engineering & Tech",
    commerce_business: "Commerce & Business",
    arts_design: "Arts, Design & Architecture",
    science_research: "Science & Research",
    healthcare: "Healthcare & Life Sciences",
    law_public_service: "Law & Public Policy",
    media_communication: "Media, Writing & Communication",
    undecided: "Open / Exploring",
  };
  return map[discipline] || discipline;
}

export function getEvidenceStateLabel(state: string): { label: string; color: string; badgeClass: string } {
  switch (state) {
    case "independently_verified":
      return {
        label: "Verified",
        color: "#34D399",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
      };
    case "practically_demonstrated":
      return {
        label: "Demonstrated",
        color: "#10B981",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
      };
    case "student_attested":
      return {
        label: "Attested Project",
        color: "#F59E0B",
        badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
      };
    case "coursework":
      return {
        label: "Coursework",
        color: "#60A5FA",
        badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
      };
    case "self_reported":
      return {
        label: "Self-Reported",
        color: "#A78BFA",
        badgeClass: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
      };
    case "not_assessed":
    default:
      return {
        label: "Unassessed",
        color: "#9CA3AF",
        badgeClass: "bg-neutral-800 text-neutral-400 border border-neutral-700",
      };
  }
}

export function getSubmissionStatusLabel(status: string): { label: string; badgeClass: string } {
  switch (status) {
    case "evaluated":
      return {
        label: "Evaluated Submission",
        badgeClass: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
      };
    case "needs_improvement":
      return {
        label: "Needs Revision",
        badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
      };
    case "evaluation_incomplete":
      return {
        label: "Incomplete Deliverables",
        badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
      };
    case "rejected":
      return {
        label: "Invalid Reference",
        badgeClass: "bg-red-500/10 text-red-400 border border-red-500/30",
      };
    case "submitted":
      return {
        label: "Submitted",
        badgeClass: "bg-surface-secondary text-text-muted border border-border-subtle",
      };
    case "not_started":
    default:
      return {
        label: "Not Started",
        badgeClass: "bg-surface-secondary text-text-muted border border-border-subtle",
      };
  }
}
