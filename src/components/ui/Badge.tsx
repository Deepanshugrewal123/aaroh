import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "amber" | "emerald" | "rose" | "blue" | "outline";
}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  const variantStyles = {
    neutral: "bg-surface-interactive text-text-muted border border-border-subtle",
    amber: "bg-amber-500/10 text-amber-brand border border-amber-500/30",
    emerald: "bg-emerald-500/10 text-emerald-brand border border-emerald-500/30",
    rose: "bg-rose-500/10 text-rose-brand border border-rose-500/30",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    outline: "border border-border-medium text-text-muted",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
