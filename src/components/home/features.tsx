"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, ScanLine } from "lucide-react";

export function Features() {
  return (
    <section className="py-24 md:py-32 px-5 md:px-6">
      <div className="container-page">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4 }} className="mb-14 text-center md:text-left">
          <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-3">The verification gap</p>
          <h2 className="font-headline text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-brand-black tracking-tight leading-tight max-w-md mx-auto md:mx-0">
            Bridging DeFi and TradFi.
          </h2>
        </motion.div>

        <div className="space-y-3">
          {/* Mortgage card */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-outline-variant bg-white p-7 md:p-10">
            <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-4">Mortgage & Rental Ready</p>
            <h3 className="font-headline text-xl font-semibold text-brand-black tracking-tight mb-3">
              Professional statements for real-world needs
            </h3>
            <p className="text-[14px] text-on-surface-variant leading-relaxed max-w-xl">
              Generate clean, institution-ready PDFs that landlords, mortgage officers, and accountants actually understand. Real balances, real transactions — formatted for the traditional world.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Mortgages", "Rental", "Taxes", "Visa", "Proof of Funds"].map((tag) => (
                <span key={tag} className="text-[11px] text-on-surface-variant bg-surface px-3 py-1 rounded-lg">{tag}</span>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Privacy card */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl bg-brand-navy p-7 md:p-10">
              <div>
                {/* Shield icon */}
                <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center mb-5">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-headline text-xl font-semibold text-white tracking-tight mb-3">
                  Your keys never leave your device
                </h3>
                <p className="text-[14px] text-white/50 leading-relaxed">
                  Everything happens in your browser. No backend, no database, no accounts. We never see your private keys.
                </p>
                {/* Inline stat */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-headline font-semibold text-white">0</span>
                    <span className="text-[11px] text-white/30">Servers</span>
                  </div>
                  <div className="w-px h-5 bg-white/10" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-headline font-semibold text-white">100%</span>
                    <span className="text-[11px] text-white/30">Client-side</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Verification card */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-outline-variant bg-white p-7 md:p-10">
              <div className="w-10 h-10 rounded-xl bg-brand-navy/[0.04] flex items-center justify-center mb-5">
                <ScanLine className="w-5 h-5 text-brand-navy" />
              </div>
              <h3 className="font-headline text-xl font-semibold text-brand-black tracking-tight mb-3">
                Anyone can verify instantly
              </h3>
              <p className="text-[14px] text-on-surface-variant leading-relaxed mb-5">
                Scan the QR code, upload the PDF, or paste the statement fingerprint. No account needed.
              </p>
              <Link href="/verify" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-navy hover:underline">
                Try verifier
                <span aria-hidden>→</span>
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 py-10 border-t border-outline-variant/60">
            {[
            { val: "EIP-712", label: "Typed Data Signatures" },
            { val: "100%", label: "Client-Side Processing" },
            { val: "∞", label: "Free Verifications" },
            { val: "OSS", label: "Fully Auditable Codebase" },
            ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-headline font-semibold text-brand-black tabular-nums tracking-tight">{val}</div>
              <div className="text-[11px] text-on-surface-variant mt-1">{label}</div>
            </div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
