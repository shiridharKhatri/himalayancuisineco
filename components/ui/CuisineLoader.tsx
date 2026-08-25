"use client";

import * as React from "react";

export type CuisineLoaderVariant = "momo" | "steamer" | "karahi" | "mandala";
export type CuisineLoaderSize = "xs" | "sm" | "md" | "lg" | "fullscreen";

interface CuisineLoaderProps {
  variant?: CuisineLoaderVariant;
  size?: CuisineLoaderSize;
  message?: string;
  submessage?: string;
  className?: string;
}

export function CuisineLoader({
  variant = "momo",
  size = "md",
  message,
  submessage,
  className = ""
}: CuisineLoaderProps) {
  // Dimension mapping
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-10 h-10",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    fullscreen: "w-28 h-28"
  };

  const textClasses = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base font-medium",
    fullscreen: "text-lg font-serif"
  };

  const renderIcon = () => {
    switch (variant) {
      case "steamer":
        return (
          <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
              {/* Animated Steam Plumes */}
              <g className="text-brand-red opacity-80">
                <path
                  d="M40 28 C37 20, 43 14, 40 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="animate-steam-1"
                />
                <path
                  d="M50 24 C47 16, 53 10, 50 2"
                  fill="none"
                  stroke="#D08C3F"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="animate-steam-2"
                />
                <path
                  d="M60 28 C57 20, 63 14, 60 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="animate-steam-3"
                />
              </g>

              {/* Steamer Lid Handle */}
              <ellipse cx="50" cy="32" rx="6" ry="3.5" fill="#151515" />
              {/* Steamer Lid */}
              <path
                d="M20 50 C20 36, 80 36, 80 50 Z"
                fill="#C9252D"
                stroke="#151515"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M28 46 Q50 38 72 46"
                fill="none"
                stroke="#F4D9D8"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />

              {/* Top Tier */}
              <rect
                x="18"
                y="50"
                width="64"
                height="15"
                rx="4"
                fill="#F5F2ED"
                stroke="#151515"
                strokeWidth="3"
              />
              <line x1="22" y1="57" x2="78" y2="57" stroke="#D8D0C5" strokeWidth="2" strokeDasharray="3 3" />

              {/* Bottom Tier Base */}
              <rect
                x="16"
                y="65"
                width="68"
                height="16"
                rx="4"
                fill="#ECE7DF"
                stroke="#151515"
                strokeWidth="3"
              />
              {/* Metal Latches */}
              <rect x="12" y="58" width="6" height="12" rx="2" fill="#D08C3F" stroke="#151515" strokeWidth="2" />
              <rect x="82" y="58" width="6" height="12" rx="2" fill="#D08C3F" stroke="#151515" strokeWidth="2" />
            </svg>
          </div>
        );

      case "karahi":
        return (
          <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
              {/* Rising Aroma Steam */}
              <g className="text-[#D08C3F]">
                <path
                  d="M42 32 C38 22, 44 14, 40 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-steam-1"
                />
                <path
                  d="M58 32 C54 22, 60 14, 56 4"
                  fill="none"
                  stroke="#C9252D"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-steam-2"
                />
              </g>

              {/* Karahi Handles */}
              <path
                d="M16 48 C6 48, 6 62, 16 62"
                fill="none"
                stroke="#D08C3F"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M84 48 C94 48, 94 62, 84 62"
                fill="none"
                stroke="#D08C3F"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Karahi Pot Body */}
              <path
                d="M14 46 C18 78, 82 78, 86 46 Z"
                fill="#151515"
                stroke="#151515"
                strokeWidth="3"
              />

              {/* Saffron Curry Liquid */}
              <ellipse cx="50" cy="48" rx="34" ry="9" fill="#D08C3F" />
              {/* Herb garnish / ghee swirl */}
              <circle cx="46" cy="48" r="4" fill="#4A7C59" opacity="0.8" />
              <circle cx="56" cy="49" r="3" fill="#C9252D" opacity="0.8" />
              <circle cx="50" cy="46" r="2.5" fill="#FBFAF7" opacity="0.9" />
            </svg>
          </div>
        );

      case "mandala":
        return (
          <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full animate-spice-spin overflow-visible">
              {/* Outer Spice Ring */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="#ECE7DF" strokeWidth="3" strokeDasharray="6 6" />

              {/* 8 Star Anise / Cardamom Petals */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <g key={angle} transform={`rotate(${angle} 50 50)`}>
                  {/* Spice Pod */}
                  <ellipse
                    cx="50"
                    cy="20"
                    rx="4"
                    ry="9"
                    fill={i % 2 === 0 ? "#C9252D" : "#D08C3F"}
                    stroke="#151515"
                    strokeWidth="1.5"
                  />
                  <circle cx="50" cy="20" r="1.5" fill="#FBFAF7" />
                </g>
              ))}

              {/* Center Mountain Sun / Spice Core */}
              <circle cx="50" cy="50" r="12" fill="#151515" />
              <circle cx="50" cy="50" r="7" fill="#C9252D" />
            </svg>
          </div>
        );

      case "momo":
      default:
        return (
          <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
              {/* Animated Steam Trails */}
              <g className="text-brand-red">
                <path
                  d="M40 32 C36 22, 42 14, 38 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="animate-steam-1"
                />
                <path
                  d="M50 28 C46 18, 52 10, 48 2"
                  fill="none"
                  stroke="#D08C3F"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="animate-steam-2"
                />
                <path
                  d="M60 32 C56 22, 62 14, 58 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="animate-steam-3"
                />
              </g>

              {/* Steamer Leaf / Plate Base */}
              <ellipse
                cx="50"
                cy="78"
                rx="36"
                ry="9"
                fill="#ECE7DF"
                stroke="#D8D0C5"
                strokeWidth="2"
              />

              {/* Momo Dumpling Body (Pulsing / Breathing) */}
              <g className="animate-momo">
                {/* Dumpling Dough Main Form */}
                <path
                  d="M20 74 C16 54, 34 38, 50 38 C66 38, 84 54, 80 74 C74 81, 26 81, 20 74 Z"
                  fill="#FBFAF7"
                  stroke="#151515"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                {/* Hand-crimped Momo Pleats & Folds */}
                <path
                  d="M50 38 L50 56"
                  stroke="#151515"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M50 38 Q40 46 36 62"
                  fill="none"
                  stroke="#151515"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M50 38 Q60 46 64 62"
                  fill="none"
                  stroke="#151515"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M50 38 Q32 50 26 68"
                  fill="none"
                  stroke="#151515"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M50 38 Q68 50 74 68"
                  fill="none"
                  stroke="#151515"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Top Momo Twist / Topknot Knot */}
                <ellipse
                  cx="50"
                  cy="38"
                  rx="6"
                  ry="3.5"
                  fill="#C9252D"
                  stroke="#151515"
                  strokeWidth="2"
                />
              </g>
            </svg>
          </div>
        );
    }
  };

  if (size === "fullscreen") {
    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FCFBF8]/95 backdrop-blur-sm p-6 ${className}`}
      >
        <div className="flex flex-col items-center justify-center max-w-sm text-center space-y-5 animate-fade-in">
          {renderIcon()}

          <div className="space-y-1.5">
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-charcoal tracking-tight">
              {message || "Steaming fresh Himalayan dishes..."}
            </h3>
            {submessage && (
              <p className="font-sans text-xs sm:text-sm text-muted-gray">
                {submessage}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-center ${className}`}>
      {renderIcon()}
      {message && (
        <span className={`text-charcoal font-medium ${textClasses[size]}`}>
          {message}
        </span>
      )}
      {submessage && (
        <span className="text-xs text-muted-gray">
          {submessage}
        </span>
      )}
    </div>
  );
}
