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
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061024] via-[#0a1d3d] to-[#0a2f7e] text-white px-6 py-20 md:px-16 md:py-24">

          {/* Glow effect — moves on hover */}
          <div className="absolute left-0 top-0 h-full w-full translate-y-[1rem] opacity-70 transition-all duration-700 ease-in-out group-hover:translate-y-[-2rem] group-hover:opacity-100">
            <div className="absolute left-1/2 bottom-0 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.35)_10%,_transparent_60%)] sm:h-[512px]" />
            <div className="absolute left-1/2 bottom-0 h-[128px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_rgba(96,165,250,0.2)_10%,_transparent_60%)] sm:h-[256px]" />
          </div>

          {/* Floating particles */}
          {[
            { x: "15%", y: "25%", s: 4, d: 0, dur: 8 },
            { x: "80%", y: "35%", s: 3, d: 1.5, dur: 10 },
            { x: "55%", y: "70%", s: 5, d: 0.5, dur: 7 },
            { x: "30%", y: "80%", s: 3, d: 2, dur: 9 },
            { x: "70%", y: "20%", s: 4, d: 3, dur: 6 },
          ].map((p, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white/[0.06]"
              style={{ left: p.x, top: p.y, width: p.s, height: p.s }}
              animate={{ y: [0, -15, 0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: p.dur, delay: p.d, repeat: Infinity, ease: "easeInOut" }} />
          ))}

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
                className="group/btn inline-flex items-center justify-center gap-2 bg-white text-[#061024] px-7 py-3.5 rounded-full text-[15px] font-semibold hover:-translate-y-[1px] hover:shadow-[0_4px_24px_rgba(255,255,255,0.2)] active:translate-y-0 transition-all duration-150">
                <Wallet className="w-4 h-4" /> Get Started <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
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
