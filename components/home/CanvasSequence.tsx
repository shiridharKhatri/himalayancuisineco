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
    const imagesRef = React.useRef<(HTMLImageElement | null)[]>(new Array(totalFrames).fill(null));
    const loadedMapRef = React.useRef<boolean[]>(new Array(totalFrames).fill(false));
    const lastDrawnFrameRef = React.useRef<number>(-1);
    const rafIdRef = React.useRef<number | null>(null);
    const targetFrameRef = React.useRef<number>(0);

    const onProgressRef = React.useRef(onProgress);
    const onCompleteRef = React.useRef(onComplete);

    React.useEffect(() => {
      onProgressRef.current = onProgress;
      onCompleteRef.current = onComplete;
    });

    // Find the closest loaded frame to avoid canvas freezes
    const findBestFrame = (targetIndex: number): HTMLImageElement | null => {
      const images = imagesRef.current;
      const loaded = loadedMapRef.current;
      const total = totalFrames;

      if (loaded[targetIndex] && images[targetIndex]) {
        return images[targetIndex];
      }

      // Search outwards for nearest loaded frame
      for (let offset = 1; offset < total; offset++) {
        const left = targetIndex - offset;
        const right = targetIndex + offset;

        if (left >= 0 && loaded[left] && images[left]) {
          return images[left];
        }
        if (right < total && loaded[right] && images[right]) {
          return images[right];
        }
      }

      return null;
    };

    // Draw frame onto the canvas (covers viewport and handles DPR)
    const draw = (index: number, force = false) => {
      targetFrameRef.current = Math.max(0, Math.min(index, totalFrames - 1));

      if (force) {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        performDraw();
        return;
      }

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          performDraw();
        });
      }
    };

    const performDraw = () => {
      const currentTarget = targetFrameRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Ensure canvas has physical dimensions
      if (canvas.width === 0 || canvas.height === 0) {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round((rect.width || window.innerWidth) * dpr);
        canvas.height = Math.round((rect.height || window.innerHeight) * dpr);
      }

      if (currentTarget === lastDrawnFrameRef.current) return;

      const img = findBestFrame(currentTarget);
      if (!img || img.naturalWidth === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      const canvasRatio = canvasWidth / canvasHeight;
      const imgRatio = imgWidth / imgHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      // Object-fit cover algorithm
      if (canvasRatio > imgRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        drawWidth = canvasHeight * imgRatio;
        drawHeight = canvasHeight;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      lastDrawnFrameRef.current = currentTarget;
    };

    // Resize canvas to match container's physical pixel size
    const resizeCanvas = React.useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round((rect.width || window.innerWidth) * dpr);
      canvas.height = Math.round((rect.height || window.innerHeight) * dpr);

      draw(lastDrawnFrameRef.current >= 0 ? lastDrawnFrameRef.current : 0, true);
    }, []);

    // Preload image frames
    React.useEffect(() => {
      let isCancelled = false;
      let loadedCount = 0;

      // Handle window resize
      window.addEventListener("resize", resizeCanvas, { passive: true });
      resizeCanvas();

      // Load Frame 1 immediately with high priority
      const firstImg = new Image();
      firstImg.src = "/frames/frame_001.webp";
      firstImg.onload = () => {
        if (isCancelled) return;
        imagesRef.current[0] = firstImg;
        loadedMapRef.current[0] = true;
        loadedCount++;
        resizeCanvas();
        draw(0, true);
      };

      // Load all remaining frames asynchronously
      for (let i = 2; i <= totalFrames; i++) {
        const img = new Image();
        const formattedNum = String(i).padStart(3, "0");
        img.src = `/frames/frame_${formattedNum}.webp`;
        const idx = i - 1;

        img.onload = () => {
          if (isCancelled) return;
          imagesRef.current[idx] = img;
          loadedMapRef.current[idx] = true;
          loadedCount++;

          if (onProgressRef.current) {
            onProgressRef.current(loadedCount / totalFrames);
          }

          if (loadedCount === totalFrames && onCompleteRef.current) {
            onCompleteRef.current();
          }
        };

        img.onerror = () => {
          if (isCancelled) return;
          loadedCount++;
          if (onProgressRef.current) {
            onProgressRef.current(loadedCount / totalFrames);
          }
        };
      }

      return () => {
        isCancelled = true;
        window.removeEventListener("resize", resizeCanvas);
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
      };
    }, [totalFrames, resizeCanvas]);

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
        }}
      />
    );
  }
);

CanvasSequence.displayName = "CanvasSequence";
