import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, type = "text", id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const inputStyles = `
      w-full h-11 px-4 rounded-xl border bg-cream-light font-sans text-sm text-charcoal transition-colors
      placeholder:text-muted-gray/60 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-1
      disabled:opacity-50 disabled:bg-cream-dark/50
      ${error ? "border-brand-red" : "border-neutral-warm hover:border-muted-gray"}
      ${className}
    `;

    return (
      <div className="w-full flex flex-col space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={inputStyles}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />
        {error && (
          <p id={errorId} className="font-sans text-xs text-brand-red font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="font-sans text-xs text-muted-gray">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
