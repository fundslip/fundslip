"use client";

import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { ArrowRight, Wallet, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Hero() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background: subtle mesh gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface to-surface-container-low" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tertiary/[0.04] rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #0a2f7e 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="container-page px-5 md:px-8 py-24 md:py-32 lg:py-0 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="max-w-xl"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10 mb-8"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-tertiary" />
              </span>
              <span className="text-xs font-semibold text-primary tracking-wide">
                Cryptographically Verifiable
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
              className="font-headline text-[2.75rem] sm:text-5xl md:text-[3.5rem] lg:text-[3.75rem] font-extrabold text-on-background leading-[1.08] tracking-tight"
            >
              Your wallet.
              <br />
              Your statement.
              <br />
              <span className="text-gradient-primary">Verifiable by anyone.</span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease }}
              className="mt-6 text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-md"
            >
              Generate professional financial statements from your Ethereum wallet — cryptographically signed, instantly verifiable, zero backend.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              {isConnected ? (
                <Link
                  href="/generate"
                  className="group inline-flex items-center justify-center gap-2.5 bg-primary text-on-primary px-7 py-3.5 rounded-2xl font-semibold text-base shadow-glow-primary hover:shadow-lg hover:-translate-y-px active:translate-y-0 transition-all duration-200"
                >
                  Generate Statement
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <button
                  onClick={() => connect({ connector: injected() })}
                  className="group inline-flex items-center justify-center gap-2.5 bg-primary text-on-primary px-7 py-3.5 rounded-2xl font-semibold text-base shadow-glow-primary hover:shadow-lg hover:-translate-y-px active:translate-y-0 transition-all duration-200"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              )}
              <Link
                href="/verify"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-low shadow-float hover:-translate-y-px active:translate-y-0 transition-all duration-200"
              >
                Verify a Statement
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-14 flex flex-wrap gap-6 items-center"
            >
              {[
                { icon: ShieldCheck, label: "EIP-712 Signed" },
                { icon: Zap, label: "Client-Side Only" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-on-surface-variant/60">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span className="text-xs font-medium">Open Source</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Right: Statement Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateY: -5 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/8 via-transparent to-tertiary/6 rounded-3xl blur-2xl" />

              {/* Card */}
              <div className="relative glass rounded-2xl shadow-elevated p-8 border border-white/60">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-lg font-headline font-bold text-on-background tracking-tight">FUNDSLIP</div>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant mt-0.5">Asset Verification Report</div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-tertiary-fixed/20 text-tertiary text-[10px] font-bold uppercase tracking-wider">
                    Verified
                  </div>
                </div>

                {/* Balance */}
                <div className="mb-8">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold mb-1.5">Total Net Worth</p>
                  <p className="text-4xl font-headline font-extrabold text-on-background tabular-nums tracking-tight">
                    $142,502<span className="text-on-surface-variant/40">.88</span>
                  </p>
                </div>

                {/* Assets */}
                <div className="space-y-2.5 mb-8">
                  {[
                    { name: "Ethereum", symbol: "ETH", amount: "32.45", value: "$84,120" },
                    { name: "USD Coin", symbol: "USDC", amount: "58,382.88", value: "$58,382" },
                  ].map((asset) => (
                    <div key={asset.symbol} className="flex justify-between items-center p-3 rounded-xl bg-surface-container-low/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{asset.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-on-background">{asset.name}</div>
                          <div className="text-[10px] text-on-surface-variant">{asset.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold tabular-nums">{asset.amount}</div>
                        <div className="text-[10px] text-on-surface-variant tabular-nums">{asset.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-5 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-tertiary/10 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-tertiary">Signed</div>
                      <div className="text-[8px] text-on-surface-variant font-mono">0x9f82...a12c</div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-on-surface-variant/30" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="4" height="4" rx="0.5" />
                      <rect x="20" y="14" width="1" height="4" rx="0.5" />
                      <rect x="14" y="20" width="4" height="1" rx="0.5" />
                      <rect x="20" y="20" width="1" height="1" rx="0.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
