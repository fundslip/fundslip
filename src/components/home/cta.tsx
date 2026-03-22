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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="relative overflow-hidden rounded-[2rem] bg-on-background text-white px-6 py-16 md:px-16 md:py-24 text-center"
        >
          {/* Background grain + glow */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          }} />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-tertiary/15 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />

          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="font-headline text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold leading-tight tracking-tight">
              Start generating verifiable statements.
            </h2>

            <p className="mt-5 text-white/50 text-base md:text-lg leading-relaxed">
              No sign-up. No backend. Connect, sign, download.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => connect({ connector: injected() })}
                className="group inline-flex items-center justify-center gap-2 bg-white text-on-background px-7 py-3.5 rounded-full text-[15px] font-semibold hover:-translate-y-px active:scale-[0.98] transition-all"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <Link
                href="/verify"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white/60 hover:text-white hover:bg-white/8 transition-all"
              >
                Verify Instead
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
