"use client";

import { AnimatedNumber } from "@/components/shared/animated-number";

interface BalanceCardProps {
  balance: number;
  loaded: boolean;
}

export function BalanceCard({ balance, loaded }: BalanceCardProps) {
  return (
    <div className="bg-surface rounded-xl p-5 h-[98px]">
      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Total Balance</p>
      {loaded ? (
        <AnimatedNumber value={balance} className="text-2xl font-headline font-semibold text-brand-black" />
      ) : (
        <div className="h-8 flex items-center">
          <div className="h-5 w-32 bg-outline-variant/40 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}
