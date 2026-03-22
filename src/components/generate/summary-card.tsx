"use client";

import { ShieldCheck } from "lucide-react";
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

function getPeriodLabel(period: StatementPeriod, cs: string, ce: string): string {
  switch (period) {
    case "7d": return "Last 7 Days";
    case "30d": return "Last 30 Days";
    case "90d": return "Last 90 Days";
    case "custom": {
      if (cs && ce) {
        const s = new Date(cs + "T00:00:00");
        const e = new Date(ce + "T00:00:00");
        return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      }
      return "Custom Range";
    }
  }
}

export function SummaryCard({ period, type, network, ensName, personalDetails, customStart, customEnd, onGenerate, isGenerating }: SummaryCardProps) {
  const showPeriod = type !== "balance-snapshot";

  return (
    <div className="sticky top-24 space-y-5">
      <div className="bg-white rounded-xl p-6">
        <h3 className="font-headline text-base font-bold text-gray-900 mb-5">Summary</h3>
        <div className="space-y-4 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-400">Type</span>
            <span className="font-medium text-gray-900">{TYPE_LABELS[type]}</span>
          </div>
          {showPeriod && (
            <div className="flex justify-between">
              <span className="text-gray-400">Period</span>
              <span className="font-medium text-gray-900">{getPeriodLabel(period, customStart, customEnd)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Network</span>
            <span className="font-medium text-gray-900">{network}</span>
          </div>
          {personalDetails.fullName && (
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="font-medium text-gray-900">{personalDetails.fullName}</span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-gray-400">Fee</span>
            <span className="bg-emerald-light text-emerald-dark text-[10px] font-semibold px-2 py-0.5 rounded-full">FREE TIER</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-navy text-white py-3.5 rounded-lg font-semibold text-[15px] hover:bg-navy-light transition-colors disabled:opacity-50 mb-4"
        >
          Generate Statement
        </button>

        <div className="flex items-start gap-2.5 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="leading-relaxed">
            You&apos;ll be prompted to sign a message to verify ownership of{" "}
            <span className="text-gray-600 font-medium">{ensName || "your wallet"}</span>. No gas fee.
          </p>
        </div>
      </div>
    </div>
  );
}
