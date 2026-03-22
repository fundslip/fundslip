"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Lock, ShieldCheck, Zap, ArrowRight } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function Features() {
  return (
    <section className="py-24 md:py-32 px-5 md:px-8 bg-white relative">
      {/* Subtle top gradient blend */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-surface to-white -z-0" />

      <div className="container-page relative z-10">
        {/* Section intro */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, ease }} className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="font-headline text-3xl md:text-[2.75rem] font-extrabold text-on-background tracking-tight leading-[1.12]">
            How Fundslip works
          </h2>
          <p className="mt-4 text-on-surface-variant text-base md:text-lg leading-relaxed">
            Three steps. No account. No backend. No data stored.
          </p>
        </motion.div>

        {/* Feature cards — 3 column bento on desktop, stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 — Generate (spans 2 cols) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="md:col-span-2 group relative bg-gradient-to-br from-[#f8f9fc] to-[#f2f4f8] rounded-2xl p-7 md:p-9 border border-black/[0.04] hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-5">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-headline text-xl md:text-2xl font-bold text-on-background mb-3 tracking-tight">
              Generate professional statements
            </h3>
            <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-md">
              Connect your wallet, choose a period, and get a clean PDF that mortgage officers, landlords, and visa officers actually understand. Real balances. Real transactions. Real credibility.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Mortgages", "Rental", "Taxes", "Visa"].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-on-background/[0.03] text-[11px] font-medium text-on-surface-variant">{t}</span>
              ))}
            </div>
          </motion.div>

          {/* Card 2 — Privacy (dark) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06, ease }}
            className="group relative bg-on-background rounded-2xl p-7 md:p-9 hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-300 overflow-hidden">
            {/* Subtle glow inside dark card */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                <Lock className="w-5 h-5 text-white/80" />
              </div>
              <h3 className="font-headline text-xl font-bold text-white mb-3 tracking-tight">
                Zero-server privacy
              </h3>
              <p className="text-white/50 text-[15px] leading-relaxed">
                All processing happens in your browser. We never see your balances, transactions, or private keys. Ever.
              </p>
            </div>
          </motion.div>

          {/* Card 3 — Signed */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12, ease }}
            className="group relative bg-gradient-to-br from-[#f8f9fc] to-[#f2f4f8] rounded-2xl p-7 md:p-9 border border-black/[0.04] hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-tertiary/8 flex items-center justify-center mb-5">
              <ShieldCheck className="w-5 h-5 text-tertiary" />
            </div>
            <h3 className="font-headline text-xl font-bold text-on-background mb-3 tracking-tight">
              Cryptographically signed
            </h3>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              Every statement is EIP-712 signed by the wallet owner. Change a single byte and the signature breaks.
            </p>
            <Link href="/verify" className="inline-flex items-center gap-1.5 mt-5 text-[13px] font-semibold text-primary group/l">
              Try the verifier <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/l:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Card 4 — Verify (spans 2 cols) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18, ease }}
            className="md:col-span-2 group relative bg-gradient-to-br from-[#f8f9fc] to-[#f2f4f8] rounded-2xl p-7 md:p-9 border border-black/[0.04] hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-5">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-headline text-xl md:text-2xl font-bold text-on-background mb-3 tracking-tight">
              Instant verification by anyone
            </h3>
            <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-lg">
              Scan a QR code, upload the PDF, or paste a verification code. The verifier re-fetches from the blockchain and checks the signature. Verified in seconds — no account required.
            </p>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 py-10 border-y border-black/[0.04]">
          {[
            { val: "EIP-712", label: "Typed Data Signatures" },
            { val: "100%", label: "Client-Side" },
            { val: "0", label: "Servers Required" },
            { val: "∞", label: "Free Verifications" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-headline font-extrabold text-on-background tabular-nums tracking-tight">{val}</div>
              <div className="text-[12px] text-on-surface-variant mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
