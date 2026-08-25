"use client";

import { useState } from "react";

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const testimonials = [
  {
    id: 1,
    quote: "The Jhol Momo is absolutely legendary. Authentic Himalayan spices, warm hospitality, and beautiful visual aesthetics.",
    author: "Devendra Pandey",
    role: "Glenwood Springs Local",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop",
  },
  {
    id: 2,
    quote: "Glenwood Springs has been waiting for this. The goat curry meat falls off the bone, and the lassi is creamy and perfect.",
    author: "Sarah M.",
    role: "Food Critic & Blogger",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop",
  },
  {
    id: 3,
    quote: "Outstanding service and unmatched taste. Their clay-oven tandoori chicken is seared to smoky perfection. A true culinary gem.",
    author: "Anish Sharma",
    role: "Frequent Guest",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop",
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedQuote, setDisplayedQuote] = useState(testimonials[0].quote);
  const [displayedRole, setDisplayedRole] = useState(testimonials[0].role);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (index === activeIndex || isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      setDisplayedQuote(testimonials[index].quote);
      setDisplayedRole(testimonials[index].role);
      setActiveIndex(index);
      setTimeout(() => setIsAnimating(false), 400);
    }, 200);
  };

  return (
    <div className="flex flex-col items-center gap-10 py-8 select-none">
      {/* Quote Container */}
      <div className="relative px-8">
        <span className="absolute -left-2 -top-6 text-7xl font-serif text-charcoal/[0.06] select-none pointer-events-none">
          "
        </span>

        <p
          className={cn(
            "text-xl md:text-2xl font-light text-charcoal text-center max-w-2xl leading-relaxed transition-all duration-400 ease-out",
            isAnimating ? "opacity-0 blur-sm scale-[0.98]" : "opacity-100 blur-0 scale-100"
          )}
        >
          {displayedQuote}
        </p>

        <span className="absolute -right-2 -bottom-8 text-7xl font-serif text-charcoal/[0.06] select-none pointer-events-none">
          "
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 mt-2">
        {/* Role text */}
        <p
          className={cn(
            "text-[10px] md:text-xs text-muted-gray tracking-[0.25em] uppercase transition-all duration-500 ease-out font-bold",
            isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          )}
        >
          {displayedRole}
        </p>

        <div className="flex items-center justify-center gap-3">
          {testimonials.map((testimonial, index) => {
            const isActive = activeIndex === index;
            const isHovered = hoveredIndex === index && !isActive;
            const showName = isActive || isHovered;

            return (
              <button
                key={testimonial.id}
                onClick={() => handleSelect(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative flex items-center gap-0 rounded-full cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border border-neutral-warm/30",
                  isActive ? "bg-charcoal shadow-lg text-cream-light" : "bg-transparent hover:bg-cream-dark/40 text-charcoal",
                  showName ? "pr-5 pl-2 py-1.5" : "p-1.5"
                )}
              >
                {/* Avatar with smooth ring animation */}
                <div className="relative flex-shrink-0">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className={cn(
                      "w-8 h-8 rounded-full object-cover",
                      "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                      isActive ? "ring-2 ring-brand-red" : "ring-0",
                      !isActive && "hover:scale-105"
                    )}
                  />
                </div>

                <div
                  className={cn(
                    "grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    showName ? "grid-cols-[1fr] opacity-100 ml-2.5" : "grid-cols-[0fr] opacity-0 ml-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <span
                      className={cn(
                        "text-xs font-semibold whitespace-nowrap block uppercase tracking-wider",
                        "transition-colors duration-300",
                        isActive ? "text-cream-light" : "text-charcoal"
                      )}
                    >
                      {testimonial.author}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
