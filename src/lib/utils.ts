import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
