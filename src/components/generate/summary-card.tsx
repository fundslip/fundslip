"use client";

import { ShieldCheck, Info } from "lucide-react";
import type { StatementPeriod, StatementType, PersonalDetails } from "@/types";

interface SummaryCardProps {
  period: StatementPeriod;
  type: StatementType;
  network: string;
  ensName: string | null;
  personalDetails: PersonalDetails;
  customStart: string;
  customEnd: string;
  onGenerate: () => void;
  isGenerating: boolean;
}

const TYPE_LABELS: Record<StatementType, string> = {
  "balance-snapshot": "Balance Snapshot",
  "full-history": "Full Transaction History",
  "income-summary": "Income Summary",
};

function getPeriodLabel(period: StatementPeriod, customStart: string, customEnd: string): string {
  switch (period) {
    case "7d": return "Last 7 Days";
    case "30d": return "Last 30 Days";
    case "90d": return "Last 90 Days";
    case "custom": {
      if (customStart && customEnd) {
        const start = new Date(customStart + "T00:00:00");
        const end = new Date(customEnd + "T00:00:00");
        return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      }
      return "Custom Range";
    }
  }
}

export function SummaryCard({
  period,
  type,
  network,
  ensName,
  personalDetails,
  customStart,
  customEnd,
  onGenerate,
  isGenerating,
}: SummaryCardProps) {
  return (
    <div className="sticky top-24 space-y-6">
      <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary">
        <h3 className="font-headline text-lg font-bold mb-4">Summary</h3>
        <ul className="space-y-4 text-sm mb-8">
          <li className="flex justify-between">
            <span className="text-on-surface-variant">Type</span>
            <span className="font-semibold">{TYPE_LABELS[type]}</span>
          </li>
          {type !== "balance-snapshot" && (
            <li className="flex justify-between">
              <span className="text-on-surface-variant">Period</span>
              <span className="font-semibold">{getPeriodLabel(period, customStart, customEnd)}</span>
            </li>
          )}
          <li className="flex justify-between">
            <span className="text-on-surface-variant">Network</span>
            <span className="font-semibold">{network}</span>
          </li>
          {personalDetails.fullName && (
            <li className="flex justify-between">
              <span className="text-on-surface-variant">Name</span>
              <span className="font-semibold">{personalDetails.fullName}</span>
            </li>
          )}
          <li className="pt-4 border-t border-outline-variant flex justify-between items-center">
            <span className="text-on-surface-variant">Fee</span>
            <span className="text-tertiary-container font-bold bg-tertiary-fixed px-2 py-0.5 rounded text-[10px] uppercase">
              Free Tier
            </span>
          </li>
        </ul>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 mb-4"
        >
          {isGenerating ? "Generating..." : "Generate Statement"}
        </button>
        <div className="flex gap-3 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/30">
          <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            By clicking generate, you will be prompted to sign a message (SIWE)
            to verify ownership of{" "}
            <span className="font-bold">{ensName || "your wallet"}</span>. No
            gas fee required.
          </p>
        </div>
      </div>

      <div className="p-6 bg-surface-container-high rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-primary" />
          <h4 className="font-bold text-sm">Data Privacy</h4>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Statements are cryptographically signed and encrypted. Only you can
          access or share the generated PDF/JSON link.
        </p>
      </div>
    </div>
  );
}
