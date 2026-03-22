"use client";

import { Calendar as CalendarIcon } from "lucide-react";
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
  selected,
  onSelect,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}: PeriodSelectorProps) {
  const today = new Date().toISOString().split("T")[0];
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split("T")[0];

  return (
    <section className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-sm font-bold">
          2
        </span>
        <h2 className="font-headline text-xl font-bold">Statement Period</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PERIOD_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors duration-150 ${
                isSelected
                  ? "border-primary bg-surface"
                  : "border-transparent bg-surface-container-low hover:bg-surface-container"
              }`}
            >
              {option.icon && (
                <CalendarIcon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-on-surface-variant"}`} />
              )}
              <span
                className={`text-xs font-bold uppercase ${
                  isSelected ? "text-primary" : ""
                }`}
              >
                {option.label}
              </span>
              {option.sublabel && (
                <span className="text-[10px] text-on-surface-variant">
                  {option.sublabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom date range with styled calendar */}
      {selected === "custom" && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Calendar
            label="Start Date"
            value={customStart}
            onChange={onCustomStartChange}
            min={oneYearAgo}
            max={customEnd || today}
          />
          <Calendar
            label="End Date"
            value={customEnd}
            onChange={onCustomEndChange}
            min={customStart || oneYearAgo}
            max={today}
          />
        </div>
      )}
    </section>
  );
}
