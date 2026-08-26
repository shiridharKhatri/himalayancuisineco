"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { useUIStore } from "@/stores/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

import { SmoothScroll } from "./SmoothScroll";
import { CartDrawer } from "@/components/ordering/CartDrawer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SmoothScroll>
        {children}
        <ToastContainer />
        <CartDrawer />
      </SmoothScroll>
    </SessionProvider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              bg: "bg-white border-accent-green/30 text-accent-green shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
              icon: <CheckCircle className="h-5 w-5 shrink-0 text-accent-green" />,
            },
            error: {
              bg: "bg-brand-red-soft border-brand-red/20 text-brand-red-dark shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
              icon: <AlertCircle className="h-5 w-5 shrink-0 text-brand-red" />,
            },
            warning: {
              bg: "bg-white border-accent-amber/30 text-accent-amber shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
              icon: <AlertTriangle className="h-5 w-5 shrink-0 text-accent-amber" />,
            },
            info: {
              bg: "bg-white border-neutral-warm text-charcoal shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
              icon: <Info className="h-5 w-5 shrink-0 text-muted-gray" />,
            },
          };

          const config = typeConfig[toast.type] || typeConfig.info;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`pointer-events-auto flex items-start space-x-3 rounded-2xl border p-4 backdrop-blur-md ${config.bg}`}
              role="alert"
            >
              {config.icon}
              <div className="flex-1 font-sans text-sm font-medium leading-5 text-neutral-800">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-full p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
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
