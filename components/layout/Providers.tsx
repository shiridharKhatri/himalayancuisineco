"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { useUIStore } from "@/stores/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ToastContainer />
    </SessionProvider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-6 right-6 z-[100] flex w-full max-w-sm flex-col space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              bg: "bg-cream-light border-accent-green/30 text-accent-green",
              icon: <CheckCircle className="h-5 w-5 shrink-0 text-accent-green" />,
            },
            error: {
              bg: "bg-brand-red-soft border-brand-red/20 text-brand-red-dark",
              icon: <AlertCircle className="h-5 w-5 shrink-0 text-brand-red" />,
            },
            warning: {
              bg: "bg-cream-light border-accent-amber/30 text-accent-amber",
              icon: <AlertTriangle className="h-5 w-5 shrink-0 text-accent-amber" />,
            },
            info: {
              bg: "bg-cream-light border-neutral-warm text-charcoal",
              icon: <Info className="h-5 w-5 shrink-0 text-muted-gray" />,
            },
          };

          const config = typeConfig[toast.type] || typeConfig.info;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start space-x-3 rounded-sm border p-4 shadow-[0_4px_16px_rgba(21,21,21,0.03)] ${config.bg}`}
              role="alert"
            >
              {config.icon}
              <div className="flex-1 font-sans text-sm font-medium leading-5">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-full p-0.5 hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Close alert"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
