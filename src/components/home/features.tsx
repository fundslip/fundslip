"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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
            <p className="mt-5 text-[12px] text-on-surface-variant">
              Mortgages, Rental, Taxes, Visa, Proof of Funds
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Navy card — subtle gradient for depth */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl bg-gradient-to-br from-brand-navy via-brand-navy to-[#001f5c] p-7 md:p-10 relative overflow-hidden">
              {/* Subtle radial light */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              <div className="relative">
                <p className="text-xs uppercase tracking-wide text-white/35 mb-4">Zero-Server Privacy</p>
                <h3 className="font-headline text-xl font-semibold text-white tracking-tight mb-3">
                  Your keys never leave your device
                </h3>
                <p className="text-[14px] text-white/50 leading-relaxed">
                  Everything happens in your browser. No backend, no database, no accounts. We never see your private keys.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-outline-variant bg-white p-7 md:p-10">
              <p className="text-xs uppercase tracking-wide text-tertiary mb-4">Tamper-Proof Verification</p>
              <h3 className="font-headline text-xl font-semibold text-brand-black tracking-tight mb-3">
                Anyone can verify instantly
              </h3>
              <p className="text-[14px] text-on-surface-variant leading-relaxed mb-5">
                Scan the QR code, upload the PDF, or paste the statement fingerprint. No account needed.
              </p>
              <Link href="/verify" className="text-[13px] text-brand-black hover:underline">
                Try verifier →
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
            { val: "0", label: "Servers Required" },
            { val: "∞", label: "Free Verifications" },
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
