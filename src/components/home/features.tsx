"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Lock, ShieldCheck, Fingerprint, QrCode, Upload, ArrowRight } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Features() {
  return (
    <section className="relative py-24 md:py-32 px-5 md:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8f9fb] to-surface -z-10" />

      <div className="container-page">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, ease }} className="text-center max-w-xl mx-auto mb-16 md:mb-20">
          <h2 className="font-headline text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-on-background tracking-tight leading-[1.12]">
            How it works
          </h2>
          <p className="mt-3 text-on-surface-variant text-[15px] md:text-base leading-relaxed">
            Three steps. No sign-up. No backend. No data stored.
          </p>
        </motion.div>

        <div className="space-y-4">
          {/* Step 1 — Generate (big card, preview fills right) */}
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="group grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl border border-black/[0.05] overflow-hidden hover:shadow-card-hover hover:-translate-y-[1px] transition-all duration-300">
            <div className="p-7 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                  <FileText className="w-[18px] h-[18px] text-primary" />
                </div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-[0.1em]">Step 1</span>
              </div>
              <h3 className="font-headline text-xl md:text-2xl font-bold text-on-background tracking-tight leading-snug">
                Generate a professional financial statement
              </h3>
              <p className="mt-3 text-on-surface-variant text-[14px] leading-relaxed">
                Connect your wallet, choose the period, and get a clean PDF. Real balances, real transactions — formatted for institutions.
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {["Mortgages", "Rental", "Taxes", "Visa"].map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-primary/[0.04] text-[10px] font-semibold text-primary/70">{t}</span>
                ))}
              </div>
            </div>
            {/* Right — statement preview that FILLS the space */}
            <div className="bg-gradient-to-br from-[#f3f5f9] to-[#ebeef4] p-5 md:p-6 flex items-stretch">
              <div className="w-full bg-white rounded-xl shadow-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-headline font-bold text-[13px] tracking-tight">FUNDSLIP</span>
                    <span className="px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary text-[8px] font-bold uppercase tracking-wide">Verified</span>
                  </div>
                  <p className="text-[8px] uppercase tracking-[0.12em] text-on-surface-variant font-semibold mb-1">Total Net Worth</p>
                  <p className="text-3xl font-headline font-extrabold tabular-nums tracking-tight text-on-background">$142,502<span className="text-on-surface-variant/20">.88</span></p>
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between items-center py-2 border-t border-black/[0.04]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#627EEA] flex items-center justify-center"><span className="text-[6px] font-bold text-white">E</span></div>
                      <span className="text-[12px] font-medium">Ethereum</span>
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums">$84,120</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-black/[0.04]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#2775CA] flex items-center justify-center"><span className="text-[6px] font-bold text-white">U</span></div>
                      <span className="text-[12px] font-medium">USD Coin</span>
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums">$58,382</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-between text-[9px] text-on-surface-variant">
                  <span className="font-mono">0x4a7e…2f1b</span>
                  <span className="text-primary font-medium">fundslip.xyz/verify →</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2 & 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 2 — Sign (dark) */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.06, ease }}
              className="group relative bg-on-background rounded-2xl p-7 md:p-9 overflow-hidden hover:-translate-y-[1px] transition-all duration-300">
              <div className="absolute top-[-20%] right-[-10%] w-[250px] h-[250px] bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-5%] w-[200px] h-[200px] bg-tertiary/8 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Fingerprint className="w-[18px] h-[18px] text-white/80" />
                  </div>
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.1em]">Step 2</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-white tracking-tight leading-snug">
                  EIP-712 signed by your wallet
                </h3>
                <p className="mt-3 text-white/40 text-[14px] leading-relaxed">
                  Your wallet signs a structured message binding your identity to the exact on-chain data. Change one byte — the signature breaks.
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <Lock className="w-3 h-3 text-white/25" />
                  <span className="text-[10px] text-white/25">Zero-server · Client-side · Keys never leave your device</span>
                </div>
              </div>
            </motion.div>

            {/* Step 3 — Verify */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.12, ease }}
              className="group bg-white rounded-2xl p-7 md:p-9 border border-black/[0.05] hover:shadow-card-hover hover:-translate-y-[1px] transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-tertiary/8 flex items-center justify-center">
                  <ShieldCheck className="w-[18px] h-[18px] text-tertiary" />
                </div>
                <span className="text-[11px] font-bold text-tertiary uppercase tracking-[0.1em]">Step 3</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-background tracking-tight leading-snug">
                Anyone can verify instantly
              </h3>
              <p className="mt-3 text-on-surface-variant text-[14px] leading-relaxed">
                Scan the QR code, upload the PDF, or paste the verification code. No account needed.
              </p>
              {/* Tags + verifier link on ONE line */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {[
                  { icon: QrCode, label: "QR Scan" },
                  { icon: Upload, label: "Upload PDF" },
                  { icon: Fingerprint, label: "Paste Code" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container-low text-[10px] font-medium text-on-surface-variant">
                    <Icon className="w-3 h-3" /> {label}
                  </div>
                ))}
                <Link href="/verify" className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary group/l ml-auto">
                  Try verifier <ArrowRight className="w-3 h-3 transition-transform group-hover/l:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 py-10 border-y border-black/[0.04]">
          {[
            { val: "EIP-712", label: "Typed Data Signatures" },
            { val: "100%", label: "Client-Side Processing" },
            { val: "0", label: "Servers Required" },
            { val: "∞", label: "Free Verifications" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-headline font-extrabold text-on-background tabular-nums tracking-tight">{val}</div>
              <div className="text-[11px] text-on-surface-variant mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
