"use client";

import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { StatementPreview } from "./statement-preview";
import Link from "next/link";

export function Hero() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  return (
    <section className="pt-24 pb-20 px-6 lg:px-8">
      <div className="container-page grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-20 items-center">
        {/* Left — 3/5 width */}
        <div className="lg:col-span-3">
          <p className="section-label text-gray-500 mb-3">Financial Autonomy</p>

          <h1 className="font-headline text-[44px] md:text-[52px] font-bold text-gray-900 leading-[1.1] mb-5">
            Your wallet. Your statement.{" "}
            <span className="text-navy">Verifiable by anyone.</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-lg">
            Generate professional, cryptographically signed financial statements
            from your Ethereum wallet for landlords, mortgage officers, and
            accountants.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {isConnected ? (
              <Link
                href="/generate"
                className="bg-navy text-white px-7 py-3.5 rounded-lg font-medium text-[15px] hover:bg-navy-light transition-colors text-center"
              >
                Generate Statement
              </Link>
            ) : (
              <button
                onClick={() => connect({ connector: injected() })}
                className="bg-navy text-white px-7 py-3.5 rounded-lg font-medium text-[15px] hover:bg-navy-light transition-colors"
              >
                Connect Wallet
              </button>
            )}
            <button className="border border-gray-300 text-gray-700 px-7 py-3.5 rounded-lg font-medium text-[15px] hover:bg-gray-50 hover:border-gray-400 transition-colors">
              View Sample Report
            </button>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex flex-wrap gap-6 items-center text-[13px] text-gray-400">
            <span>&lt;/&gt; Open Source</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>No Backend</span>
            <span className="w-px h-3 bg-gray-200" />
            <span>Private &amp; Secure</span>
          </div>
        </div>

        {/* Right — 2/5 width */}
        <div className="lg:col-span-2 hidden lg:block">
          <StatementPreview />
        </div>
      </div>
    </section>
  );
}
