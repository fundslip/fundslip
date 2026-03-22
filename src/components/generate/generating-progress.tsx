"use client";

import { Wallet, Calculator, FileText, Pen, Check, Loader2 } from "lucide-react";

interface GeneratingProgressProps {
  currentStep: number;
  isSigning?: boolean;
}

const STEPS = [
  { Icon: Wallet, label: "Reading blockchain data" },
  { Icon: Calculator, label: "Resolving balances" },
  { Icon: FileText, label: "Fetching transactions" },
  { Icon: Pen, label: "Awaiting wallet signature" },
];

export function GeneratingProgress({ currentStep, isSigning }: GeneratingProgressProps) {
  const activeIndex = isSigning ? 3 : Math.min(currentStep, 2);

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Generating Statement</p>
          <h1 className="font-headline text-[28px] font-bold text-gray-900 mb-3">
            {isSigning ? "Sign to verify ownership." : "Securing your financial proof."}
          </h1>
          <p className="text-sm text-gray-500">
            {isSigning
              ? "Please confirm the signature in your wallet."
              : "This usually takes a few seconds."}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8">
          <div className="space-y-6">
            {STEPS.map((step, index) => {
              const isActive = index === activeIndex;
              const isCompleted = index < activeIndex;
              const isPending = index > activeIndex;

              return (
                <div key={index} className={`flex items-center gap-4 ${isPending ? "opacity-30" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive ? "bg-navy text-white"
                    : isCompleted ? "bg-emerald text-white"
                    : "bg-gray-100 text-gray-400"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" strokeWidth={2.5} />
                      : isActive ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <step.Icon className="w-4 h-4" strokeWidth={1.5} />}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? "text-gray-900" : isCompleted ? "text-emerald-dark" : "text-gray-400"
                  }`}>
                    {step.label}
                    {isCompleted && <span className="text-emerald-dark ml-1.5">✓</span>}
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
