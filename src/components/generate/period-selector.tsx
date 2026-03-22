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

export function PeriodSelector({ selected, onSelect, customStart, customEnd, onCustomStartChange, onCustomEndChange }: PeriodSelectorProps) {
  const today = new Date().toISOString().split("T")[0];
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split("T")[0];

  return (
    <section className="bg-white rounded-xl p-7">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-semibold">2</span>
        <h2 className="font-headline text-lg font-bold text-gray-900">Statement Period</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {PERIOD_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`p-3.5 rounded-lg flex flex-col items-center gap-1 transition-all duration-150 ${
                isSelected
                  ? "bg-white border-2 border-navy text-navy shadow-sm"
                  : "bg-gray-50 border-2 border-transparent text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xs font-bold uppercase">{option.label}</span>
              {option.sublabel && <span className="text-[10px] text-gray-400">{option.sublabel}</span>}
            </button>
          );
        })}
      </div>
      {selected === "custom" && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Calendar label="Start Date" value={customStart} onChange={onCustomStartChange} min={oneYearAgo} max={customEnd || today} />
          <Calendar label="End Date" value={customEnd} onChange={onCustomEndChange} min={customStart || oneYearAgo} max={today} />
        </div>
      )}
    </section>
  );
}
