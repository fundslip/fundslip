"use client";

import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Wallet } from "lucide-react";

export function CTA() {
  const { connect } = useConnect();

  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="max-w-xl mx-auto text-center">
        <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mx-auto mb-6">
          <Wallet className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>
        <h2 className="font-headline text-[32px] font-bold text-gray-900 mb-4">
          Ready to verify your wealth?
        </h2>
        <p className="text-gray-500 text-base mb-10">
          Join 12,000+ Ethereum users generating verifiable proof of funds for their real-world needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => connect({ connector: injected() })}
            className="bg-navy text-white px-8 py-3.5 rounded-lg font-medium text-[15px] hover:bg-navy-light transition-colors"
          >
            Connect Wallet Now
          </button>
          <button className="border border-gray-300 text-gray-700 px-8 py-3.5 rounded-lg font-medium text-[15px] hover:bg-gray-50 transition-colors">
            Documentation
          </button>
        </div>
        <p className="mt-6 text-[13px] text-gray-400">
          No sign-up required. Completely free to use.
        </p>
      </div>
    </section>
  );
}
