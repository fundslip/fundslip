"use client";

import { AnimatedNumber } from "@/components/shared/animated-number";

interface BalanceCardProps {
  balance: number;
  ensName: string | null;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <div className="bg-white rounded-xl p-6">
      <p className="section-label mb-2">Total Balance (USD)</p>
      <AnimatedNumber
        value={balance}
        className="text-[36px] font-headline font-bold text-gray-900 tracking-tight"
        prefix="$"
      />
    </div>
  );
}
