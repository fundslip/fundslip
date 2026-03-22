"use client";

import { useState } from "react";
import { Fingerprint, Loader2 } from "lucide-react";

interface HashInputProps {
  onVerify: (code: string) => void;
  isVerifying: boolean;
}

export function HashInput({ onVerify, isVerifying }: HashInputProps) {
  const [code, setCode] = useState("");

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <Fingerprint className="w-6 h-6 text-primary" />
            <h2 className="font-headline text-xl font-bold">Manual Verification</h2>
          </div>
          <p className="text-sm text-on-surface-variant">
            Paste the verification code from the statement document.
          </p>
        </div>
        <div className="flex-grow max-w-xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-grow bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-mono"
              placeholder="Paste verification code here..."
            />
            <button
              type="button"
              onClick={() => onVerify(code)}
              disabled={!code || isVerifying}
              className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded-lg font-bold text-sm hover:bg-primary hover:text-on-primary transition-colors active:scale-[0.98] disabled:opacity-50"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
