"use client";

import type { StatementType } from "@/types";
import { TYPE_OPTIONS } from "@/lib/constants";

interface TypeSelectorProps {
  selected: StatementType;
  onSelect: (type: StatementType) => void;
}

export function TypeSelector({ selected, onSelect }: TypeSelectorProps) {
  return (
    <section className="bg-surface-container-lowest p-8 rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-sm font-bold">
          1
        </span>
        <h2 className="font-headline text-xl font-bold">Statement Type</h2>
      </div>
      <div className="space-y-4">
        {TYPE_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <label
              key={option.value}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors duration-150 relative ${
                isSelected
                  ? "border-primary bg-surface"
                  : "border-transparent bg-surface-container-low hover:bg-surface-container"
              }`}
            >
              {option.recommended && (
                <div className="absolute -top-2 -right-2 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                  Recommended
                </div>
              )}
              <input
                type="radio"
                name="statement-type"
                checked={isSelected}
                onChange={() => onSelect(option.value)}
                className="w-5 h-5 text-primary focus:ring-primary/20 mr-4"
              />
              <div className="flex-1">
                <p className="font-bold text-sm">{option.label}</p>
                <p className="text-xs text-on-surface-variant">{option.description}</p>
              </div>
              {isSelected && (
                <div className="w-1 h-8 bg-tertiary-fixed rounded-full ml-4" />
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
}
