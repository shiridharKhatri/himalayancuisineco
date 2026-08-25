"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanvasSequence, CanvasSequenceRef } from "./CanvasSequence";

export const VideoHero: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<CanvasSequenceRef>(null);
  const textRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const totalFrames = 240;
  const startFrame = 0;   // Start at the very first frame
  const endFrame = 239;  // End at the very last frame (240th frame)

  React.useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

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

      // 2. Synchronize floating text fades relative to the video duration
      const timings = [
        { start: 0, end: 1 },
        { start: 1, end: 3 },
        { start: 3, end: 5 },
        { start: 5, end: 7 },
        { start: 7, end: 9 },
      ];

      textRefs.current.forEach((textEl, index) => {
        if (!textEl) return;
        const { start, end } = timings[index];

        if (index === 0) {
          // First overlay is visible initially
          gsap.set(textEl, { opacity: 1, y: 0, scale: 1 });
          
          // Fades out at index 0 range end
          tl.to(textEl, {
            opacity: 0,
            y: -30,
            scale: 0.95,
            duration: 0.3,
          }, start + 0.7);
        } else {
          // Successive overlays start hidden below the focal point
          gsap.set(textEl, { opacity: 0, y: 30, scale: 1.05 });

          // Fade and translate into view
          tl.to(textEl, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
          }, start - 0.2);

          // Fade and translate out of view
          if (index < textRefs.current.length - 1) {
            tl.to(textEl, {
              opacity: 0,
              y: -30,
              scale: 0.95,
              duration: 0.4,
            }, end - 0.2);
          } else {
            // Final slide fades out at the very end of scroll trigger
            tl.to(textEl, {
              opacity: 0,
              y: -30,
              scale: 0.95,
              duration: 0.4,
            }, end);
          }
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const textOverlays = [
    {
      title: "Authentic Himalayan Flavors",
      description: "Handcrafted dumplings served piping hot with signature chili chutney.",
      positionClass: "top-20 md:top-28 left-1/2 -translate-x-1/2 text-center items-center w-full max-w-3xl",
    },
    {
      title: "Golden, Crispy Perfection",
      description: "Paired with bold, spicy dipping sauce for the ultimate crunch.",
      positionClass: "top-20 md:top-28 left-6 md:left-24 text-left items-start w-full max-w-xl",
    },
    {
      title: "Flame-Grilled Excellence",
      description: "Marinated in rich spices and seared to smoky perfection.",
      positionClass: "bottom-24 md:bottom-32 left-6 md:left-24 text-left items-start w-full max-w-xl",
    },
    {
      title: "Aromatic & Rich",
      description: "Long-grain basmati cooked with authentic herbs and fried onions.",
      positionClass: "top-20 md:top-28 right-6 md:right-24 text-right items-end w-full max-w-xl",
    },
    {
      title: "Slow-Cooked Goodness",
      description: "Tender meat infused with deep, savory spice blends.",
      positionClass: "top-20 md:top-28 left-1/2 -translate-x-1/2 text-center items-center w-full max-w-3xl",
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full h-[1200vh] bg-charcoal">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black select-none">
        
        {/* Covering Canvas Sequence */}
        <CanvasSequence
          ref={canvasRef}
          totalFrames={totalFrames}
        />

        {/* Dynamic Floating Text Overlays positioned for frame-by-frame clear space */}
        {textOverlays.map((slide, index) => (
          <div
            key={index}
            ref={(el) => {
              textRefs.current[index] = el;
            }}
            className={`absolute flex flex-col text-cream-light pointer-events-none select-none px-6 md:px-12 z-20 ${slide.positionClass}`}
            style={{ opacity: index === 0 ? 1 : 0 }}
          >
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              {slide.title}
            </h2>
            <div className="w-16 h-0.5 bg-brand-red mb-4 rounded-full" />
            <p className="font-sans text-sm md:text-lg lg:text-xl text-neutral-300/90 leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
              {slide.description}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
};
