import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padded?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hoverable = false, padded = true, children, ...props }, ref) => {
    const baseStyles = "bg-cream-light border border-neutral-warm rounded-[20px] overflow-hidden transition-all duration-300";
    const hoverStyles = hoverable 
      ? "hover:border-brand-red/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(21,21,21,0.03)]" 
      : "";
    const paddingStyles = padded ? "p-6 md:p-8" : "";
    
    return (
      <div
        ref={ref}
        className={`${baseStyles} ${hoverStyles} ${paddingStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mb-4 flex flex-col space-y-1.5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`font-serif text-xl md:text-2xl font-semibold tracking-tight text-charcoal ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`font-sans text-sm text-muted-gray ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`text-sm text-charcoal leading-relaxed ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mt-6 pt-4 border-t border-neutral-warm/40 flex items-center justify-end ${className}`} {...props}>
    {children}
  </div>
);
