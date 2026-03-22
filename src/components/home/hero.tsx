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
    <section className="relative overflow-hidden bg-dot-grid">
      {/* Gradient overlays to soften the dots */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-surface/50 to-white pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(10,47,126,0.06) 0%, transparent 70%)" }} />

      <div className="relative z-10 container-page px-5 md:px-8 pt-28 md:pt-36 pb-12 md:pb-16">
        {/* Text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
          className="text-center max-w-3xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08, ease }}
            className="font-headline text-[clamp(2.25rem,6.5vw,4.75rem)] font-extrabold text-on-background leading-[1.06]">
            Verifiable financial
            <br className="hidden sm:block" />
            <span className="text-gradient-primary"> statements, on-chain.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease }}
            className="mt-5 text-[16px] md:text-[17px] text-on-surface-variant leading-relaxed max-w-lg mx-auto">
            Purpose-built for proving crypto wealth to landlords, lenders, and institutions. EIP-712 signed. Instantly verifiable.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32, ease }}
            className="mt-8 flex flex-col sm:flex-row justify-center gap-2.5">
            {isConnected ? (
              <Link href="/generate"
                className="group inline-flex items-center justify-center gap-2 bg-on-background text-white px-6 py-3 rounded-2xl text-[14px] font-semibold shadow-btn hover:-translate-y-[1px] hover:shadow-btn-hover active:translate-y-0 transition-all duration-150">
                Generate Statement <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <button onClick={() => connect({ connector: injected() })}
                className="group inline-flex items-center justify-center gap-2 bg-on-background text-white px-6 py-3 rounded-2xl text-[14px] font-semibold shadow-btn hover:-translate-y-[1px] hover:shadow-btn-hover active:translate-y-0 transition-all duration-150">
                <Wallet className="w-3.5 h-3.5" /> Get Started <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
            <Link href="/verify"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[14px] font-semibold text-on-surface-variant hover:text-on-background bg-white/60 hover:bg-white/80 border border-black/[0.06] transition-all duration-150">
              Verify a Statement
            </Link>
          </motion.div>
        </motion.div>

        {/* Product preview */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease }}
          className="mt-14 md:mt-20 relative max-w-[860px] mx-auto">
          <div className="absolute -inset-4 md:-inset-6 rounded-[2rem] bg-gradient-to-b from-primary/[0.05] to-transparent blur-2xl pointer-events-none" />

          <div className="relative bg-white rounded-2xl md:rounded-[20px] shadow-hero overflow-hidden border border-black/[0.05]">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-3.5 border-b border-black/[0.04]">
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

            <div className="px-4 md:px-6 py-5 md:py-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-5 md:gap-8">
                <div className="md:col-span-2">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-on-surface-variant font-semibold mb-1.5">Total Net Worth</p>
                  <p className="text-[2.5rem] md:text-[3rem] font-headline font-extrabold text-on-background tabular-nums tracking-tight leading-none">
                    $142,502<span className="text-on-surface-variant/20">.88</span>
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-2 font-mono">Block #19,452,102 · Ethereum</p>
                </div>
                <div className="md:col-span-3 space-y-1.5">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-on-surface-variant font-semibold mb-2">Holdings</p>
                  {[
                    { sym: "ETH", name: "Ethereum", qty: "32.4500", val: "$84,120.00", pct: 59 },
                    { sym: "USDC", name: "USD Coin", qty: "58,382.88", val: "$58,382.88", pct: 41 },
                  ].map((a) => (
                    <div key={a.sym} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#f4f5f8]">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-primary">{a.sym}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[12px] font-semibold text-on-background">{a.name}</span>
                          <span className="text-[12px] font-semibold text-on-background tabular-nums">{a.val}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-on-surface-variant tabular-nums">{a.qty} {a.sym}</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-[3px] bg-black/[0.05] rounded-full overflow-hidden">
                              <div className="h-full bg-primary/30 rounded-full" style={{ width: `${a.pct}%` }} />
                            </div>
                            <span className="text-[9px] text-on-surface-variant tabular-nums">{a.pct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-black/[0.04] flex items-center justify-between text-[10px] text-on-surface-variant">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="font-mono bg-on-background/[0.03] px-1.5 py-0.5 rounded text-[9px]">0x4a7e…2f1b</span>
                  <span>·</span>
                  <span>EIP-712 Signed</span>
                </div>
                <div className="flex items-center gap-1 text-primary font-medium whitespace-nowrap">
                  <span>fundslip.xyz/verify</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
