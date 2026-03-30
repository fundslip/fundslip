"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ShieldCheck, ZoomIn, ZoomOut } from "lucide-react";
import type { StatementData } from "@/types";
import { processForDisplay } from "@/lib/ethereum";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function fmtDateShort(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shortAddr(a: string) {
  if (!a || a.length < 10) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function typeTitle(t: string) {
  if (t === "balance-snapshot") return "Balance Snapshot";
  if (t === "income-summary") return "Income Summary";
  return "Full Transaction History";
}

interface Props {
  data: StatementData;
  statementId: string;
  verifyUrl: string;
}

export function StatementPreview({ data, statementId, verifyUrl }: Props) {
  const [zoom, setZoom] = useState(100);
  const zoomIn = useCallback(() => setZoom(z => Math.min(200, z + 25)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(50, z - 25)), []);

  const isBs = data.statementType === "balance-snapshot";
  const isIs = data.statementType === "income-summary";
  const pricedTokens = data.tokens.filter(t => t.valueUsd > 0.01);
  const unpricedTokens = data.tokens.filter(t => t.priceUsd === 0 && t.balanceFormatted > 0);
  const displayTxs = processForDisplay(data.transactions);
  const txs = isIs ? displayTxs.filter(t => t.type === "receive") : displayTxs.filter(t => t.valueUsd > 0 || t.type === "send" || t.type === "contract");

  const dateTime = `${fmtDate(data.generatedAt)} at ${data.generatedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`;
  const priceLabel = data.isHistoricalPricing && data.priceDate
    ? `USD values reflect prices as of ${fmtDate(data.priceDate)} (period end date).`
    : "USD values reflect prices at time of generation.";

  const recv = txs.filter(t => t.type === "receive").reduce((s, t) => s + t.valueUsd, 0);
  const sent = txs.filter(t => t.type === "send" || t.type === "contract").reduce((s, t) => s + t.valueUsd, 0);

  return (
    <div className="relative">
      {/* Scrollable viewport — fixed height frame */}
      <div className="rounded-xl border border-outline-variant overflow-auto bg-surface/30" style={{ maxHeight: "80vh" }}>
        {/* Zoomable content */}
        <div style={{ width: `${zoom}%`, transition: "width 0.15s ease" }} className="mx-auto">

          {/* ═══ The statement document ═══ */}
          <div className="bg-white text-brand-black" style={{ padding: "8% 7%" }}>

            {/* Header — Logo · Wordmark · Verified badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image src="/fundslip.svg" alt="" width={16} height={20} style={{ height: "auto" }} />
                <span className="font-headline font-bold text-[14px]">Fundslip</span>
                <span className="text-[8px] text-on-surface-variant ml-1">Asset Verification Report</span>
              </div>
              <span className="text-[7px] font-bold uppercase tracking-wider text-brand-navy bg-brand-emerald/30 px-2.5 py-1 rounded-full">
                Verified
              </span>
            </div>

            <div className="h-px bg-outline-variant mb-5" />

            {/* Document title */}
            <h2 className="font-headline text-xl font-bold mb-1">{typeTitle(data.statementType)}</h2>
            <p className="text-[9px] text-on-surface-variant mb-6">{dateTime}</p>

            {/* Account details — grid matching PDF layout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 mb-6">
              <div>
                <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Account</p>
                <p className="text-[10px] font-mono">{data.ensName || shortAddr(data.walletAddress)}</p>
              </div>
              <div>
                <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Network</p>
                <p className="text-[10px]">{data.networkName || "Ethereum Mainnet"}</p>
              </div>
              <div>
                <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Block</p>
                <p className="text-[10px]">#{data.blockNumber.toLocaleString()}</p>
              </div>
              {!isBs && (
                <div>
                  <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Period</p>
                  <p className="text-[10px]">{fmtDateShort(data.periodStart)} – {fmtDateShort(data.periodEnd)}</p>
                </div>
              )}
              {data.personalDetails?.fullName && (
                <div>
                  <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Name</p>
                  <p className="text-[10px]">{data.personalDetails.fullName}</p>
                </div>
              )}
            </div>

            {data.personalDetails?.address && (
              <div className="mb-6">
                <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Address</p>
                <p className="text-[10px]">{data.personalDetails.address}</p>
              </div>
            )}

            {/* Net Worth */}
            <div className="bg-surface rounded-lg px-4 py-3 mb-6">
              <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Total Net Worth (USD)</p>
              <p className="text-[22px] font-headline font-bold text-brand-navy leading-tight">${fmt(data.totalValueUsd)}</p>
            </div>

            {/* Holdings table */}
            <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-1.5">Digital Asset Holdings</p>
            <table className="w-full text-[9px] mb-6">
              <thead>
                <tr className="text-[7px] uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
                  <th className="text-left font-normal py-1.5">Asset</th>
                  <th className="text-right font-normal py-1.5">Quantity</th>
                  <th className="text-right font-normal py-1.5">Unit Price</th>
                  <th className="text-right font-normal py-1.5">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.ethBalance > 0 && (
                  <tr className="border-b border-outline-variant/50">
                    <td className="py-2">Ethereum (ETH)</td>
                    <td className="text-right py-2 tabular-nums">{data.ethBalance.toFixed(4)}</td>
                    <td className="text-right py-2 tabular-nums">${fmt(data.ethPriceUsd)}</td>
                    <td className="text-right py-2 tabular-nums">${fmt(data.ethValueUsd)}</td>
                  </tr>
                )}
                {pricedTokens.map(t => (
                  <tr key={t.contractAddress} className="border-b border-outline-variant/50">
                    <td className="py-2">{t.name} ({t.symbol})</td>
                    <td className="text-right py-2 tabular-nums">{t.balanceFormatted.toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
                    <td className="text-right py-2 tabular-nums">${fmt(t.priceUsd)}</td>
                    <td className="text-right py-2 tabular-nums">${fmt(t.valueUsd)}</td>
                  </tr>
                ))}
                {data.ethBalance === 0 && pricedTokens.length === 0 && (
                  <tr><td colSpan={4} className="py-2 text-on-surface-variant">No assets found</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-surface/60 font-bold text-brand-navy">
                  <td colSpan={3} className="py-2 text-right">Total</td>
                  <td className="text-right py-2 tabular-nums">${fmt(data.totalValueUsd)}</td>
                </tr>
              </tfoot>
            </table>

            {/* Unpriced assets */}
            {unpricedTokens.length > 0 && (
              <div className="mb-6">
                <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-1.5">Other Assets (No Market Price Available)</p>
                <table className="w-full text-[8px] text-on-surface-variant">
                  <thead>
                    <tr className="text-[7px] uppercase tracking-wider border-b border-outline-variant">
                      <th className="text-left font-normal py-1.5">Asset</th>
                      <th className="text-right font-normal py-1.5">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpricedTokens.map(t => (
                      <tr key={t.contractAddress} className="border-b border-outline-variant/30">
                        <td className="py-1.5">{t.name} ({t.symbol})</td>
                        <td className="text-right py-1.5 tabular-nums">{t.balanceFormatted.toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Transactions */}
            {!isBs && txs.length > 0 && (
              <div className="mb-6">
                {/* Summary boxes */}
                {isIs ? (
                  <div className="mb-3">
                    <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Total Income</p>
                    <p className="text-[16px] font-headline font-bold text-brand-navy">${fmt(recv)}</p>
                    <p className="text-[8px] text-on-surface-variant">{txs.length} transaction{txs.length !== 1 ? "s" : ""}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { l: "Received", v: `$${fmt(recv)}` },
                      { l: "Sent", v: `$${fmt(sent)}` },
                      { l: "Net", v: `$${fmt(recv - sent)}` },
                    ].map(b => (
                      <div key={b.l} className="bg-surface rounded-lg px-3 py-2">
                        <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">{b.l}</p>
                        <p className="text-[11px] font-bold tabular-nums">{b.v}</p>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">
                  {isIs ? "Income Transactions" : "Transaction History"}
                </p>
                <p className="text-[6px] italic text-on-surface-variant/60 mb-1.5">{priceLabel}</p>

                <table className="w-full text-[8px]">
                  <thead>
                    <tr className="text-[7px] uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
                      <th className="text-left font-normal py-1.5">Date</th>
                      <th className="text-left font-normal py-1.5">Description</th>
                      <th className="text-left font-normal py-1.5">{isIs ? "From" : "Counterparty"}</th>
                      <th className="text-left font-normal py-1.5">Type</th>
                      <th className="text-right font-normal py-1.5">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txs.slice(0, 100).map((tx, i) => (
                      <tr key={`${tx.hash}-${i}`} className="border-b border-outline-variant/30">
                        <td className="py-1.5 whitespace-nowrap text-on-surface-variant">
                          {new Date(tx.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                        </td>
                        <td className="py-1.5">{tx.description}</td>
                        <td className="py-1.5 font-mono text-on-surface-variant">{tx.type === "receive" ? shortAddr(tx.from) : shortAddr(tx.to)}</td>
                        <td className="py-1.5 text-on-surface-variant">
                          {tx.type === "contract"
                            ? (tx.description.toLowerCase().includes("swap") ? "Swap" : "Action")
                            : tx.type === "receive" ? "In" : "Out"}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">{tx.valueUsd > 0 ? `$${fmt(tx.valueUsd)}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {txs.length > 100 && (
                  <p className="text-[7px] text-on-surface-variant mt-1.5">
                    Showing 100 of {(data.totalTransactionCount || txs.length).toLocaleString()} transactions
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-outline-variant pt-3 flex justify-between text-[7px] text-on-surface-variant">
              <span>Statement {statementId} · {dateTime}</span>
              <span className="font-mono">{verifyUrl.replace("https://", "").replace("http://", "")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-outline-variant rounded-xl px-2 py-1.5 shadow-sm select-none">
        <button type="button" onClick={zoomOut} disabled={zoom <= 50}
          className="p-1 hover:bg-surface rounded-lg transition-colors disabled:opacity-30">
          <ZoomOut className="w-3.5 h-3.5 text-on-surface-variant" />
        </button>
        <span className="text-[10px] text-on-surface-variant font-mono w-8 text-center">{zoom}%</span>
        <button type="button" onClick={zoomIn} disabled={zoom >= 200}
          className="p-1 hover:bg-surface rounded-lg transition-colors disabled:opacity-30">
          <ZoomIn className="w-3.5 h-3.5 text-on-surface-variant" />
        </button>
      </div>
    </div>
  );
}
