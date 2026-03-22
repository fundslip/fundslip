"use client";

import type { Network } from "@/types";
import { NETWORKS } from "@/lib/constants";

interface NetworkSelectorProps {
  selected: Network[];
  onToggle: (network: Network) => void;
}

export function NetworkSelector({ selected, onToggle }: NetworkSelectorProps) {
  return (
    <section className="rounded-xl border border-outline-variant p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[13px] text-on-surface-variant">3.</span>
        <h2 className="font-headline text-base font-medium text-brand-black">Network</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(NETWORKS) as [Network, (typeof NETWORKS)[Network]][]).map(([key, network]) => {
          const isSelected = selected.includes(key);
          const isDisabled = !network.enabled;
          return (
            <button key={key} onClick={() => !isDisabled && onToggle(key)} disabled={isDisabled}
              className={`px-4 py-2 rounded-full text-[13px] transition-colors ${
                isSelected ? "bg-brand-navy/[0.04] border border-brand-navy/20 text-brand-navy font-medium"
                : isDisabled ? "bg-surface text-on-surface-variant/40 cursor-not-allowed"
                : "bg-surface text-on-surface-variant hover:text-brand-black"
              }`}>
              {network.name}
              {isDisabled && <span className="text-[9px] ml-1 uppercase">Soon</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
