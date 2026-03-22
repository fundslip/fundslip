"use client";

import { useState } from "react";
import { Fingerprint, Loader2 } from "lucide-react";

interface HashInputProps { onVerify: (code: string) => void; isVerifying: boolean; }

export function HashInput({ onVerify, isVerifying }: HashInputProps) {
  const [code, setCode] = useState("");

  return (
    <section className="bg-white rounded-xl p-7">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="max-w-sm">
          <div className="flex items-center gap-3 mb-1.5">
            <Fingerprint className="w-5 h-5 text-navy" strokeWidth={1.5} />
            <h2 className="font-headline text-lg font-bold text-gray-900">Manual Verification</h2>
          </div>
          <p className="text-sm text-gray-500">Paste the verification code from the statement.</p>
        </div>
        <div className="flex-grow max-w-xl">
          <div className="flex gap-2">
            <input
              type="text" value={code} onChange={(e) => setCode(e.target.value)}
              className="flex-grow border border-[rgba(0,0,0,0.08)] rounded-lg px-3.5 py-2.5 text-sm font-mono placeholder:text-gray-400 focus:border-navy focus:ring-[3px] focus:ring-navy/[0.08] outline-none"
              placeholder="Paste verification code..."
            />
            <button type="button" onClick={() => onVerify(code)} disabled={!code || isVerifying}
              className="bg-navy text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-navy-light transition-colors disabled:opacity-40">
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
