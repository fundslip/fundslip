"use client";

import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { ArrowRight, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Hero() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#fafbfc]">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-[#0a2f7e]/[0.04] rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-[#059669]/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="container-page px-5 md:px-8 py-32 md:py-40 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="max-w-3xl mx-auto"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-on-background/[0.04] mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            <span className="text-[11px] font-semibold text-on-surface-variant tracking-wide uppercase">
              Cryptographically Verifiable
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="font-headline text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold text-on-background leading-[1.05] tracking-tight"
          >
            Financial statements
            <br />
            <span className="text-gradient-primary">from your wallet.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="mt-6 text-lg md:text-xl text-on-surface-variant max-w-lg mx-auto leading-relaxed"
          >
            Generate professional, cryptographically signed statements for landlords, lenders, and institutions.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease }}
            className="mt-10 flex flex-col sm:flex-row justify-center gap-3"
          >
            {isConnected ? (
              <Link
                href="/generate"
                className="group inline-flex items-center justify-center gap-2 bg-on-background text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-on-background/90 active:scale-[0.98] transition-all"
              >
                Generate Statement
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <button
                onClick={() => connect({ connector: injected() })}
                className="group inline-flex items-center justify-center gap-2 bg-on-background text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-on-background/90 active:scale-[0.98] transition-all"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
            <Link
              href="/verify"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-on-surface-variant hover:text-on-background hover:bg-on-background/[0.04] transition-all"
            >
              Verify a Statement
            </Link>
          </motion.div>
        </motion.div>

        {/* Statement preview — below the fold, centered */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease }}
          className="mt-20 md:mt-28 max-w-2xl mx-auto"
        >
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-b from-primary/[0.04] to-transparent rounded-3xl blur-xl" />
            <div className="relative bg-white rounded-2xl shadow-elevated border border-black/[0.04] p-6 md:p-8">
              {/* Card header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-sm font-headline font-bold text-on-background tracking-tight">FUNDSLIP</div>
                  <div className="text-[9px] uppercase tracking-[0.14em] text-on-surface-variant mt-0.5">Asset Verification Report</div>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-[9px] font-bold uppercase tracking-wider">
                  Verified
                </div>
              </div>

              {/* Balance */}
              <div className="mb-6">
                <p className="text-[9px] uppercase tracking-[0.12em] text-on-surface-variant font-semibold mb-1">Total Net Worth</p>
                <p className="text-3xl md:text-4xl font-headline font-extrabold text-on-background tabular-nums tracking-tight">
                  $142,502<span className="text-on-surface-variant/30">.88</span>
                </p>
              </div>

              {/* Assets */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { symbol: "ETH", name: "Ethereum", amount: "32.45", value: "$84,120" },
                  { symbol: "USDC", name: "USD Coin", amount: "58,382", value: "$58,382" },
                ].map((a) => (
                  <div key={a.symbol} className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f7f9]">
                    <div className="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-primary">{a.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-on-background truncate">{a.name}</div>
                      <div className="text-[10px] text-on-surface-variant tabular-nums">{a.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
