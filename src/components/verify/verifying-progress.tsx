"use client";

import { Check, Loader2 } from "lucide-react";

interface VerifyingProgressProps { currentStep: number; statusLabel: string; }

const STEPS = ["Decoding data", "Verifying signature", "Fetching on-chain data", "Building preview"];

export function VerifyingProgress({ currentStep, statusLabel }: VerifyingProgressProps) {
  return (
    <div className="min-h-screen pt-24 pb-24 px-5 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-headline font-semibold text-brand-black mb-3">Checking authenticity</h1>
          <p className="text-on-surface-variant text-[15px]">{statusLabel || "Verifying the cryptographic signature against on-chain data."}</p>
        </div>
        <div className="space-y-6">
          {STEPS.map((label, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isPending = index > currentStep;
            return (
              <div key={index} className={`flex items-center gap-4 ${isPending ? "opacity-30" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] ${
                  isActive ? "bg-brand-navy text-white" : isCompleted ? "bg-brand-navy text-white" : "bg-surface text-on-surface-variant"
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : isActive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>{index + 1}</span>}
                </div>
                <span className={`text-[14px] ${isActive ? "text-brand-navy font-medium" : isCompleted ? "text-brand-black" : "text-on-surface-variant"}`}>{label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-8 w-full h-0.5 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-brand-navy rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
