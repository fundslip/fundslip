"use client";

import { AnimatedNumber } from "@/components/shared/animated-number";

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <div className="bg-surface rounded-xl p-5 h-[98px]">
      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Total Balance</p>
      <AnimatedNumber value={balance} className="text-2xl font-headline font-semibold text-brand-black" />
    </div>
  );
}
