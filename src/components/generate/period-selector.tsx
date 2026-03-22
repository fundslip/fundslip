"use client";

import type { StatementPeriod } from "@/types";
import { PERIOD_OPTIONS } from "@/lib/constants";
import { Calendar } from "@/components/shared/calendar";

interface PeriodSelectorProps {
  selected: StatementPeriod;
  onSelect: (period: StatementPeriod) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (date: string) => void;
  onCustomEndChange: (date: string) => void;
}

export function PeriodSelector({
  selected, onSelect, customStart, customEnd, onCustomStartChange, onCustomEndChange,
}: PeriodSelectorProps) {
  const today = new Date().toISOString().split("T")[0];
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split("T")[0];

  return (
    <section className="rounded-xl border border-outline-variant p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[13px] text-on-surface-variant">2.</span>
        <h2 className="font-headline text-base font-medium text-brand-black">Statement Period</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {PERIOD_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button key={option.value} onClick={() => onSelect(option.value)}
              className={`p-3 rounded-lg text-center transition-colors ${
                isSelected ? "bg-brand-navy/[0.04] border border-brand-navy/20 text-brand-navy" : "bg-surface text-on-surface-variant hover:bg-surface"
              }`}>
              <span className="text-xs font-medium uppercase">{option.label}</span>
              {option.sublabel && <span className="block text-[10px] text-on-surface-variant mt-0.5">{option.sublabel}</span>}
            </button>
          );
        })}
      </div>
      {selected === "custom" && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Calendar label="Start Date" value={customStart} onChange={onCustomStartChange} min={oneYearAgo} max={customEnd || today} />
          <Calendar label="End Date" value={customEnd} onChange={onCustomEndChange} min={customStart || oneYearAgo} max={today} />
        </div>
      )}
    </section>
  );
}
