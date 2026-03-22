"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Lock, ShieldCheck, Zap, ArrowRight, Blocks, Fingerprint } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Features() {
  return (
    <section className="relative py-24 md:py-32 px-5 md:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-white" />
      <div className="absolute inset-0 -z-10 bg-dots opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent -z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent -z-10" />

      <div className="container-page">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, ease }} className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <h2 className="font-headline text-3xl md:text-[2.75rem] font-extrabold text-on-background tracking-tight leading-[1.1]">
            How Fundslip works
          </h2>
          <p className="mt-4 text-on-surface-variant text-base md:text-lg leading-relaxed">
            Three steps. No sign-up. No backend. No data stored anywhere.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4">
          {/* Row 1: Generate (4 cols) + Privacy (2 cols) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4, ease }}
            className="md:col-span-4 bg-white rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover hover:-translate-y-px transition-all duration-300 border border-black/[0.03]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center"><FileText className="w-[18px] h-[18px] text-primary" /></div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold">Step 01</p>
                <h3 className="font-headline text-lg font-bold text-on-background tracking-tight leading-tight">Generate</h3>
              </div>
            </div>
            <p className="text-on-surface-variant text-[14px] leading-relaxed">
              Connect your wallet, choose a period, and get a clean PDF statement that mortgage officers, landlords, and visa officers actually accept. Real balances, real transactions, professional formatting.
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {["Mortgages", "Rental", "Taxes", "Visa", "Proof of Funds"].map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-primary/[0.04] text-[10px] font-medium text-primary/70">{t}</span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.06, ease }}
            className="md:col-span-2 bg-[#0c1a2e] rounded-2xl p-6 md:p-8 overflow-hidden relative hover:-translate-y-px transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]" />
            <div className="relative z-10">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-5"><Lock className="w-[18px] h-[18px] text-white/70" /></div>
              <h3 className="font-headline text-lg font-bold text-white tracking-tight mb-2">Zero-Server Privacy</h3>
              <p className="text-white/40 text-[14px] leading-relaxed">Everything runs in your browser. We never see your data.</p>
            </div>
          </motion.div>

          {/* Row 2: Sign (2 cols) + Verify (4 cols) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.12, ease }}
            className="md:col-span-2 bg-white rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover hover:-translate-y-px transition-all duration-300 border border-black/[0.03]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-tertiary/8 flex items-center justify-center"><Fingerprint className="w-[18px] h-[18px] text-tertiary" /></div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold">Step 02</p>
                <h3 className="font-headline text-lg font-bold text-on-background tracking-tight leading-tight">Sign</h3>
              </div>
            </div>
            <p className="text-on-surface-variant text-[14px] leading-relaxed">EIP-712 typed data signature. Change one byte — the proof breaks.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.18, ease }}
            className="md:col-span-4 bg-white rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover hover:-translate-y-px transition-all duration-300 border border-black/[0.03]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center"><ShieldCheck className="w-[18px] h-[18px] text-primary" /></div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold">Step 03</p>
                <h3 className="font-headline text-lg font-bold text-on-background tracking-tight leading-tight">Verify</h3>
              </div>
            </div>
            <p className="text-on-surface-variant text-[14px] leading-relaxed max-w-lg">
              Anyone can verify. Scan the QR code, upload the PDF, or paste the verification code. We re-fetch from the blockchain, recompute the hash, and verify the signature. Seconds, not days.
            </p>
            <Link href="/verify" className="inline-flex items-center gap-1.5 mt-4 text-[13px] font-semibold text-primary group">
              Try the verifier <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { icon: Blocks, val: "EIP-712", label: "Typed Data Signatures" },
            { icon: Lock, val: "100%", label: "Client-Side Processing" },
            { icon: Zap, val: "0", label: "Servers Required" },
            { icon: ShieldCheck, val: "∞", label: "Free Verifications" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-on-background/[0.03] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-on-surface-variant/50" />
              </div>
              <div>
                <div className="text-xl font-headline font-extrabold text-on-background tabular-nums tracking-tight">{val}</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
