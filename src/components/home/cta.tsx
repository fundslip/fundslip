"use client";

import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { ArrowRight, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Floating orbs that move around — creates life in the CTA
function FloatingOrbs() {
  return (
    <>
      {[
        { x: "15%", y: "20%", size: 6, delay: 0, dur: 7 },
        { x: "80%", y: "30%", size: 4, delay: 1, dur: 9 },
        { x: "60%", y: "70%", size: 5, delay: 2, dur: 8 },
        { x: "25%", y: "75%", size: 3, delay: 0.5, dur: 10 },
        { x: "70%", y: "15%", size: 4, delay: 3, dur: 6 },
        { x: "40%", y: "50%", size: 3, delay: 1.5, dur: 11 },
        { x: "90%", y: "60%", size: 5, delay: 2.5, dur: 7 },
        { x: "10%", y: "45%", size: 4, delay: 0.8, dur: 9 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/[0.08]"
          style={{ left: orb.x, top: orb.y, width: orb.size, height: orb.size }}
          animate={{
            y: [0, -20, 0, 15, 0],
            x: [0, 10, -5, 8, 0],
            opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
          }}
          transition={{
            duration: orb.dur,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

export function CTA() {
  const { connect } = useConnect();

  return (
    <section className="px-5 md:px-8 pb-24 md:pb-32">
      <div className="container-page">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061024] via-[#0a1d3d] to-[#0a2f7e] text-white px-6 py-20 md:px-16 md:py-24">

          {/* Background effects */}
          <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-tertiary/15 rounded-full blur-[120px]" />

          {/* Grid pattern inside CTA */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }} />

          {/* Floating orbs */}
          <FloatingOrbs />

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
                className="group inline-flex items-center justify-center gap-2 bg-white text-[#061024] px-7 py-3.5 rounded-full text-[15px] font-semibold hover:-translate-y-[1px] hover:shadow-[0_4px_24px_rgba(255,255,255,0.2)] active:translate-y-0 transition-all duration-150">
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
