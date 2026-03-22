"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface HashInputProps { onVerify: (code: string) => void; isVerifying: boolean; }

export function HashInput({ onVerify, isVerifying }: HashInputProps) {
  const [code, setCode] = useState("");
  return (
    <section className="rounded-xl border border-outline-variant p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-base font-medium text-brand-black mb-1">Manual Verification</h2>
          <p className="text-sm text-on-surface-variant">Paste the verification code from the statement.</p>
        </div>
        <div className="flex gap-2 flex-grow max-w-xl">
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
            className="flex-grow bg-surface border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-brand-navy/20 outline-none font-mono"
            placeholder="Paste code here..." />
          <button onClick={() => onVerify(code)} disabled={!code || isVerifying}
            className="bg-brand-navy text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-navy/90 transition-colors disabled:opacity-50">
            {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
          </button>
        </div>
      </div>
    </section>
  );
}
