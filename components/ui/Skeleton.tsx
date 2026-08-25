import * as React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", variant = "rectangular", ...props }) => {
  const baseStyles = "animate-pulse bg-neutral-warm/50";
  
  const variants = {
    text: "h-4 w-full rounded-sm",
    rectangular: "rounded-[8px]",
    circular: "rounded-full",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};
