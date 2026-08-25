"use client";
 
import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLenis } from "@studio-freight/react-lenis";
 
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: "left" | "right";
  children: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}
 
export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, side = "right", children, footer, noPadding = false }) => {
  const [mounted, setMounted] = React.useState(false);
  const lenis = useLenis();
 
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
 
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
 
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (lenis) lenis.stop();
      window.addEventListener("keydown", handleEscape);
    }
 
    return () => {
      document.body.style.overflow = "unset";
      if (lenis) lenis.start();
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, lenis]);

  if (!mounted) return null;

  const isLeft = side === "left";
  
  const slideVariants = {
    hidden: { x: isLeft ? "-100%" : "100%" },
    visible: { x: 0 },
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/50"
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
            className={`fixed inset-y-0 ${
              isLeft ? "left-0 border-r" : "right-0 border-l"
            } z-10 flex w-full max-w-md flex-col bg-cream-light border-neutral-warm/30 shadow-[0_8px_40px_rgba(21,21,21,0.12)]`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "drawer-title" : undefined}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-warm/20 px-6 py-4">
              {title ? (
                <h2 id="drawer-title" className="font-sans text-2xl font-bold text-charcoal">
                  {title}
                </h2>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="rounded-full p-2 bg-cream-dark hover:bg-neutral-warm/50 text-charcoal transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Close drawer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-y-auto ${noPadding ? "" : "p-6"}`}>{children}</div>

            {/* Pinned Footer */}
            {footer && (
              <div className="shrink-0 border-t border-neutral-warm/20 p-4 sm:p-5 bg-cream-light">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
