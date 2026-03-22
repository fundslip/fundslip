"use client";

import { AnimatedNumber } from "@/components/shared/animated-number";

interface BalanceCardProps {
  balance: number;
  ensName: string | null;
}

export function BalanceCard({ balance, ensName }: BalanceCardProps) {
  return (
    <div className="bg-surface rounded-xl p-5">
      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Total Balance</p>
      <AnimatedNumber value={balance} className="text-2xl font-headline font-semibold text-brand-black" />
      {ensName && <p className="text-[11px] text-on-surface-variant mt-1 font-mono">{ensName}</p>}
    </div>
  );
}
