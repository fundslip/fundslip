"use client";

import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function CTA() {
  const { connect } = useConnect();

  return (
    <section className="py-24 md:py-32 px-5 md:px-8">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="relative overflow-hidden rounded-3xl bg-[#0c1d3a] px-8 py-16 md:px-16 md:py-20"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tertiary/10 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to prove your{" "}
              <span className="bg-gradient-to-r from-[#6ee7b7] to-[#34d399] bg-clip-text text-transparent">
                financial position
              </span>
              ?
            </h2>

            <p className="mt-5 text-white/50 text-lg max-w-lg mx-auto leading-relaxed">
              Connect your wallet. Generate a statement. Share it with confidence. No sign-up, no backend, completely free.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => connect({ connector: injected() })}
                className="group inline-flex items-center justify-center gap-2.5 bg-white text-[#0c1d3a] px-7 py-3.5 rounded-2xl font-semibold text-base hover:-translate-y-px active:translate-y-0 transition-all duration-200 shadow-lg"
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
              <Link
                href="/verify"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base text-white/70 hover:text-white bg-white/8 hover:bg-white/12 transition-all duration-200"
              >
                Verify a Statement
              </Link>
            </div>

            {/* Bottom stats */}
            <div className="mt-14 pt-8 border-t border-white/8 grid grid-cols-3 gap-6">
              {[
                { value: "100%", label: "Client-Side" },
                { value: "EIP-712", label: "Signed" },
                { value: "$0", label: "Always Free" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-xl md:text-2xl font-headline font-bold text-white tabular-nums">{value}</div>
                  <div className="text-xs text-white/40 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
