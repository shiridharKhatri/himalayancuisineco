"use client";
 
import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLenis } from "@studio-freight/react-lenis";
 
export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
 
export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Solid Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/50"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "dialog-title" : undefined}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[24px] bg-cream-light border border-neutral-warm shadow-[0_12px_36px_rgba(21,21,21,0.12)] flex flex-col max-h-[88vh]"
          >
            {/* Header (Pinned) */}
            <div className="flex items-center justify-between border-b border-neutral-warm/40 px-6 py-4 shrink-0 bg-cream-light">
              {title ? (
                <h2 id="dialog-title" className="font-serif text-xl font-semibold text-charcoal">
                  {title}
                </h2>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-gray hover:bg-cream-dark hover:text-charcoal focus-ring transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content (Scrollable with Lenis bypass) */}
            <div
              className="p-6 overflow-y-auto flex-1 overscroll-contain"
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
