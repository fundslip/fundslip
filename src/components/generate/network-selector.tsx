"use client";

import { Globe, Layers, GitBranch, Coins } from "lucide-react";
import type { Network } from "@/types";
import { NETWORKS } from "@/lib/constants";

const ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  hub: Globe, layers: Layers, schema: GitBranch, token: Coins,
};

interface NetworkSelectorProps {
  selected: Network[];
  onToggle: (network: Network) => void;
}

export function NetworkSelector({ selected, onToggle }: NetworkSelectorProps) {
  return (
    <section className="bg-white rounded-xl p-7">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-semibold">3</span>
        <h2 className="font-headline text-lg font-bold text-gray-900">Network Coverage</h2>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {(Object.entries(NETWORKS) as [Network, (typeof NETWORKS)[Network]][]).map(([key, net]) => {
          const isSelected = selected.includes(key);
          const disabled = !net.enabled;
          const Icon = ICONS[net.icon] || Globe;
          return (
            <button
              key={key}
              type="button"
              onClick={() => !disabled && onToggle(key)}
              disabled={disabled}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                isSelected ? "bg-navy text-white" : disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              {net.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
