"use client";

import * as React from "react";
import Link from "next/link";
import { useLenis } from "@studio-freight/react-lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanvasSequence, CanvasSequenceRef } from "./CanvasSequence";

export const VideoHero: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<CanvasSequenceRef>(null);
  const textRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const loaderRef = React.useRef<HTMLDivElement>(null);

  const totalFrames = 240;
  const startFrame = 0;   // Start at the very first frame
  const endFrame = 239;  // End at the very last frame (240th frame)

  const lenis = useLenis();
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [showExperience, setShowExperience] = React.useState(false);

  // Lock scroll while preloading
  React.useEffect(() => {
    if (lenis) {
      if (!showExperience) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  }, [lenis, showExperience]);

  React.useEffect(() => {
    // Only bind GSAP ScrollTrigger once all frames are preloaded to memory
    if (!isLoaded || !containerRef.current) return;

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const frameObj = { index: startFrame };

    // GSAP context helps with clean state reversion on component unmount
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5, // Butter-smooth canvas frame transitions
        },
      });

      // 1. Scrub Canvas Frames sequence across scroll distance
      tl.to(
        frameObj,
        {
          index: endFrame,
          ease: "none",
          duration: 10, // Match the timeline scale
          onUpdate: () => {
            if (canvasRef.current) {
              canvasRef.current.drawFrame(Math.round(frameObj.index));
            }
          },
        },
        0
      );

      // 2. Synchronize floating text fades to only show when the dish bowl has settled in frame (2s intervals)
      // Transition periods (1s - 2s, 3s - 4s, 5s - 6s, 7s - 8s) are kept clean and free of text overlays.
      const timings = [
        { enterStart: 0.0, enterEnd: 0.0, exitStart: 0.2, exitEnd: 0.5 }, // Jhol Momo (fades out early on scroll)
        { enterStart: 2.4, enterEnd: 2.7, exitStart: 3.3, exitEnd: 3.6 }, // Fried Momo (settled 2.4s - 3.6s)
        { enterStart: 4.5, enterEnd: 4.8, exitStart: 5.4, exitEnd: 5.7 }, // Tandoori Chicken (settled 4.5s - 5.7s)
        { enterStart: 6.6, enterEnd: 6.9, exitStart: 7.5, exitEnd: 7.8 }, // Biryani (settled 6.6s - 7.8s)
        { enterStart: 8.7, enterEnd: 9.0, exitStart: 9.5, exitEnd: 9.8 }, // Rogan Josh (settled 8.7s - 9.8s)
      ];

      textRefs.current.forEach((textEl, index) => {
        if (!textEl) return;
        const { enterStart, enterEnd, exitStart, exitEnd } = timings[index];

        if (index === 0) {
          // First overlay is visible initially
          gsap.set(textEl, { opacity: 1, y: 0, scale: 1 });
          
          // Fades out before the transition starts
          tl.to(textEl, {
            opacity: 0,
            y: -30,
            scale: 0.95,
            duration: exitEnd - exitStart,
          }, exitStart);
        } else {
          // Successive overlays start hidden below the focal point
          gsap.set(textEl, { opacity: 0, y: 30, scale: 1.05 });

          // Fade and translate into view when the bowl settles in frame
          tl.to(textEl, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: enterEnd - enterStart,
          }, enterStart);

          // Fade and translate out of view before the next transition starts
          tl.to(textEl, {
            opacity: 0,
            y: -30,
            scale: 0.95,
            duration: exitEnd - exitStart,
          }, exitStart);
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [isLoaded]);

  const textOverlays = [
    {
      subtitle: "Welcome to Himalayan Cuisine Co.",
      title: "Authentic Himalayan Flavors",
      description: "Handcrafted dumplings served piping hot with signature chili chutney.",
      positionClass: "top-32 md:top-44 left-1/2 -translate-x-1/2 text-center items-center w-full max-w-4xl px-8 py-8 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65)_0%,transparent_75%)]",
      hasCTA: true,
    },
    {
      subtitle: "Handcrafted Dumplings",
      title: "Golden, Crispy Perfection",
      description: "Paired with bold, spicy dipping sauce for the ultimate crunch.",
      positionClass: "top-32 md:top-44 left-0 text-left items-start pl-6 md:pl-24 pr-16 py-8 bg-gradient-to-r from-black/65 via-black/40 to-transparent max-w-2xl rounded-r-lg",
    },
    {
      subtitle: "Clay Oven Classics",
      title: "Flame-Grilled Excellence",
      description: "Marinated in rich spices and seared to smoky perfection.",
      positionClass: "bottom-24 md:bottom-32 left-0 text-left items-start pl-6 md:pl-24 pr-16 py-8 bg-gradient-to-r from-black/65 via-black/40 to-transparent max-w-2xl rounded-r-lg",
    },
    {
      subtitle: "Royal Rice Dishes",
      title: "Aromatic & Rich",
      description: "Long-grain basmati cooked with authentic herbs and fried onions.",
      positionClass: "top-32 md:top-44 right-0 text-right items-end pr-6 md:pr-24 pl-16 py-8 bg-gradient-to-l from-black/65 via-black/40 to-transparent max-w-2xl rounded-l-lg",
    },
    {
      subtitle: "Slow-Cooked Curries",
      title: "Slow-Cooked Goodness",
      description: "Tender meat infused with deep, savory spice blends.",
      positionClass: "top-32 md:top-44 left-1/2 -translate-x-1/2 text-center items-center w-full max-w-4xl px-8 py-8 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65)_0%,transparent_75%)]",
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full h-[900vh] bg-charcoal">
      
      {/* Premium Cinematic Loader */}
      {!showExperience && (
        <div ref={loaderRef} className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center gap-6 select-none pointer-events-auto">
          <div className="flex flex-col items-center gap-2">
            <h2 className="font-serif text-3xl md:text-5xl uppercase tracking-[0.4em] text-cream-light font-black pl-[0.4em] animate-pulse">
              Himalayan
            </h2>
            <div className="font-serif italic text-sm text-cream-light/40 mt-1 select-none">
              Loading Experience... {Math.round(loadingProgress * 100)}%
            </div>
          </div>
          {/* Subtle thin progress bar */}
          <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden mt-4">
            <div
              className="absolute left-0 top-0 h-full bg-cream-light transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black select-none">
        
        {/* Covering Canvas Sequence */}
        <CanvasSequence
          ref={canvasRef}
          totalFrames={totalFrames}
          onProgress={setLoadingProgress}
          onComplete={() => {
            if (loaderRef.current) {
              gsap.to(loaderRef.current, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => {
                  setIsLoaded(true);
                  setShowExperience(true);
                }
              });
            } else {
              setIsLoaded(true);
              setShowExperience(true);
            }
          }}
        />

        {/* Dynamic Floating Text Overlays positioned for frame-by-frame clear space */}
        {isLoaded && textOverlays.map((slide, index) => (
          <div
            key={index}
            ref={(el) => {
              textRefs.current[index] = el;
            }}
            className={`absolute flex flex-col text-cream-light pointer-events-none select-none px-6 md:px-12 z-20 ${slide.positionClass}`}
            style={{ opacity: index === 0 ? 1 : 0 }}
          >
            {slide.subtitle && (
              <span className="font-sans text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-brand-red mb-3">
                {slide.subtitle}
              </span>
            )}
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              {slide.title}
            </h2>
            {!slide.hasCTA && <div className="w-16 h-0.5 bg-brand-red mb-4 rounded-full" />}
            <p className="font-sans text-sm md:text-lg lg:text-xl text-neutral-300/90 leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
              {slide.description}
            </p>
            {slide.hasCTA && (
              <Link
                href="/menu"
                className="mt-6 inline-flex items-center gap-2 border border-cream-light/35 hover:border-cream-light px-8 py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest bg-black/35 hover:bg-black/60 backdrop-blur-md transition-all text-cream-light pointer-events-auto cursor-pointer"
              >
                Explore Menu
              </Link>
            )}
          </div>
        ))}

      </div>
    </div>
  );
};
