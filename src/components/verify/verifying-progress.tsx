"use client";

import { Search, ShieldCheck, Database, Calculator, Check, Loader2 } from "lucide-react";

interface VerifyingProgressProps { currentStep: number; statusLabel: string; }

const STEPS = [
  { Icon: Search, label: "Decoding verification data" },
  { Icon: ShieldCheck, label: "Verifying cryptographic signature" },
  { Icon: Database, label: "Fetching on-chain data" },
  { Icon: Calculator, label: "Building statement preview" },
];

export function VerifyingProgress({ currentStep, statusLabel }: VerifyingProgressProps) {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Verifying Statement</p>
          <h1 className="font-headline text-[28px] font-bold text-gray-900 mb-3">Checking authenticity.</h1>
          <p className="text-sm text-gray-500">{statusLabel || "Verifying the cryptographic signature against on-chain data."}</p>
        </div>
        <div className="bg-white rounded-2xl p-8">
          <div className="space-y-6">
            {STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isPending = index > currentStep;
              return (
                <div key={index} className={`flex items-center gap-4 ${isPending ? "opacity-30" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive ? "bg-navy text-white" : isCompleted ? "bg-emerald text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" strokeWidth={2.5} />
                      : isActive ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <step.Icon className="w-4 h-4" strokeWidth={1.5} />}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? "text-gray-900" : isCompleted ? "text-emerald-dark" : "text-gray-400"}`}>
                    {step.label}{isCompleted && <span className="text-emerald-dark ml-1.5">✓</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
