import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  label?: string;
  helperText?: string;
  variant?: "amber" | "emerald" | "default";
}

export function Progress({
  value,
  label,
  helperText,
  variant = "amber",
  className,
  ...props
}: ProgressProps) {
  const boundedValue = Math.min(100, Math.max(0, value));

  const barColor = {
    amber: "bg-amber-brand",
    emerald: "bg-emerald-brand",
    default: "bg-blue-500",
  }[variant];

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {label && (
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-text-primary">{label}</span>
          <span className="font-semibold text-text-primary">{boundedValue}%</span>
        </div>
      )}
      <div
        className="w-full bg-surface-interactive rounded-full h-2 overflow-hidden border border-border-subtle"
        role="progressbar"
        aria-valuenow={boundedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full transition-all duration-300 rounded-full", barColor)}
          style={{ width: `${boundedValue}%` }}
        />
      </div>
      {helperText && (
        <p className="text-[11px] text-text-muted leading-tight">{helperText}</p>
      )}
    </div>
  );
}
