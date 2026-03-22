"use client";

import type { StatementType } from "@/types";
import { TYPE_OPTIONS } from "@/lib/constants";

interface TypeSelectorProps {
  selected: StatementType;
  onSelect: (type: StatementType) => void;
}

export function TypeSelector({ selected, onSelect }: TypeSelectorProps) {
  return (
    <section className="bg-white rounded-xl p-7">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-semibold">1</span>
        <h2 className="font-headline text-lg font-bold text-gray-900">Statement Type</h2>
      </div>
      <div className="space-y-3">
        {TYPE_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <label
              key={option.value}
              className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-150 relative ${
                isSelected
                  ? "bg-[#f8faff] border-l-[3px] border-navy pl-[13px]"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {option.recommended && (
                <span className="absolute -top-2 -right-1 bg-emerald-light text-emerald-dark text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Recommended
                </span>
              )}
              <input
                type="radio"
                name="statement-type"
                checked={isSelected}
                onChange={() => onSelect(option.value)}
                className="w-4 h-4 text-navy focus:ring-navy/20 mr-4 accent-navy"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
