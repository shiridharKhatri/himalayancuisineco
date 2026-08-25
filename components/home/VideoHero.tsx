"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const VideoHero: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const textRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const video = videoRef.current;
    if (!video || !containerRef.current) return;

    // Ensure standard configuration
    video.removeAttribute("controls");
    video.muted = true;
    video.playsInline = true;

    const initTimeline = () => {
      const duration = video.duration || 10;

      // GSAP context helps with clean state reversion on component unmount
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2, // Adds a subtle delay for fluid, high-frame-rate interpolation
          },
        });

        // 1. Scrub video playhead position linearly across scrollable distance
        tl.to(video, {
          currentTime: duration,
          ease: "none",
        }, 0);

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

      return ctx;
    };

    let ctx: gsap.Context | undefined;

    // Initialize once metadata is loaded so duration is accurate
    if (video.readyState >= 1) {
      ctx = initTimeline();
    } else {
      const handleMetadata = () => {
        ctx = initTimeline();
      };
      video.addEventListener("loadedmetadata", handleMetadata);
      return () => {
        video.removeEventListener("loadedmetadata", handleMetadata);
        ctx?.revert();
      };
    }

    return () => {
      ctx?.revert();
    };
  }, []);

  const textOverlays = [
    {
      title: "Authentic Himalayan Flavors",
      description: "Handcrafted dumplings served piping hot with signature chili chutney.",
    },
    {
      title: "Golden, Crispy Perfection",
      description: "Paired with bold, spicy dipping sauce for the ultimate crunch.",
    },
    {
      title: "Flame-Grilled Excellence",
      description: "Marinated in rich spices and seared to smoky perfection.",
    },
    {
      title: "Aromatic & Rich",
      description: "Long-grain basmati cooked with authentic herbs and fried onions.",
    },
    {
      title: "Slow-Cooked Goodness",
      description: "Tender meat infused with deep, savory spice blends.",
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full h-[500vh] bg-charcoal">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black select-none">
        
        {/* Covering Background Video */}
        <video
          ref={videoRef}
          src="/Herosection.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-85"
        />

        {/* Ambient Overlay for Visual Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75 pointer-events-none" />

        {/* Centered Floating Text Overlays */}
        <div className="absolute inset-0 flex items-center justify-center px-6 md:px-12 pointer-events-none">
          <div className="w-full max-w-4xl text-center relative h-32 md:h-48 flex items-center justify-center">
            {textOverlays.map((slide, index) => (
              <div
                key={index}
                ref={(el) => {
                  textRefs.current[index] = el;
                }}
                className="absolute inset-0 flex flex-col items-center justify-center text-cream-light pointer-events-none select-none"
              >
                <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                  {slide.title}
                </h2>
                <div className="w-16 h-0.5 bg-brand-red mb-4 rounded-full" />
                <p className="font-sans text-sm md:text-lg lg:text-xl text-neutral-300/90 max-w-2xl leading-relaxed drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)]">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bouncing Scroll Explorer Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-cream-light/60 font-sans text-[10px] tracking-widest uppercase pointer-events-none animate-pulse">
          <span className="mb-2">Scroll to Explore</span>
          <div className="w-6 h-10 border border-cream-light/30 rounded-full flex justify-center p-1.5">
            <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-bounce" />
          </div>
        </div>

      </div>
    </div>
  );
};
