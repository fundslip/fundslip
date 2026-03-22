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
    <section className="px-5 md:px-8 pb-24 md:pb-32">
      <div className="container-page">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#0f1d36] to-[#0a2f7e] text-white px-6 py-16 md:px-16 md:py-20">

          {/* Background glow */}
          <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-primary/40 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-tertiary/20 rounded-full blur-[120px]" />

          {/* Content */}
          <div className="relative z-10 max-w-xl mx-auto text-center">
            <h2 className="font-headline text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.1] tracking-tight">
              Ready to prove your financial position?
            </h2>
            <p className="mt-5 text-white/40 text-base md:text-lg leading-relaxed max-w-md mx-auto">
              No sign-up. No backend. Connect your wallet, sign, download.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={() => connect({ connector: injected() })}
                className="group inline-flex items-center justify-center gap-2 bg-white text-[#0a1628] px-7 py-3.5 rounded-full text-[15px] font-semibold hover:-translate-y-[1px] hover:shadow-xl active:translate-y-0 transition-all duration-150">
                <Wallet className="w-4 h-4" /> Get Started <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <Link href="/verify"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-150 border border-white/10">
                Verify a Statement
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
