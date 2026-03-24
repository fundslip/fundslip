"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center px-5 md:px-6 pt-20 pb-20">
      <div className="text-center max-w-md">
        {/* Animated error icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="inline-flex items-center justify-center mb-10"
        >
          <div className="relative">
            {/* Outer ring pulse */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.05, 0.15] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-error"
            />

            {/* Icon container */}
            <div className="relative w-20 h-20 rounded-full bg-error/[0.06] border border-error/10 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-error/[0.08] flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-error"
                >
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="font-headline text-[28px] md:text-[32px] font-semibold text-brand-black tracking-tight leading-tight mb-3">
            Something went wrong
          </h1>

          <p className="text-on-surface-variant text-[15px] leading-relaxed mb-10">
            An unexpected error occurred. Your data is safe and nothing was
            submitted. Try again or return to the home page.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={reset}
            className="inline-flex items-center justify-center h-11 px-7 rounded-xl bg-brand-navy text-white text-[14px] font-medium transition-all duration-200 hover:bg-brand-navy/90 active:scale-[0.98] cursor-pointer"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center h-11 px-7 rounded-xl border border-outline text-brand-black text-[14px] font-medium transition-all duration-200 hover:bg-surface active:scale-[0.98]"
          >
            Go home
          </a>
        </motion.div>

        {/* Error digest (subtle, for debugging) */}
        {error.digest && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-[11px] text-on-surface-variant font-mono"
          >
            {error.digest}
          </motion.p>
        )}
      </div>
    </main>
  );
}
