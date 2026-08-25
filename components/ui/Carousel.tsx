"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: React.ReactNode[];
}

export const Carousel: React.FC<CarouselProps> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const prev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? children.length - 1 : prevIndex - 1));
  };

  const next = () => {
    setCurrentIndex((prevIndex) => (prevIndex === children.length - 1 ? 0 : prevIndex + 1));
  };

  React.useEffect(() => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * currentIndex;
      containerRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  }, [currentIndex, children.length]);

  return (
    <div className="relative w-full overflow-hidden group">
      {/* Scrollable track */}
      <div
        ref={containerRef}
        className="flex w-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children.map((child, idx) => (
          <div
            key={idx}
            className="w-full shrink-0 snap-center snap-always px-4 md:px-6"
          >
            {child}
          </div>
        ))}
      </div>

      {/* Left button */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-cream-light border border-neutral-warm text-charcoal hover:bg-cream-dark transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Right button */}
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-cream-light border border-neutral-warm text-charcoal hover:bg-cream-dark transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide indicator dots */}
      <div className="flex items-center justify-center space-x-2 mt-6">
        {children.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx ? "w-6 bg-brand-red" : "w-2 bg-neutral-warm"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
