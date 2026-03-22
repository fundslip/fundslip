"use client";

import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Wallet, CheckCircle } from "lucide-react";

export function CTA() {
  const { connect } = useConnect();

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
          <Wallet className="w-7 h-7 text-white" />
        </div>

        <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          Ready to verify your wealth?
        </h2>

        <p className="text-xl text-on-surface-variant mb-12">
          Join 12,000+ Ethereum users generating verifiable proof of funds for
          their real-world needs.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleConnect}
            className="bg-primary text-on-primary px-10 py-5 rounded-xl font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Connect Wallet Now
          </button>
          <button className="bg-surface-container text-on-surface px-10 py-5 rounded-xl font-bold text-lg hover:bg-surface-container-high transition-colors">
            Documentation
          </button>
        </div>
        <p className="mt-8 text-sm text-on-surface-variant flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-tertiary" />
          No sign-up required. Completely free to use.
        </p>
      </div>
    </section>
  );
}
