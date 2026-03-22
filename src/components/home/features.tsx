"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Lock,
  ShieldCheck,
  Fingerprint,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const FEATURES = [
  {
    icon: FileText,
    title: "Mortgage & Rental Ready",
    description: "PDF statements that traditional financial institutions understand. Formatted, clear, professional — no Etherscan screenshots.",
    tags: ["Real Estate", "Taxes", "Visa Applications"],
    accent: "primary" as const,
  },
  {
    icon: Lock,
    title: "Zero-Server Privacy",
    description: "Your data never leaves your browser. All processing happens locally — we never see your balances, transactions, or keys.",
    accent: "dark" as const,
  },
  {
    icon: ShieldCheck,
    title: "Tamper-Proof by Design",
    description: "Each statement is EIP-712 signed by the wallet owner. Modify a single byte and the signature breaks. Mathematical certainty.",
    accent: "tertiary" as const,
    cta: { label: "Try the Verifier", href: "/verify" },
  },
  {
    icon: Fingerprint,
    title: "Instant Verification",
    description: "Verifiers scan a QR code, upload the PDF, or paste a code. Re-fetch from the blockchain. Compare. Verified in seconds — no account needed.",
    accent: "primary" as const,
  },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const isDark = feature.accent === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
      className={`group relative rounded-2xl p-7 md:p-8 transition-all duration-300 hover:-translate-y-1 ${
        isDark
          ? "bg-[#0c1d3a] text-white"
          : "bg-surface-container-lowest shadow-float hover:shadow-elevated"
      } ${index === 0 ? "md:col-span-2" : ""}`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${
        isDark
          ? "bg-white/10"
          : feature.accent === "tertiary"
          ? "bg-tertiary/8"
          : "bg-primary/8"
      }`}>
        <feature.icon className={`w-5 h-5 ${
          isDark ? "text-white/80" : feature.accent === "tertiary" ? "text-tertiary" : "text-primary"
        }`} />
      </div>

      {/* Content */}
      <h3 className={`text-xl font-headline font-bold mb-3 ${isDark ? "text-white" : "text-on-background"}`}>
        {feature.title}
      </h3>
      <p className={`text-sm leading-relaxed ${isDark ? "text-white/60" : "text-on-surface-variant"}`}>
        {feature.description}
      </p>

      {/* Tags */}
      {feature.tags && (
        <div className="mt-6 flex flex-wrap gap-2">
          {feature.tags.map((tag) => (
            <span
              key={tag}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                isDark ? "bg-white/8 text-white/60" : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      {feature.cta && (
        <Link
          href={feature.cta.href}
          className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group/link ${
            feature.accent === "tertiary" ? "text-tertiary" : "text-primary"
          }`}
        >
          {feature.cta.label}
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
        </Link>
      )}
    </motion.div>
  );
}

export function Features() {
  return (
    <section className="py-24 md:py-32 px-5 md:px-8">
      <div className="container-page">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="max-w-2xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.05] border border-primary/10 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Why Fundslip</span>
          </div>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-background tracking-tight leading-tight">
            The bridge between{" "}
            <span className="text-gradient-primary">DeFi and TradFi.</span>
          </h2>
          <p className="mt-4 text-on-surface-variant text-lg leading-relaxed">
            Crypto wealth is real. Traditional institutions just need a language they understand. Fundslip translates.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
