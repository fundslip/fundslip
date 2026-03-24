"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-5 md:px-6 pt-20 pb-20">
      <div className="text-center max-w-md">
        {/* Animated 404 with document icon */}
        <div className="relative inline-flex items-center justify-center mb-10">
          {/* Ghost document */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            {/* Document shadow */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 translate-x-1 translate-y-1 rounded-2xl bg-brand-navy/5 w-[120px] h-[152px]"
            />

            {/* Main document */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-[120px] h-[152px] rounded-2xl border border-outline-variant bg-white flex flex-col items-center justify-center gap-3"
            >
              {/* Document lines (faded, representing missing content) */}
              <div className="flex flex-col gap-2 w-full px-6">
                <div className="h-[6px] rounded-full bg-surface w-full" />
                <div className="h-[6px] rounded-full bg-surface w-3/4" />
                <div className="h-[6px] rounded-full bg-surface w-5/6" />
              </div>

              {/* Question mark */}
              <span className="text-[32px] font-headline font-semibold text-brand-navy/20 select-none">
                ?
              </span>

              <div className="flex flex-col gap-2 w-full px-6">
                <div className="h-[6px] rounded-full bg-surface w-5/6" />
                <div className="h-[6px] rounded-full bg-surface w-2/3" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="font-headline text-[56px] md:text-[72px] font-semibold text-brand-black tracking-tight leading-none mb-3">
            404
          </h1>

          <p className="text-on-surface-variant text-[17px] leading-relaxed mb-2">
            This page could not be verified.
          </p>
          <p className="text-on-surface-variant text-[15px] mb-10">
            The page you are looking for does not exist or has been moved.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-7 rounded-xl bg-brand-navy text-white text-[14px] font-medium transition-all duration-200 hover:bg-brand-navy/90 active:scale-[0.98]"
          >
            Go home
          </Link>
          <Link
            href="/generate"
            className="inline-flex items-center justify-center h-11 px-7 rounded-xl border border-outline text-brand-black text-[14px] font-medium transition-all duration-200 hover:bg-surface active:scale-[0.98]"
          >
            Generate a statement
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
