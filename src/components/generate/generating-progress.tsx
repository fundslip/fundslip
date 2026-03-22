"use client";

import { Check, Loader2 } from "lucide-react";

interface GeneratingProgressProps {
  currentStep: number;
  isSigning?: boolean;
}

const STEPS = [
  "Reading blockchain data",
  "Calculating balances",
  "Fetching transactions",
  "Awaiting wallet signature",
];

export function GeneratingProgress({ currentStep, isSigning }: GeneratingProgressProps) {
  const activeIndex = isSigning ? 3 : Math.min(currentStep, 2);

  return (
    <div className="min-h-screen pt-24 pb-24 px-5 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-headline font-semibold text-brand-black mb-3">
            {isSigning ? "Sign to verify ownership" : "Generating your statement"}
          </h1>
          <p className="text-on-surface-variant text-[15px]">
            {isSigning
              ? "Please confirm the signature in your wallet."
              : "Processing locally against the blockchain."}
          </p>
        </div>

        <div className="space-y-6">
          {STEPS.map((label, index) => {
            const isActive = index === activeIndex;
            const isCompleted = index < activeIndex;
            const isPending = index > activeIndex;

            return (
              <div key={index} className={`flex items-center gap-4 ${isPending ? "opacity-30" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] ${
                  isActive ? "bg-brand-navy text-white"
                  : isCompleted ? "bg-brand-navy text-white"
                  : "bg-surface text-on-surface-variant"
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" />
                    : isActive ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <span>{index + 1}</span>}
                </div>
                <span className={`text-[14px] ${
                  isActive ? "text-brand-navy font-medium" : isCompleted ? "text-brand-black" : "text-on-surface-variant"
                }`}>{label}</span>
              </div>
            );
          })}
        </div>

        {!isSigning && (
          <div className="mt-8 w-full h-0.5 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-brand-navy rounded-full transition-all duration-500" style={{ width: `${((activeIndex + 1) / STEPS.length) * 100}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
