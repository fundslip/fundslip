"use client";

import type { StatementType } from "@/types";
import { TYPE_OPTIONS } from "@/lib/constants";

interface TypeSelectorProps {
  selected: StatementType;
  onSelect: (type: StatementType) => void;
}

export function TypeSelector({ selected, onSelect }: TypeSelectorProps) {
  return (
    <section className="rounded-xl border border-outline-variant p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[13px] text-on-surface-variant">1.</span>
        <h2 className="font-headline text-base font-medium text-brand-black">Statement Type</h2>
      </div>
      <div className="space-y-2">
        {TYPE_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <label key={option.value}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors relative ${isSelected ? "bg-surface" : "hover:bg-surface/50"}`}>
              {option.recommended && (
                <span className="absolute -top-1.5 right-3 text-[8px] font-medium text-tertiary bg-[#d1fae5] px-1.5 py-0.5 rounded">
                  Recommended
                </span>
              )}
              <input type="radio" name="statement-type" checked={isSelected}
                onChange={() => onSelect(option.value)} className="w-4 h-4 accent-[#003499] mr-3" />
              <div>
                <p className="text-[13px] font-medium text-brand-black">{option.label}</p>
                <p className="text-[11px] text-on-surface-variant">{option.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
