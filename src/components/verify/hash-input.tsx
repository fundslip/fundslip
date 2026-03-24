"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface HashInputProps { onVerify: (code: string) => void; isVerifying: boolean; }

export function HashInput({ onVerify, isVerifying }: HashInputProps) {
  const [code, setCode] = useState("");
  return (
    <section className="rounded-xl border border-outline-variant p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-headline text-base font-medium text-brand-black mb-1">Manual Verification</h2>
          <p className="text-sm text-on-surface-variant">Paste the statement fingerprint from your document.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
            className="flex-grow bg-surface border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-brand-navy/20 outline-none font-mono min-w-0"
            placeholder="Paste statement fingerprint..." />
          <button onClick={() => onVerify(code)} disabled={!code || isVerifying}
            className="bg-brand-navy text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-navy/90 transition-colors disabled:opacity-50 whitespace-nowrap w-full sm:w-auto">
            {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Verify"}
          </button>
        </div>
      </div>
    </section>
  );
}
