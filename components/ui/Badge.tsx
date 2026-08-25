import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral" | "soft-red";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "neutral", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-sans tracking-wide uppercase transition-colors";
    
    const variants = {
      primary: "bg-brand-red text-cream-light",
      secondary: "bg-cream-dark text-charcoal border border-neutral-warm",
      success: "bg-accent-green text-cream-light",
      warning: "bg-accent-amber text-charcoal",
      danger: "bg-brand-red-dark text-cream-light",
      neutral: "bg-neutral-warm text-charcoal",
      "soft-red": "bg-brand-red-soft text-brand-red-dark",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
