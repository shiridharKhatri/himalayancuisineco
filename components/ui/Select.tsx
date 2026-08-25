import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, helperText, options, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const selectStyles = `
      w-full h-11 px-4 rounded-sm border bg-cream-light font-sans text-sm text-charcoal transition-colors
      focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-1
      disabled:opacity-50 disabled:bg-cream-dark/50 cursor-pointer
      ${error ? "border-brand-red" : "border-neutral-warm hover:border-muted-gray"}
      ${className}
    `;

    return (
      <div className="w-full flex flex-col space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={selectStyles}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-cream-light text-charcoal">
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = "Select";
