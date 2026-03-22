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
    <section className="px-5 md:px-8 pb-20 md:pb-28">
      <div className="container-page">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#080f1e] via-[#0c1a30] to-[#0a2966] text-white px-6 py-14 md:px-14 md:py-20">

          {/* Background */}
          <div className="absolute inset-0 bg-grid opacity-[0.04]" />
          <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px]" />

          <div className="relative z-10 max-w-xl mx-auto text-center">
            <h2 className="font-headline text-2xl md:text-4xl lg:text-[2.5rem] font-extrabold leading-[1.12] tracking-tight">
              Ready to prove your financial position?
            </h2>
            <p className="mt-4 text-white/35 text-[15px] md:text-base leading-relaxed max-w-md mx-auto">
              No sign-up. No backend. Connect, sign, download.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={() => connect({ connector: injected() })}
                className="group inline-flex items-center justify-center gap-2 bg-white text-[#080f1e] px-6 py-3 rounded-full text-[14px] font-semibold shadow-btn hover:shadow-btn-hover hover:-translate-y-px active:translate-y-0 transition-all duration-150">
                <Wallet className="w-4 h-4" /> Get Started <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <Link href="/verify"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold text-white/45 hover:text-white/80 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-150">
                Verify a Statement
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
