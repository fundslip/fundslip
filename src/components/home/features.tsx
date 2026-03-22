"use client";

import Link from "next/link";
import {
  FileText,
  Lock,
  ShieldCheck,
  Coins,
  Layers,
  Wallet,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export function Features() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface-container-low">
      <div className="container-page">
        <div className="mb-16">
          <div className="editorial-header text-primary mb-2">
            The Verification Gap
          </div>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight">
            Bridging DeFi and TradFi.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 — Mortgage & Rental Ready */}
          <div className="md:col-span-2 bg-surface-container-lowest p-10 rounded-xl relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-150">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <FileText className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-2xl font-bold font-headline mb-4">
                  Mortgage &amp; Rental Ready
                </h3>
                <p className="text-on-surface-variant text-lg leading-relaxed max-w-lg">
                  Stop sending screenshots of Etherscan. Fundslip generates
                  clean, PDF-ready statements that traditional financial
                  institutions understand and trust.
                </p>
              </div>
              <div className="mt-12 flex gap-4">
                <div className="bg-surface-container px-4 py-2 rounded-lg text-xs font-semibold">
                  Real Estate
                </div>
                <div className="bg-surface-container px-4 py-2 rounded-lg text-xs font-semibold">
                  Taxes
                </div>
                <div className="bg-surface-container px-4 py-2 rounded-lg text-xs font-semibold">
                  Visa Apps
                </div>
              </div>
            </div>
          </div>

          {/* Feature Card 2 — Zero-Server Privacy (Dark Navy) */}
          <div className="bg-primary p-10 rounded-xl text-on-primary flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-150">
            <div>
              <Lock className="w-10 h-10 mb-6" />
              <h3 className="text-2xl font-bold font-headline mb-4">
                Zero-Server Privacy
              </h3>
              <p className="text-on-primary-container leading-relaxed">
                Your transaction history never leaves your browser. All data
                processing is done locally, ensuring 100% privacy and custody.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-primary-container">
              <div className="text-sm font-bold opacity-80 uppercase tracking-widest">
                Privacy First
              </div>
            </div>
          </div>

          {/* Feature Card 3 — Tamper-Proof */}
          <div className="bg-surface-container-lowest p-10 rounded-xl flex flex-col justify-between border-l-4 border-tertiary-fixed hover:-translate-y-0.5 transition-transform duration-150">
            <div>
              <ShieldCheck className="w-10 h-10 text-tertiary mb-6" />
              <h3 className="text-2xl font-bold font-headline mb-4">
                Tamper-Proof Verification
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                Each statement includes a unique cryptographic signature.
                Verifiers can validate the authenticity of the report on-chain
                without needing your private keys.
              </p>
            </div>
            <Link
              href="/verify"
              className="mt-8 text-primary font-bold flex items-center gap-2 group"
            >
              Try the Verifier{" "}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Feature Card 4 — Multi-Asset */}
          <div className="md:col-span-2 bg-surface-container-lowest p-10 rounded-xl flex flex-col md:flex-row gap-10 items-center hover:-translate-y-0.5 transition-transform duration-150">
            <div className="flex-1">
              <h3 className="text-2xl font-bold font-headline mb-4">
                Multi-Asset Compatibility
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                From ETH and ERC-20 tokens to staked assets and liquidity
                positions. Fundslip aggregates your entire Ethereum portfolio
                into a single, cohesive balance sheet.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              {[
                { Icon: Coins, label: "ERC-20" },
                { Icon: Layers, label: "L2 Support" },
                { Icon: Wallet, label: "Staking" },
                { Icon: BarChart3, label: "NFT Value" },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="bg-surface p-4 rounded-lg flex items-center gap-3"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
