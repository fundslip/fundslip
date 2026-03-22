"use client";

import Link from "next/link";
import { FileText, Lock, ShieldCheck, Coins, Layers, Wallet, BarChart3, ArrowRight } from "lucide-react";

export function Features() {
  return (
    <section className="py-24 px-6 lg:px-8 bg-gray-100">
      <div className="container-page">
        <div className="mb-14">
          <p className="section-label mb-2">The Verification Gap</p>
          <h2 className="font-headline text-[32px] font-bold text-gray-900">Bridging DeFi and TradFi.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* Card 1 — Mortgage Ready (wide) */}
          <div className="md:col-span-3 bg-white p-8 rounded-xl hover:shadow-sm transition-shadow duration-200">
            <FileText className="w-8 h-8 text-navy mb-5" strokeWidth={1.5} />
            <h3 className="text-xl font-bold font-headline text-gray-900 mb-3">Mortgage &amp; Rental Ready</h3>
            <p className="text-gray-600 text-[15px] leading-relaxed max-w-md mb-8">
              Stop sending screenshots of Etherscan. Fundslip generates clean,
              PDF-ready statements that traditional financial institutions understand and trust.
            </p>
            <div className="flex gap-2">
              {["Real Estate", "Taxes", "Visa Apps"].map(tag => (
                <span key={tag} className="bg-gray-100 px-3 py-1.5 rounded-md text-xs font-medium text-gray-600">{tag}</span>
              ))}
            </div>
          </div>

          {/* Card 2 — Privacy (dark) */}
          <div className="md:col-span-2 bg-navy p-8 rounded-xl text-white flex flex-col justify-between">
            <div>
              <Lock className="w-8 h-8 mb-5 text-white/80" strokeWidth={1.5} />
              <h3 className="text-xl font-bold font-headline mb-3">Zero-Server Privacy</h3>
              <p className="text-white/60 text-[15px] leading-relaxed">
                Your transaction history never leaves your browser. All data
                processing is done locally, ensuring 100% privacy.
              </p>
            </div>
            <div className="mt-8 pt-5 border-t border-white/10">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">Privacy First</span>
            </div>
          </div>

          {/* Card 3 — Tamper-Proof */}
          <div className="md:col-span-2 bg-white p-8 rounded-xl border-l-[3px] border-emerald hover:shadow-sm transition-shadow duration-200 flex flex-col justify-between">
            <div>
              <ShieldCheck className="w-8 h-8 text-emerald mb-5" strokeWidth={1.5} />
              <h3 className="text-xl font-bold font-headline text-gray-900 mb-3">Tamper-Proof Verification</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                Each statement includes a unique cryptographic signature verifiable on-chain.
              </p>
            </div>
            <Link href="/verify" className="mt-6 text-navy font-semibold text-sm flex items-center gap-1.5 group">
              Try the Verifier <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Card 4 — Multi-Asset (wide) */}
          <div className="md:col-span-3 bg-white p-8 rounded-xl flex flex-col md:flex-row gap-8 items-center hover:shadow-sm transition-shadow duration-200">
            <div className="flex-1">
              <h3 className="text-xl font-bold font-headline text-gray-900 mb-3">Multi-Asset Compatibility</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                From ETH and ERC-20 tokens to staked assets. Fundslip aggregates your portfolio into a single balance sheet.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2.5 w-full">
              {[
                { Icon: Coins, label: "ERC-20" },
                { Icon: Layers, label: "L2 Support" },
                { Icon: Wallet, label: "Staking" },
                { Icon: BarChart3, label: "NFT Value" },
              ].map(({ Icon, label }) => (
                <div key={label} className="bg-gray-50 p-3 rounded-lg flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-navy" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
