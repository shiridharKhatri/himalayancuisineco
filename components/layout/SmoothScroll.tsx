"use client";

import * as React from "react";
import { ReactLenis, useLenis } from "@studio-freight/react-lenis";
import { usePathname } from "next/navigation";

interface SmoothScrollProps {
  children: React.ReactNode;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  const pathname = usePathname();
  const lenis = useLenis();

  // Reset scroll to top on every route change
  React.useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.15, // Smooth lerp coefficient
        duration: 1.2, // Duration of the scroll animation
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      }}
    >
      {children as any}
    </ReactLenis>
  );
};
