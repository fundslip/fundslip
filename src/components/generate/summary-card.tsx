"use client";

import { Loader2 } from "lucide-react";
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
  period, type, network, ensName, personalDetails, customStart, customEnd, onGenerate, isGenerating,
}: SummaryCardProps) {
  return (
    <div className="sticky top-16 rounded-xl border border-outline-variant bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] p-6">
      <h3 className="font-headline text-base font-medium text-brand-black mb-4">Summary</h3>
      <ul className="space-y-3 text-sm mb-6">
        <li className="flex justify-between">
          <span className="text-on-surface-variant">Type</span>
          <span className="font-medium text-brand-black">{TYPE_LABELS[type]}</span>
        </li>
        {type !== "balance-snapshot" && (
          <li className="flex justify-between">
            <span className="text-on-surface-variant">Period</span>
            <span className="font-medium text-brand-black">{getPeriodLabel(period, customStart, customEnd)}</span>
          </li>
        )}
        <li className="flex justify-between">
          <span className="text-on-surface-variant">Network</span>
          <span className="font-medium text-brand-black">{network}</span>
        </li>
        {personalDetails.fullName && (
          <li className="flex justify-between">
            <span className="text-on-surface-variant">Name</span>
            <span className="font-medium text-brand-black">{personalDetails.fullName}</span>
          </li>
        )}
        <li className="pt-3 border-t border-outline-variant flex justify-between items-center">
          <span className="text-on-surface-variant">Fee</span>
          <span className="text-brand-black text-[12px]">Free</span>
        </li>
      </ul>

      <button type="button" onClick={onGenerate} disabled={isGenerating}
        className="w-full bg-brand-navy text-white py-3 rounded-lg text-[14px] font-medium hover:bg-brand-navy/90 transition-colors disabled:opacity-50 mb-4">
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
          </span>
        ) : "Generate Statement"}
      </button>

      <div className="pt-4 border-t border-outline-variant">
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          You&apos;ll sign a message with your wallet to prove ownership of{" "}
          <span className="font-medium text-brand-black">{ensName || "your wallet"}</span>. No gas fee.
        </p>
      </div>
    </div>
  );
}
