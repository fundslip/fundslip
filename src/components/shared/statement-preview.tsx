"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import type { StatementData } from "@/types";
import { processForDisplay } from "@/lib/ethereum";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function shortAddr(a: string) {
  if (!a || a.length < 10) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

interface Props {
  data: StatementData;
  statementId: string;
  verifyUrl: string;
}

export function StatementPreview({ data, statementId, verifyUrl }: Props) {
  const isBs = data.statementType === "balance-snapshot";
  const isIs = data.statementType === "income-summary";
  const pricedTokens = data.tokens.filter(t => t.valueUsd > 0.01);
  const unpricedTokens = data.tokens.filter(t => t.priceUsd === 0 && t.balanceFormatted > 0);
  const displayTxs = processForDisplay(data.transactions);
  const txs = isIs ? displayTxs.filter(t => t.type === "receive") : displayTxs.filter(t => t.valueUsd > 0 || t.type === "send" || t.type === "contract");

  const priceLabel = data.isHistoricalPricing && data.priceDate
    ? `Prices as of ${fmtDate(data.priceDate)} (period end date)`
    : `Prices at time of generation`;

  return (
    <div className="rounded-2xl border border-outline-variant bg-white overflow-hidden text-brand-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-outline-variant">
        <div className="flex items-center gap-2.5">
          <Image src="/fundslip.svg" alt="" width={16} height={20} style={{ height: "auto" }} />
          <span className="font-headline font-semibold text-[15px]">Fundslip</span>
          <span className="text-[10px] text-on-surface-variant ml-1">Asset Verification Report</span>
        </div>
        <div className="flex items-center gap-1 text-tertiary">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[9px] font-medium uppercase tracking-wide">Verified</span>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6 space-y-6">
        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Account</p>
            <p className="text-[12px] font-mono truncate">{data.ensName || shortAddr(data.walletAddress)}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Network</p>
            <p className="text-[12px]">{data.networkName || "Ethereum"}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Block</p>
            <p className="text-[12px]">#{data.blockNumber.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Generated</p>
            <p className="text-[12px]">{fmtDate(data.generatedAt)}</p>
          </div>
        </div>

        {data.personalDetails?.fullName && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Name</p>
              <p className="text-[12px]">{data.personalDetails.fullName}</p>
            </div>
            {data.personalDetails.address && (
              <div>
                <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Address</p>
                <p className="text-[12px]">{data.personalDetails.address}</p>
              </div>
            )}
          </div>
        )}

        {/* Net Worth */}
        <div className="bg-surface rounded-xl px-5 py-4">
          <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Total Net Worth (USD)</p>
          <p className="text-2xl font-headline font-semibold text-brand-navy">${fmt(data.totalValueUsd)}</p>
        </div>

        {/* Holdings */}
        <div>
          <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-2">Digital Asset Holdings</p>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[9px] uppercase tracking-wide text-on-surface-variant border-b border-outline-variant">
                <th className="text-left font-normal py-2">Asset</th>
                <th className="text-right font-normal py-2">Quantity</th>
                <th className="text-right font-normal py-2">Price</th>
                <th className="text-right font-normal py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.ethBalance > 0 && (
                <tr className="border-b border-outline-variant/50">
                  <td className="py-2.5">Ethereum (ETH)</td>
                  <td className="text-right py-2.5 tabular-nums">{data.ethBalance.toFixed(4)}</td>
                  <td className="text-right py-2.5 tabular-nums">${fmt(data.ethPriceUsd)}</td>
                  <td className="text-right py-2.5 tabular-nums">${fmt(data.ethValueUsd)}</td>
                </tr>
              )}
              {pricedTokens.map(t => (
                <tr key={t.contractAddress} className="border-b border-outline-variant/50">
                  <td className="py-2.5">{t.name} ({t.symbol})</td>
                  <td className="text-right py-2.5 tabular-nums">{t.balanceFormatted.toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
                  <td className="text-right py-2.5 tabular-nums">${fmt(t.priceUsd)}</td>
                  <td className="text-right py-2.5 tabular-nums">${fmt(t.valueUsd)}</td>
                </tr>
              ))}
              {data.ethBalance === 0 && pricedTokens.length === 0 && (
                <tr><td colSpan={4} className="py-3 text-on-surface-variant">No priced assets found</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-surface/50 font-semibold text-brand-navy">
                <td colSpan={3} className="py-2.5 text-right">Total</td>
                <td className="text-right py-2.5 tabular-nums">${fmt(data.totalValueUsd)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Unpriced assets */}
        {unpricedTokens.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-2">Other Assets (No Market Price)</p>
            <table className="w-full text-[12px] text-on-surface-variant">
              <thead>
                <tr className="text-[9px] uppercase tracking-wide border-b border-outline-variant">
                  <th className="text-left font-normal py-2">Asset</th>
                  <th className="text-right font-normal py-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {unpricedTokens.map(t => (
                  <tr key={t.contractAddress} className="border-b border-outline-variant/30">
                    <td className="py-2">{t.name} ({t.symbol})</td>
                    <td className="text-right py-2 tabular-nums">{t.balanceFormatted.toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Transactions */}
        {!isBs && txs.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">
              {isIs ? "Income Transactions" : "Transaction History"}
            </p>
            <p className="text-[9px] italic text-on-surface-variant/60 mb-2">{priceLabel}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] min-w-[500px]">
                <thead>
                  <tr className="text-[9px] uppercase tracking-wide text-on-surface-variant border-b border-outline-variant">
                    <th className="text-left font-normal py-2">Date</th>
                    <th className="text-left font-normal py-2">Description</th>
                    <th className="text-left font-normal py-2">Counterparty</th>
                    <th className="text-left font-normal py-2">Type</th>
                    <th className="text-right font-normal py-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.slice(0, 100).map((tx, i) => (
                    <tr key={`${tx.hash}-${i}`} className="border-b border-outline-variant/30">
                      <td className="py-2 whitespace-nowrap text-on-surface-variant">
                        {new Date(tx.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                      </td>
                      <td className="py-2">{tx.description}</td>
                      <td className="py-2 font-mono text-on-surface-variant">{tx.type === "receive" ? shortAddr(tx.from) : shortAddr(tx.to)}</td>
                      <td className="py-2 text-on-surface-variant">
                        {tx.type === "contract"
                          ? (tx.description.toLowerCase().includes("swap") ? "Swap" : "Action")
                          : tx.type === "receive" ? "In" : "Out"}
                      </td>
                      <td className="py-2 text-right tabular-nums">{tx.valueUsd > 0 ? `$${fmt(tx.valueUsd)}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {txs.length > 100 && (
              <p className="text-[10px] text-on-surface-variant mt-2">
                Showing 100 of {(data.totalTransactionCount || txs.length).toLocaleString()} transactions
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-outline-variant pt-4 flex flex-col sm:flex-row justify-between gap-2 text-[9px] text-on-surface-variant">
          <span>Statement {statementId} · {fmtDate(data.generatedAt)}</span>
          <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="text-brand-navy hover:underline font-mono break-all">
            {verifyUrl.replace("https://", "").replace("http://", "")}
          </a>
        </div>
      </div>
    </div>
  );
}
