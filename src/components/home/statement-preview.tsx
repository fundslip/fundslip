"use client";

import { Bitcoin, DollarSign, ShieldCheck, QrCode } from "lucide-react";

export function StatementPreview() {
  return (
    <div className="relative">
      <div className="bg-surface-container-lowest p-8 rounded-xl shadow-2xl relative z-10 border border-outline-variant/10">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="text-2xl font-bold font-headline mb-1">FUNDSLIP</div>
            <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
              Asset Verification Report
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-on-surface-variant">Date Generated</div>
            <div className="text-sm font-medium">October 24, 2024</div>
          </div>
        </div>

        {/* Data rows */}
        <div className="space-y-6">
          <div className="flex justify-between border-b border-surface-container pb-4">
            <span className="text-sm text-on-surface-variant">Wallet Address</span>
            <span className="text-sm font-mono font-medium">0x71C...8921</span>
          </div>
          <div className="flex justify-between border-b border-surface-container pb-4">
            <span className="text-sm text-on-surface-variant">Total Net Worth (USD)</span>
            <span className="text-xl font-bold text-primary">$142,502.88</span>
          </div>
        </div>

        {/* Asset Holdings */}
        <div className="mt-10">
          <div className="editorial-header mb-4 text-[10px]">Verified Asset Holdings</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <Bitcoin className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div>
                  <div className="text-sm font-bold">Ethereum</div>
                  <div className="text-[10px] text-on-surface-variant">ETH</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">32.45</div>
                <div className="text-[10px] text-on-surface-variant">$84,120.00</div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div>
                  <div className="text-sm font-bold">USD Coin</div>
                  <div className="text-[10px] text-on-surface-variant">USDC</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">58,382.88</div>
                <div className="text-[10px] text-on-surface-variant">$58,382.88</div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="mt-12 pt-6 border-t border-dashed border-outline-variant/30 flex justify-between items-end">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-tertiary-fixed rounded flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-on-tertiary-fixed" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-tertiary-container">
                Cryptographically Signed
              </div>
              <div className="text-[8px] text-on-surface-variant font-mono">
                HASH: 9f82...a12c
              </div>
            </div>
          </div>
          <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded">
            <QrCode className="w-8 h-8 text-outline-variant" />
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}
