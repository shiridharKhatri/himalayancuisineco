"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanvasSequence, CanvasSequenceRef } from "./CanvasSequence";

export const VideoHero: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<CanvasSequenceRef>(null);
  const textRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const totalFrames = 240;
  const startFrame = 0;
  const endFrame = 239;

  React.useEffect(() => {
    if (!containerRef.current) return;

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
          scrub: 0.3, // Fast, responsive scrub
        },
      });

      // 1. Scrub Canvas Frames sequence across scroll distance
      tl.to(
        frameObj,
        {
          index: endFrame,
          ease: "none",
          duration: 10,
          onUpdate: () => {
            if (canvasRef.current) {
              canvasRef.current.drawFrame(Math.round(frameObj.index));
            }
          },
        },
        0
      );

      // 2. Synchronize floating text fades to only show when the dish bowl has settled in frame
      const timings = [
        { enterStart: 0.0, enterEnd: 0.0, exitStart: 0.2, exitEnd: 0.5 }, // Jhol Momo
        { enterStart: 2.4, enterEnd: 2.7, exitStart: 3.3, exitEnd: 3.6 }, // Fried Momo
        { enterStart: 4.5, enterEnd: 4.8, exitStart: 5.4, exitEnd: 5.7 }, // Tandoori Chicken
        { enterStart: 6.6, enterEnd: 6.9, exitStart: 7.5, exitEnd: 7.8 }, // Biryani
        { enterStart: 8.7, enterEnd: 9.0, exitStart: 9.5, exitEnd: 9.8 }, // Rogan Josh
      ];

      textRefs.current.forEach((textEl, index) => {
        if (!textEl) return;
        const { enterStart, enterEnd, exitStart, exitEnd } = timings[index];

        if (index === 0) {
          gsap.set(textEl, { opacity: 1, y: 0, scale: 1 });
          tl.to(
            textEl,
            {
              opacity: 0,
              y: -24,
              scale: 0.96,
              duration: exitEnd - exitStart,
            },
            exitStart
          );
        } else {
          gsap.set(textEl, { opacity: 0, y: 24, scale: 1.04 });

          tl.to(
            textEl,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: enterEnd - enterStart,
            },
            enterStart
          );

          tl.to(
            textEl,
            {
              opacity: 0,
              y: -24,
              scale: 0.96,
              duration: exitEnd - exitStart,
            },
            exitStart
          );
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const textOverlays = [
    {
      subtitle: "Welcome to Himalayan Cuisine Co.",
      title: "Authentic Himalayan Flavors",
      description: "Handcrafted dumplings served piping hot with signature chili chutney.",
      positionClass:
        "top-32 md:top-44 left-1/2 -translate-x-1/2 text-center items-center w-full max-w-4xl px-8 py-8 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65)_0%,transparent_75%)]",
      hasCTA: true,
    },
    {
      subtitle: "Handcrafted Dumplings",
      title: "Golden, Crispy Perfection",
      description: "Paired with bold, spicy dipping sauce for the ultimate crunch.",
      positionClass:
        "top-32 md:top-44 left-0 text-left items-start pl-6 md:pl-24 pr-16 py-8 bg-gradient-to-r from-black/65 via-black/40 to-transparent max-w-2xl rounded-r-lg",
    },
    {
      subtitle: "Clay Oven Classics",
      title: "Flame-Grilled Excellence",
      description: "Marinated in rich spices and seared to smoky perfection.",
      positionClass:
        "bottom-24 md:bottom-32 left-0 text-left items-start pl-6 md:pl-24 pr-16 py-8 bg-gradient-to-r from-black/65 via-black/40 to-transparent max-w-2xl rounded-r-lg",
    },
    {
      subtitle: "Royal Rice Dishes",
      title: "Aromatic & Rich",
      description: "Long-grain basmati cooked with authentic herbs and fried onions.",
      positionClass:
        "top-32 md:top-44 right-0 text-right items-end pr-6 md:pr-24 pl-16 py-8 bg-gradient-to-l from-black/65 via-black/40 to-transparent max-w-2xl rounded-l-lg",
    },
    {
      subtitle: "Slow-Cooked Curries",
      title: "Slow-Cooked Goodness",
      description: "Tender meat infused with deep, savory spice blends.",
      positionClass:
        "top-32 md:top-44 left-1/2 -translate-x-1/2 text-center items-center w-full max-w-4xl px-8 py-8 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65)_0%,transparent_75%)]",
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full h-[900vh] bg-charcoal">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black select-none">
        {/* Covering Canvas Sequence */}
        <CanvasSequence
          ref={canvasRef}
          totalFrames={totalFrames}
        />

        {/* Dynamic Floating Text Overlays */}
        {textOverlays.map((slide, index) => (
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
