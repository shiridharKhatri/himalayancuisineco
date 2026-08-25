"use client";

import * as React from "react";

export interface CanvasSequenceRef {
  drawFrame: (index: number) => void;
}

interface CanvasSequenceProps {
  totalFrames: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export const CanvasSequence = React.forwardRef<CanvasSequenceRef, CanvasSequenceProps>(
  ({ totalFrames, onProgress, onComplete }, ref) => {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const imagesRef = React.useRef<HTMLImageElement[]>([]);
    const lastFrameIndex = React.useRef<number>(0);
    const onProgressRef = React.useRef(onProgress);
    const onCompleteRef = React.useRef(onComplete);

    React.useEffect(() => {
      onProgressRef.current = onProgress;
      onCompleteRef.current = onComplete;
    });

    const [isLoaded, setIsLoaded] = React.useState(false);

    // Preload image sequence
    React.useEffect(() => {
      let loadedCount = 0;
      const images: HTMLImageElement[] = [];

      const checkCompletion = () => {
        loadedCount++;
        if (onProgressRef.current) {
          onProgressRef.current(loadedCount / totalFrames);
        }
        if (loadedCount === totalFrames) {
          setIsLoaded(true);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
        }
      };

      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const formattedNum = String(i).padStart(3, "0");
        img.src = `/frames/frame_${formattedNum}.webp`;
        img.onload = checkCompletion;
        img.onerror = checkCompletion; // Count failed loads to prevent blocking forever
        images.push(img);
      }

      imagesRef.current = images;
    }, [totalFrames]);

    // Draw frame onto the canvas (covers viewport and handles DPR)
    const draw = (index: number, force = false) => {
      const canvas = canvasRef.current;
      if (!canvas || imagesRef.current.length === 0) return;

      // Skip redraw if frame index has not changed (unless forced on resize)
      if (!force && index === lastFrameIndex.current && canvas.width > 0 && canvas.height > 0) return;

      const img = imagesRef.current[index];
      if (!img || img.naturalWidth === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      const canvasRatio = canvasWidth / canvasHeight;
      const imgRatio = imgWidth / imgHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      // Object-fit cover algorithm
      if (canvasRatio > imgRatio) {
        // Canvas is wider than image
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        offsetX = 0;
        offsetY = canvasHeight - drawHeight;
      } else {
        // Canvas is taller than image
        drawWidth = canvasHeight * imgRatio;
        drawHeight = canvasHeight;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      lastFrameIndex.current = index;
    };

    // Resize canvas to match container's physical pixel size
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Redraw frame immediately to avoid blank screen on resize (force redraw)
      if (imagesRef.current.length > 0) {
        draw(lastFrameIndex.current, true);
      }
    };

    // Handle resizing
    React.useEffect(() => {
      if (!isLoaded) return;

      window.addEventListener("resize", resizeCanvas);
      // Run once layout stabilizes
      resizeCanvas();

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }, [isLoaded]);

    // Initial draw when load completes
    React.useEffect(() => {
      if (isLoaded) {
        resizeCanvas();
      }
    }, [isLoaded]);

    React.useImperativeHandle(ref, () => ({
      drawFrame: (index: number) => {
        draw(index);
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ 
          width: "100%", 
          height: "100%",
          willChange: "transform",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          imageRendering: "-webkit-optimize-contrast" as any
        }}
      />
    );
  }
);

CanvasSequence.displayName = "CanvasSequence";
