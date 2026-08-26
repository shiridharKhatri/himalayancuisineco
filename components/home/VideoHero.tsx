"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanvasSequence, CanvasSequenceRef } from "./CanvasSequence";

export const VideoHero: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<CanvasSequenceRef>(null);
  const textRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Refs for bottom-left scroll-reactive circular progress
  const progressCircleRef = React.useRef<SVGCircleElement>(null);
  const progressTextRef = React.useRef<HTMLSpanElement>(null);
  const dishLabelRef = React.useRef<HTMLSpanElement>(null);

  const totalFrames = 240;
  const startFrame = 0;
  const endFrame = 239;

  const dishStages = [
    { name: "Jhol Momo", index: "01" },
    { name: "Crispy Momo", index: "02" },
    { name: "Tandoori Grill", index: "03" },
    { name: "Royal Biryani", index: "04" },
    { name: "Himalayan Curry", index: "05" },
  ];

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const frameObj = { index: startFrame };
    const radius = 15;
    const circumference = 2 * Math.PI * radius;

    // GSAP context helps with clean state reversion on component unmount
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.15, // Snappy, responsive scrub without lag
          onUpdate: (self) => {
            const p = self.progress; // 0 to 1
            const offset = circumference - p * circumference;

            if (progressCircleRef.current) {
              progressCircleRef.current.style.strokeDashoffset = `${offset}`;
            }

            if (progressTextRef.current) {
              progressTextRef.current.textContent = `${Math.round(p * 100)}%`;
            }

            // Determine active stage based on scroll progress
            const stageIdx = Math.min(
              dishStages.length - 1,
              Math.floor(p * dishStages.length)
            );
            const currentStage = dishStages[stageIdx];

            if (dishLabelRef.current && dishLabelRef.current.textContent !== currentStage.name) {
              dishLabelRef.current.textContent = currentStage.name;
            }
          },
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

      // 2. Synchronize floating text fades smoothly across the entire scroll journey (no empty gaps)
      const timings = [
        { enterStart: 0.0, enterEnd: 0.0, exitStart: 1.5, exitEnd: 2.0 }, // Jhol Momo
        { enterStart: 1.8, enterEnd: 2.3, exitStart: 3.6, exitEnd: 4.1 }, // Fried Momo
        { enterStart: 3.9, enterEnd: 4.4, exitStart: 5.7, exitEnd: 6.2 }, // Tandoori Chicken
        { enterStart: 6.0, enterEnd: 6.5, exitStart: 7.8, exitEnd: 8.3 }, // Biryani
        { enterStart: 8.1, enterEnd: 8.6, exitStart: 9.9, exitEnd: 10.0 }, // Rogan Josh
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
      badge: "Welcome to Himalayan Cuisine Co.",
      title: "Authentic Himalayan Flavors",
      description: "Handcrafted dumplings served piping hot with signature chili chutney.",
      positionClass:
        "top-36 md:top-48 lg:top-52 left-1/2 -translate-x-1/2 text-center items-center w-full max-w-3xl px-6",
      styleType: "centerHero",
      ctaText: "Explore Full Menu",
      ctaLink: "/menu",
    },
    {
      badge: "Handcrafted Dumplings",
      title: "Golden, Crispy Perfection",
      description: "Paired with bold, spicy dipping sauce for the ultimate crunch.",
      positionClass: "top-36 md:top-48 left-6 md:left-20 text-left items-start max-w-xl",
      styleType: "leftAccent",
      ctaText: "Explore Momos",
      ctaLink: "/menu?search=momo",
    },
    {
      badge: "Clay Oven Classics",
      title: "Flame-Grilled Excellence",
      description: "Marinated in rich Himalayan spices and seared to smoky perfection.",
      positionClass: "bottom-24 md:bottom-32 left-6 md:left-20 text-left items-start max-w-xl",
      styleType: "bottomAccent",
      ctaText: "Explore Tandoori",
      ctaLink: "/menu?search=tandoori",
    },
    {
      badge: "Royal Rice Dishes",
      title: "Aromatic & Rich",
      description: "Long-grain basmati cooked with authentic herbs, saffron, and fried onions.",
      positionClass: "top-36 md:top-48 right-6 md:right-20 text-right items-end max-w-xl",
      styleType: "rightAccent",
      ctaText: "Explore Biryani",
      ctaLink: "/menu?search=biryani",
    },
    {
      badge: "Slow-Cooked Curries",
      title: "Slow-Cooked Goodness",
      description: "Tender meat and fresh paneer infused with deep, savory spice blends.",
      positionClass:
        "top-36 md:top-48 lg:top-52 left-1/2 -translate-x-1/2 text-center items-center w-full max-w-3xl px-6",
      styleType: "centerGrand",
      ctaText: "Explore Curries",
      ctaLink: "/menu?search=curry",
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full h-[420vh] bg-charcoal">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black select-none">
        {/* Covering Canvas Sequence */}
        <CanvasSequence
          ref={canvasRef}
          totalFrames={totalFrames}
        />

        {/* Seamless Full-Viewport Ambient Cinematic Vignette (No local box cutouts) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/35 z-10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.5)_100%)] z-10" />

        {/* Dynamic Floating Text Overlays */}
        {textOverlays.map((slide, index) => (
          <div
            key={index}
            ref={(el) => {
              textRefs.current[index] = el;
            }}
            className={`absolute flex flex-col text-cream-light pointer-events-none select-none z-20 ${slide.positionClass}`}
            style={{ opacity: index === 0 ? 1 : 0 }}
          >
            {/* Subtitle / Category Label (No box) */}
            {slide.badge && (
              <span
                className={`font-sans text-xs md:text-sm font-bold tracking-[0.22em] uppercase mb-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] ${
                  slide.styleType === "bottomAccent"
                    ? "text-amber-400"
                    : slide.styleType === "rightAccent"
                    ? "text-amber-300"
                    : "text-brand-red"
                }`}
              >
                {slide.badge}
              </span>
            )}

            {/* Title & Description (No box cutouts or borders) */}
            <div
              className={`space-y-3 ${
                slide.styleType === "leftAccent" || slide.styleType === "bottomAccent"
                  ? "text-left"
                  : slide.styleType === "rightAccent"
                  ? "text-right"
                  : "text-center"
              }`}
            >
              <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] drop-shadow-[0_8px_30px_rgba(0,0,0,0.85)]">
                {slide.title}
              </h2>

              <p className="font-sans text-sm md:text-lg lg:text-xl text-neutral-200 leading-relaxed font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                {slide.description}
              </p>
            </div>

            {/* Action CTA Button */}
            {slide.ctaText && slide.ctaLink && (
              <div
                className={`mt-6 ${
                  slide.styleType === "rightAccent"
                    ? "flex justify-end"
                    : slide.styleType === "leftAccent" || slide.styleType === "bottomAccent"
                    ? "flex justify-start"
                    : "flex justify-center"
                }`}
              >
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center gap-2 border border-cream-light/35 hover:border-cream-light hover:bg-brand-red px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest bg-black/40 hover:bg-brand-red backdrop-blur-md transition-all text-cream-light pointer-events-auto cursor-pointer shadow-xl hover:shadow-2xl group/btn"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        ))}

        {/* BOTTOM-LEFT SCROLL-REACTIVE CIRCULAR PROGRESS TRACKER */}
        <div
          className="absolute bottom-8 left-6 md:left-12 z-30 flex items-center gap-3.5 px-4 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-2xl select-none group hover:bg-black/80 hover:border-brand-red/50 transition-all duration-300 pointer-events-auto cursor-pointer"
          onClick={() => {
            if (containerRef.current) {
              const currentScroll = window.scrollY;
              const containerTop = containerRef.current.offsetTop;
              const containerHeight = containerRef.current.offsetHeight;
              const step = containerHeight / 5;
              const nextTarget = Math.min(
                containerTop + containerHeight,
                Math.floor((currentScroll - containerTop) / step + 1) * step + containerTop
              );
              window.scrollTo({ top: nextTarget, behavior: "smooth" });
            }
          }}
          title="Scroll or click to advance culinary story"
        >
          {/* Circular Progress SVG */}
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
              {/* Background Track */}
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="2.5"
              />
              {/* Progress Ring */}
              <circle
                ref={progressCircleRef}
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#B51C20"
                strokeWidth="2.5"
                strokeDasharray={`${2 * Math.PI * 15}`}
                strokeDashoffset={`${2 * Math.PI * 15}`}
                strokeLinecap="round"
                style={{
                  transition: "stroke-dashoffset 0.1s linear",
                }}
              />
            </svg>
            {/* Center Percentage */}
            <span
              ref={progressTextRef}
              className="absolute font-mono text-[9px] font-extrabold text-cream-light tracking-tight"
            >
              0%
            </span>
          </div>

          {/* Dish / Story Stage Label */}
          <div className="flex flex-col text-left pr-1.5">
            <span
              ref={dishLabelRef}
              className="font-sans text-xs font-bold text-cream-light tracking-wide uppercase truncate max-w-[140px]"
            >
              Jhol Momo
            </span>
            <span className="font-sans text-[10px] text-neutral-400 font-medium mt-0.5">
              Scroll down to explore story
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

