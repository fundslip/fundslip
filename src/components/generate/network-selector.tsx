"use client";

import { Globe, Layers, GitBranch, Coins } from "lucide-react";
import type { Network } from "@/types";
import { NETWORKS } from "@/lib/constants";

const NETWORK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hub: Globe,
  layers: Layers,
  schema: GitBranch,
  token: Coins,
};

interface NetworkSelectorProps {
  selected: Network[];
  onToggle: (network: Network) => void;
}

export function NetworkSelector({ selected, onToggle }: NetworkSelectorProps) {
  return (
    <section className="bg-surface-container-lowest p-8 rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-sm font-bold">
          3
        </span>
        <h2 className="font-headline text-xl font-bold">Network Coverage</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {(Object.entries(NETWORKS) as [Network, (typeof NETWORKS)[Network]][]).map(
          ([key, network]) => {
            const isSelected = selected.includes(key);
            const isDisabled = !network.enabled;
            const Icon = NETWORK_ICONS[network.icon] || Globe;

            return (
              <button
                key={key}
                onClick={() => !isDisabled && onToggle(key)}
                disabled={isDisabled}
                className={`flex items-center gap-3 px-5 py-3 rounded-full border-2 font-medium transition-colors duration-150 ${
                  isSelected
                    ? "border-primary bg-primary/5 text-primary font-bold"
                    : isDisabled
                    ? "border-transparent bg-surface-container-low text-on-surface-variant opacity-60 cursor-not-allowed"
                    : "border-transparent bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
                title={isDisabled ? "Coming Soon" : undefined}
              >
                <Icon className="w-5 h-5" />
                {network.name}
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}
