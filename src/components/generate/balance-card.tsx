"use client";

import { Wallet } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";

interface BalanceCardProps {
  balance: number;
  ensName: string | null;
}

export function BalanceCard({ balance, ensName }: BalanceCardProps) {
  return (
    <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between">
      <div>
        <p className="text-xs uppercase text-on-surface-variant mb-1 font-semibold tracking-wide">
          Total Balance (USD)
        </p>
        <AnimatedNumber
          value={balance}
          className="text-3xl font-headline font-bold text-on-surface"
        />
      </div>
      <div className="flex -space-x-2">
        <div
          className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm border-2 border-surface-container-low"
          title={ensName || "Ethereum"}
        >
          <Wallet className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
