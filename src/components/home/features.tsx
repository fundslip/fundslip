"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Lock, ShieldCheck, Zap, ArrowRight, Check } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Features() {
  return (
    <section className="relative">
      {/* Section 1: How it works — numbered steps */}
      <div className="py-24 md:py-32 px-5 md:px-8 bg-white">
        <div className="container-page">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, ease }} className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <h2 className="font-headline text-3xl md:text-[2.75rem] font-extrabold text-on-background tracking-tight leading-[1.1]">
              How it works
            </h2>
          </motion.div>

          {/* 3 steps in a row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: "01",
                icon: FileText,
                title: "Connect & configure",
                desc: "Connect your wallet, choose the statement type and period. We fetch your real balances and transactions directly from the blockchain.",
              },
              {
                step: "02",
                icon: ShieldCheck,
                title: "Sign with your wallet",
                desc: "Your wallet signs an EIP-712 typed data message binding the statement to your address. This is your cryptographic proof of ownership.",
              },
              {
                step: "03",
                icon: Zap,
                title: "Download & share",
                desc: "Get a professional PDF with your verification code embedded. Anyone can verify it — scan the QR, upload the PDF, or paste the code.",
              },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="relative text-center md:text-left">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/8 to-primary/4 mb-5">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                {/* Connector line (desktop only) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-gradient-to-r from-primary/15 to-transparent" />
                )}
                <h3 className="font-headline text-lg font-bold text-on-background mb-2 tracking-tight">{item.title}</h3>
                <p className="text-on-surface-variant text-[14px] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Feature showcase — alternating layout */}
      <div className="py-20 md:py-28 px-5 md:px-8 bg-gradient-to-b from-white via-[#f8f9fc] to-[#f4f5f9]">
        <div className="container-page space-y-6 md:space-y-8">

          {/* Row 1: Generate — big card with mock UI */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-3xl border border-black/[0.05] p-6 md:p-10 shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <div className="flex flex-col justify-center">
              <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-headline text-2xl md:text-[1.75rem] font-bold text-on-background tracking-tight mb-3">
                Professional financial statements
              </h3>
              <p className="text-on-surface-variant text-[15px] leading-relaxed mb-5">
                Clean, formatted PDFs that traditional institutions understand. No more sending Etherscan screenshots or trying to explain block explorers.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Mortgages", "Rental Applications", "Tax Filing", "Visa Proof of Funds"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-on-background/[0.03] text-[11px] font-medium text-on-surface-variant">
                    <Check className="w-3 h-3 text-tertiary" /> {t}
                  </span>
                ))}
              </div>
            </div>
            {/* Mini mock of the PDF */}
            <div className="bg-[#f7f8fa] rounded-2xl p-5 flex flex-col gap-3 border border-black/[0.03]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-primary/10" />
                  <span className="text-[11px] font-bold text-on-background">Fundslip</span>
                </div>
                <span className="text-[8px] uppercase tracking-wider font-bold text-tertiary bg-tertiary/8 px-1.5 py-0.5 rounded-full">Verified</span>
              </div>
              <div className="h-px bg-black/[0.04]" />
              <div>
                <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-semibold">Net Worth</span>
                <p className="text-2xl font-headline font-extrabold text-on-background tabular-nums mt-0.5">$142,502.88</p>
              </div>
              <div className="space-y-1.5">
                {["ETH · $84,120", "USDC · $58,382"].map((l) => (
                  <div key={l} className="flex items-center gap-2 bg-white p-2 rounded-lg">
                    <div className="w-5 h-5 rounded bg-primary/8" />
                    <span className="text-[11px] font-medium text-on-background">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Row 2: Two cards side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Privacy — dark */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.06, ease }}
              className="relative bg-on-background rounded-3xl p-7 md:p-9 overflow-hidden hover:-translate-y-[2px] transition-transform duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-tertiary/10 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                  <Lock className="w-4 h-4 text-white/80" />
                </div>
                <h3 className="font-headline text-xl font-bold text-white mb-3 tracking-tight">Zero-server privacy</h3>
                <p className="text-white/45 text-[14px] leading-relaxed">
                  All processing happens in your browser. Your transaction history, balances, and keys never leave your device. We literally can&apos;t see your data.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["No backend", "No database", "No tracking"].map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-full bg-white/6 text-[10px] font-medium text-white/40 border border-white/6">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Verify */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.12, ease }}
              className="relative bg-white rounded-3xl p-7 md:p-9 border border-black/[0.05] shadow-card hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-tertiary/8 flex items-center justify-center mb-5">
                <ShieldCheck className="w-4 h-4 text-tertiary" />
              </div>
              <h3 className="font-headline text-xl font-bold text-on-background mb-3 tracking-tight">Tamper-proof verification</h3>
              <p className="text-on-surface-variant text-[14px] leading-relaxed">
                Each statement carries an EIP-712 signature. Modify a single byte and the verification fails. Mathematical certainty, not trust.
              </p>
              <Link href="/verify" className="inline-flex items-center gap-1.5 mt-6 text-[13px] font-semibold text-primary group">
                Try the verifier <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
