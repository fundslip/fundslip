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
      {/* Background — warm gradient mesh, not flat */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#eef1f8] via-surface to-white" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] -z-10 opacity-60"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10,47,126,0.06) 0%, transparent 70%)" }} />
      <div className="absolute top-[20%] right-0 w-[500px] h-[500px] -z-10 opacity-40"
        style={{ background: "radial-gradient(circle at 70% 30%, rgba(4,120,87,0.05) 0%, transparent 60%)" }} />

      <div className="container-page px-5 md:px-8 pt-32 md:pt-40 pb-8 md:pb-12">
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
            Purpose-built for proving crypto wealth. Fundslip generates EIP-712 signed financial statements that landlords, lenders, and institutions can verify in seconds.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32, ease }}
            className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
            {isConnected ? (
              <Link href="/generate"
                className="group inline-flex items-center justify-center gap-2 bg-on-background text-white px-6 py-3 rounded-full text-[15px] font-semibold hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 active:shadow-none transition-all duration-150">
                Generate Statement <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <button onClick={() => connect({ connector: injected() })}
                className="group inline-flex items-center justify-center gap-2 bg-on-background text-white px-6 py-3 rounded-full text-[15px] font-semibold hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 active:shadow-none transition-all duration-150">
                <Wallet className="w-4 h-4" /> Get Started <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
            <Link href="/verify"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[15px] font-semibold text-on-surface-variant hover:text-on-background hover:bg-on-background/[0.04] transition-all duration-150">
              Verify a Statement
            </Link>
          </motion.div>
        </motion.div>

        {/* Product preview — the hero moment */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease }}
          className="mt-16 md:mt-20 relative max-w-4xl mx-auto">

          {/* Glow behind the card */}
          <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-transparent rounded-[2rem] blur-2xl" />

          {/* The card — looks like a real product screenshot */}
          <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-hero border border-black/[0.06] overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 md:px-8 py-4 md:py-5 border-b border-black/[0.04] bg-gradient-to-r from-white to-[#fafbfd]">
              <div className="flex items-center gap-3">
                <Image src="/fundslip.svg" alt="" width={20} height={24} style={{ height: "auto" }} />
                <span className="font-headline font-bold text-[14px] text-on-background tracking-tight">Fundslip</span>
                <span className="hidden sm:inline text-[11px] uppercase tracking-[0.1em] text-on-surface-variant/50 font-medium ml-1">Asset Verification Report</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary/8">
                  <ShieldCheck className="w-3 h-3 text-tertiary" />
                  <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Verified</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 md:px-8 py-6 md:py-8">
              {/* Two column on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10">
                {/* Left — the big number */}
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant font-semibold mb-2">Total Net Worth</p>
                  <p className="text-[2.75rem] md:text-5xl font-headline font-extrabold text-on-background tabular-nums tracking-tight leading-none">
                    $142,502<span className="text-on-surface-variant/25">.88</span>
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-2 font-mono">Block #19,452,102 · Ethereum</p>
                </div>

                {/* Right — asset list */}
                <div className="md:col-span-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant font-semibold mb-3">Digital Asset Holdings</p>
                  {[
                    { sym: "ETH", name: "Ethereum", qty: "32.4500", val: "$84,120.00", pct: 59 },
                    { sym: "USDC", name: "USD Coin", qty: "58,382.88", val: "$58,382.88", pct: 41 },
                  ].map((a) => (
                    <div key={a.sym} className="flex items-center gap-3 p-3 rounded-xl bg-[#f7f8fa] group hover:bg-[#f0f2f6] transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-primary">{a.sym}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[13px] font-semibold text-on-background">{a.name}</span>
                          <span className="text-[13px] font-semibold text-on-background tabular-nums">{a.val}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1.5">
                          <span className="text-[11px] text-on-surface-variant tabular-nums">{a.qty} {a.sym}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-black/[0.04] rounded-full overflow-hidden">
                              <div className="h-full bg-primary/30 rounded-full" style={{ width: `${a.pct}%` }} />
                            </div>
                            <span className="text-[10px] text-on-surface-variant tabular-nums">{a.pct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom verification bar */}
              <div className="mt-6 pt-5 border-t border-black/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-[11px] text-on-surface-variant">
                  <span className="font-mono text-[10px] bg-on-background/[0.03] px-2 py-0.5 rounded">0x4a7e…2f1b8c9d</span>
                  <span>·</span>
                  <span>EIP-712 Signed</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-primary font-medium">
                  <span>fundslip.xyz/verify</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
