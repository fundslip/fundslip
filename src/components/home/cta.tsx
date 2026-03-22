"use client";

import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { ArrowRight, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function CTA() {
  const { connect } = useConnect();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section className="px-5 md:px-8 pb-24 md:pb-32">
      <div className="container-page">
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061024] via-[#0a1d3d] to-[#0a2f7e] text-white px-6 py-20 md:px-16 md:py-24"
        >
          {/* Mouse-following glow */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(96,165,250,0.08) 40%, transparent 70%)`,
            }}
          />

          {/* Static ambient glow */}
          <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-tertiary/10 rounded-full blur-[100px] pointer-events-none" />

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
