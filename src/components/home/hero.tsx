"use client";

import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { StatementPreview } from "./statement-preview";
import { Code, CloudOff, Shield } from "lucide-react";

export function Hero() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-24 px-6 md:px-12 bg-surface">
      <div className="container-page grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="z-10">
          <div className="editorial-header text-primary mb-4">
            Financial Autonomy
          </div>

          <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-background tracking-tight leading-[1.1] mb-6">
            Your wallet. Your statement.{" "}
            <span className="text-primary">Verifiable by anyone.</span>
          </h1>

          <p className="text-xl text-on-surface-variant leading-relaxed mb-10 max-w-xl">
            Generate professional, cryptographically signed financial statements
            from your Ethereum wallet for landlords, mortgage officers, and
            accountants.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {isConnected ? (
              <a
                href="/generate"
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all text-center"
              >
                Generate Statement
              </a>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Connect Wallet
              </button>
            )}
            <button
              onClick={() => window.open("/sample-statement.pdf", "_blank")}
              className="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-container transition-colors"
            >
              View Sample Report
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap gap-8 items-center opacity-70">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-tertiary" />
              <span className="text-sm font-semibold">Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <CloudOff className="w-5 h-5 text-tertiary" />
              <span className="text-sm font-semibold">No Backend</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-tertiary" />
              <span className="text-sm font-semibold">Private &amp; Secure</span>
            </div>
          </div>
        </div>

        <StatementPreview />
      </div>
    </section>
  );
}
