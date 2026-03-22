"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const FEATURES = [
  {
    number: "01",
    title: "Generate",
    headline: "Professional statements from any Ethereum wallet.",
    description: "Connect your wallet, choose the period, and get a PDF that mortgage officers and landlords actually understand. Real balances, real transactions, real credibility.",
  },
  {
    number: "02",
    title: "Sign",
    headline: "Cryptographically bound to your identity.",
    description: "Every statement is EIP-712 signed by the wallet owner. The signature binds your address to the exact on-chain data at a specific block. Unforgeable.",
  },
  {
    number: "03",
    title: "Verify",
    headline: "Anyone can confirm. No account needed.",
    description: "Scan the QR code, upload the PDF, or paste the verification code. We re-fetch from the blockchain, recompute the hash, and verify the signature. Seconds.",
    cta: { label: "Try verification", href: "/verify" },
  },
];

export function Features() {
  return (
    <section className="py-24 md:py-32 px-5 md:px-8 bg-white">
      <div className="container-page">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="max-w-xl mb-20"
        >
          <h2 className="font-headline text-3xl md:text-[2.5rem] font-extrabold text-on-background tracking-tight leading-[1.15]">
            How it works
          </h2>
          <p className="mt-4 text-on-surface-variant text-lg leading-relaxed">
            Three steps. No sign-up. No backend. No data stored.
          </p>
        </motion.div>

        {/* Feature rows */}
        <div className="space-y-0">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease }}
              className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 py-12 md:py-16 border-t border-outline-variant/10 first:border-t-0"
            >
              {/* Number + title */}
              <div className="md:col-span-3">
                <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-2">
                  <span className="text-xs font-mono text-on-surface-variant/40">{feature.number}</span>
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">{feature.title}</span>
                </div>
              </div>

              {/* Content */}
              <div className="md:col-span-9">
                <h3 className="font-headline text-2xl md:text-[1.75rem] font-bold text-on-background tracking-tight leading-snug">
                  {feature.headline}
                </h3>
                <p className="mt-3 text-on-surface-variant leading-relaxed max-w-2xl">
                  {feature.description}
                </p>
                {feature.cta && (
                  <Link
                    href={feature.cta.href}
                    className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:gap-2.5 transition-all duration-200"
                  >
                    {feature.cta.label}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 pt-12 border-t border-outline-variant/10 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "EIP-712", label: "Typed Data Signatures" },
            { value: "100%", label: "Client-Side Processing" },
            { value: "0", label: "Data Stored on Servers" },
            { value: "∞", label: "Verification Attempts" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl md:text-3xl font-headline font-extrabold text-on-background tabular-nums">{value}</div>
              <div className="text-xs text-on-surface-variant mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
