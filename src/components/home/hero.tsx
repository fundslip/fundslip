"use client";

import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { ArrowRight, Wallet, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Hero() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  return (
    <section className="relative overflow-hidden">
      {/* Rich background with geometric shapes */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#eaeff8] via-[#f0f3f8] to-white" />
        {/* Large navy gradient orb */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-50"
          style={{ background: "radial-gradient(ellipse at center, rgba(10,47,126,0.08) 0%, transparent 70%)" }} />
        {/* Emerald accent orb */}
        <div className="absolute top-[30%] right-[-100px] w-[400px] h-[400px] opacity-40"
          style={{ background: "radial-gradient(circle, rgba(4,120,87,0.06) 0%, transparent 60%)" }} />
        {/* Geometric grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0a2f7e" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Decorative floating shapes */}
        <div className="absolute top-[15%] left-[8%] w-16 h-16 rounded-2xl border border-primary/10 rotate-12 opacity-30" />
        <div className="absolute top-[25%] right-[12%] w-10 h-10 rounded-xl bg-tertiary/5 -rotate-6" />
        <div className="absolute top-[60%] left-[15%] w-8 h-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-[20%] right-[20%] w-20 h-20 rounded-3xl border border-primary/8 rotate-45 opacity-20" />
      </div>

      <div className="container-page px-5 md:px-8 pt-28 md:pt-36 pb-8 md:pb-12">
        {/* Text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
          className="text-center max-w-3xl mx-auto">

          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08, ease }}
            className="font-headline text-[clamp(2.5rem,7vw,5rem)] font-extrabold text-on-background leading-[1.05] tracking-tight">
            Verifiable financial
            <br />
            <span className="text-gradient-primary">statements, on-chain.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease }}
            className="mt-5 text-[17px] md:text-lg text-on-surface-variant leading-relaxed max-w-xl mx-auto">
            Purpose-built for proving crypto wealth. EIP-712 signed statements that landlords, lenders, and institutions can verify in seconds.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32, ease }}
            className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
            {isConnected ? (
              <Link href="/generate"
                className="group inline-flex items-center justify-center gap-2 bg-on-background text-white px-6 py-3 rounded-full text-[15px] font-semibold hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 transition-all duration-150">
                Generate Statement <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <button onClick={() => connect({ connector: injected() })}
                className="group inline-flex items-center justify-center gap-2 bg-on-background text-white px-6 py-3 rounded-full text-[15px] font-semibold hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 transition-all duration-150">
                <Wallet className="w-4 h-4" /> Get Started <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
            <Link href="/verify"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[15px] font-semibold text-on-surface-variant hover:text-on-background hover:bg-white/60 transition-all duration-150">
              Verify a Statement
            </Link>
          </motion.div>
        </motion.div>

        {/* Product preview card */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease }}
          className="mt-16 md:mt-20 relative max-w-4xl mx-auto">

          <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-b from-primary/[0.05] via-primary/[0.02] to-transparent rounded-[2rem] blur-2xl" />

          <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-hero border border-black/[0.06] overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-black/[0.04] bg-[#fafbfd]">
              <div className="flex items-center gap-2.5">
                <Image src="/fundslip.svg" alt="" width={18} height={22} style={{ height: "auto" }} />
                <span className="font-headline font-bold text-[13px] text-on-background tracking-tight">Fundslip</span>
                <span className="hidden sm:inline text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/40 font-medium">· Asset Verification Report</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary/8">
                <ShieldCheck className="w-3 h-3 text-tertiary" />
                <span className="text-[9px] font-bold text-tertiary uppercase tracking-wider">Verified</span>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 md:px-8 py-5 md:py-7">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-5 md:gap-10">
                {/* Left — balance */}
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant font-semibold mb-2">Total Net Worth</p>
                  <p className="text-[2.5rem] md:text-5xl font-headline font-extrabold text-on-background tabular-nums tracking-tight leading-none">
                    $142,502<span className="text-on-surface-variant/20">.88</span>
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-2 font-mono">Block #19,452,102 · Ethereum</p>
                </div>

                {/* Right — assets */}
                <div className="md:col-span-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant font-semibold mb-3">Holdings</p>
                  {[
                    { sym: "ETH", name: "Ethereum", qty: "32.4500", val: "$84,120.00", pct: 59 },
                    { sym: "USDC", name: "USD Coin", qty: "58,382.88", val: "$58,382.88", pct: 41 },
                  ].map((a) => (
                    <div key={a.sym} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f7f8fa]">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-primary">{a.sym}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[13px] font-semibold text-on-background">{a.name}</span>
                          <span className="text-[13px] font-semibold text-on-background tabular-nums">{a.val}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-on-surface-variant tabular-nums">{a.qty} {a.sym}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1 bg-black/[0.04] rounded-full overflow-hidden">
                              <div className="h-full bg-primary/25 rounded-full" style={{ width: `${a.pct}%` }} />
                            </div>
                            <span className="text-[9px] text-on-surface-variant tabular-nums">{a.pct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom verification bar — ALWAYS one line */}
              <div className="mt-5 pt-4 border-t border-black/[0.04] flex items-center justify-between gap-2 overflow-hidden">
                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant whitespace-nowrap min-w-0">
                  <span className="font-mono bg-on-background/[0.03] px-1.5 py-0.5 rounded truncate">0x4a7e…2f1b</span>
                  <span>·</span>
                  <span className="hidden sm:inline">EIP-712</span>
                  <span className="sm:hidden">Signed</span>
                </div>
                <span className="text-[10px] text-primary font-medium whitespace-nowrap flex items-center gap-1">
                  fundslip.xyz/verify <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
