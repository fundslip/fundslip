"use client";

import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { ArrowRight, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function CTA() {
  const { connect } = useConnect();

  return (
    <section className="px-5 md:px-8 py-20 md:py-28 bg-[#f4f5f9]">
      <div className="container-page">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071225] via-[#0c1e3d] to-[#0a2f7e] px-6 py-16 md:px-16 md:py-20">

          {/* Background effects */}
          <div className="absolute top-[-40%] right-[-10%] w-[600px] h-[600px] bg-primary/30 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-tertiary/15 rounded-full blur-[130px]" />
          {/* Grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>

          <div className="relative z-10 max-w-xl mx-auto text-center">
            <h2 className="font-headline text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-[1.1] tracking-tight">
              Start generating verifiable statements.
            </h2>
            <p className="mt-5 text-white/35 text-base md:text-lg leading-relaxed max-w-md mx-auto">
              No sign-up required. Connect, sign, download. Always free.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={() => connect({ connector: injected() })}
                className="group inline-flex items-center justify-center gap-2 bg-white text-[#071225] px-7 py-3.5 rounded-full text-[15px] font-semibold hover:-translate-y-[1px] hover:shadow-xl active:translate-y-0 transition-all duration-150">
                <Wallet className="w-4 h-4" /> Get Started <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <Link href="/verify"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white/50 hover:text-white hover:bg-white/[0.06] border border-white/10 transition-all duration-150">
                Verify Instead
              </Link>
            </div>

            {/* Trust stats */}
            <div className="mt-14 grid grid-cols-3 gap-6 pt-8 border-t border-white/8">
              {[
                { val: "100%", sub: "Client-Side" },
                { val: "EIP-712", sub: "Signed" },
                { val: "$0", sub: "Always Free" },
              ].map(({ val, sub }) => (
                <div key={sub} className="text-center">
                  <div className="text-xl md:text-2xl font-headline font-extrabold text-white tabular-nums">{val}</div>
                  <div className="text-[11px] text-white/30 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
