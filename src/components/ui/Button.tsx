import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "mint";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 font-medium",
      md: "text-sm px-4 py-2.5 gap-2 font-semibold",
      lg: "text-base px-6 py-3 gap-2.5 font-bold",
    };

    const variantStyles = {
      primary:
        "bg-brand-primary text-brand-text font-bold hover:bg-brand-hover focus-visible:outline-brand-primary shadow-sm hover:shadow-brand-glow",
      secondary:
        "bg-surface-interactive text-text-primary hover:bg-border-medium border border-border-subtle",
      outline:
        "border border-border-medium text-text-primary hover:bg-surface-interactive/60 hover:border-brand-primary/40",
      ghost:
        "text-text-muted hover:text-text-primary hover:bg-surface-interactive/50",
      mint:
        "bg-mint-brand text-mint-text font-bold hover:bg-mint-hover focus-visible:outline-mint-brand shadow-sm hover:shadow-mint-glow",
      danger:
        "bg-rose-brand/10 text-rose-brand border border-rose-brand/30 hover:bg-rose-brand/20",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
