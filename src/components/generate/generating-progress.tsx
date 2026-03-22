"use client";

import { Wallet, Calculator, FileText, Pen, Check, Loader2 } from "lucide-react";

interface GeneratingProgressProps {
  currentStep: number;
  isSigning?: boolean;
}

const STEPS = [
  { Icon: Wallet, label: "Reading blockchain data..." },
  { Icon: Calculator, label: "Calculating balances..." },
  { Icon: FileText, label: "Fetching transactions..." },
  { Icon: Pen, label: "Awaiting wallet signature..." },
];

export function GeneratingProgress({ currentStep, isSigning }: GeneratingProgressProps) {
  // When signing, show step 3 (index 3) as active
  const activeIndex = isSigning ? 3 : Math.min(currentStep, 2);

  return (
    <div className="min-h-screen pt-20 pb-24 px-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-[0.1em] uppercase">
            Generating Statement
          </span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-background tracking-tighter">
            {isSigning ? "Sign to verify ownership." : "Securing your financial proof."}
          </h1>
          <p className="text-on-surface-variant max-w-md mx-auto leading-relaxed">
            {isSigning
              ? "Please confirm the signature in your wallet to prove you own this account."
              : "Your data is being processed locally and verified against the blockchain."}
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-[2rem] p-10 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />
          <div className="relative z-10 space-y-10">
            {STEPS.map((step, index) => {
              const isActive = index === activeIndex;
              const isCompleted = index < activeIndex;
              const isPending = index > activeIndex;

              return (
                <div key={index} className={`flex items-start gap-6 ${isPending ? "opacity-40" : ""}`}>
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? "bg-primary text-on-primary shadow-lg ring-4 ring-primary/10"
                      : isCompleted ? "bg-tertiary text-on-tertiary"
                      : "bg-surface-container-high text-on-surface-variant"
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" />
                        : isActive ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <step.Icon className="w-5 h-5" />}
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className="absolute top-10 left-1/2 w-[2px] h-10 bg-surface-container -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-grow pt-2">
                    <div className="flex justify-between items-center">
                      <h3 className={`font-headline font-bold text-lg ${
                        isActive ? "text-primary" : isCompleted ? "text-tertiary" : ""
                      }`}>{step.label}</h3>
                      {isActive && <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary-fixed">ACTIVE</span>}
                      {isCompleted && <span className="text-[10px] font-bold text-tertiary px-2 py-0.5 rounded bg-tertiary-fixed">DONE</span>}
                    </div>
                    {isActive && !isSigning && (
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-3">
                        <div className="h-full rounded-full animate-pulse" style={{ width: "66%", background: "linear-gradient(90deg, #003499, #0048cc)" }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
