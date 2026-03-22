"use client";

import { QrCode } from "lucide-react";

export function StatementPreview() {
  return (
    <div className="relative">
      <div
        className="bg-white p-8 rounded-2xl relative z-10"
        style={{
          transform: "rotate(1.5deg)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="text-lg font-bold font-headline text-gray-900 tracking-tight">FUNDSLIP</div>
            <div className="text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">Asset Verification Report</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400">Date Generated</div>
            <div className="text-xs font-medium text-gray-700">October 24, 2024</div>
          </div>
        </div>

        {/* Data rows */}
        <div className="space-y-5 mb-8">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-gray-400">Wallet Address</span>
            <span className="text-xs font-mono font-medium text-gray-600">0x71C...8921</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-gray-400">Total Net Worth (USD)</span>
            <span className="text-lg font-bold font-headline text-navy tracking-tight">$142,502.88</span>
          </div>
        </div>

        {/* Holdings */}
        <div>
          <div className="section-label mb-3">Verified Asset Holdings</div>
          <div className="space-y-2">
            {[
              { name: "Ethereum", symbol: "ETH", amount: "32.45", usd: "$84,120.00" },
              { name: "USD Coin", symbol: "USDC", amount: "58,382.88", usd: "$58,382.88" },
            ].map((asset) => (
              <div key={asset.symbol} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-500">{asset.symbol[0]}</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-800">{asset.name}</div>
                    <div className="text-[10px] text-gray-400">{asset.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-gray-800">{asset.amount}</div>
                  <div className="text-[10px] text-gray-400">{asset.usd}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Footer */}
        <div className="mt-8 pt-5 border-t border-dashed border-gray-200 flex justify-between items-end">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-light rounded flex items-center justify-center">
              <span className="text-emerald text-[10px] font-bold">✓</span>
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase text-emerald-dark tracking-wide">Cryptographically Signed</div>
              <div className="text-[8px] text-gray-400 font-mono">HASH: 9f82...a12c</div>
            </div>
          </div>
          <QrCode className="w-12 h-12 text-gray-200" />
        </div>
      </div>

      {/* Background depth elements */}
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-navy/[0.03] rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-emerald/[0.03] rounded-full blur-3xl -z-10" />
    </div>
  );
}
