import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "primary" | "amber" | "mint" | "emerald" | "rose" | "blue" | "outline";
}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  const variantStyles = {
    neutral: "bg-surface-interactive text-text-muted border border-border-subtle",
    primary: "bg-brand-primary/10 text-brand-primary border border-brand-primary/30",
    amber: "bg-brand-primary/10 text-brand-primary border border-brand-primary/30",
    mint: "bg-mint-brand/10 text-mint-brand border border-mint-brand/30",
    emerald: "bg-mint-brand/10 text-mint-brand border border-mint-brand/30",
    rose: "bg-rose-500/10 text-rose-brand border border-rose-500/30",
    blue: "bg-brand-primary/10 text-brand-primary border border-brand-primary/30",
    outline: "border border-border-medium text-text-muted",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
