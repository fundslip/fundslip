"use client";

import { Lock } from "lucide-react";
import { getNetworkName } from "@/lib/ethereum";

interface ConnectedNetworkProps {
  chainId: number;
}

export function ConnectedNetwork({ chainId }: ConnectedNetworkProps) {
  const networkName = getNetworkName(chainId);

  return (
    <section className="rounded-xl border border-outline-variant p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[13px] text-on-surface-variant">3.</span>
        <h2 className="font-headline text-base font-medium text-brand-black">Network</h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="px-3 py-2 rounded-full text-[13px] bg-brand-navy/[0.04] border border-brand-navy/20 text-brand-navy font-medium w-fit flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          {networkName}
        </span>
        <span className="text-[11px] text-on-surface-variant">
          Detected from your wallet
        </span>
      </div>
    </section>
  );
}
