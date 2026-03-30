"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut } from "lucide-react";
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
  if (t === "income-summary") return "Income Statement";
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
  const scale = zoom / 100;

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
  const fp = data.walletAddress ? `${statementId}` : "";

  // Details grid — matches PDF exactly
  const details: { l: string; v: string }[] = [
    { l: "Account", v: data.ensName || shortAddr(data.walletAddress) },
    { l: "Network", v: data.networkName || "Ethereum Mainnet" },
    { l: "Block", v: `#${data.blockNumber.toLocaleString()}` },
  ];
  if (data.personalDetails?.fullName) details.push({ l: "Name", v: data.personalDetails.fullName });
  if (!isBs) details.push({ l: "Period", v: `${fmtDateShort(data.periodStart)} – ${fmtDateShort(data.periodEnd)}` });

  return (
    <div className="relative">
      {/* Scrollable frame */}
      <div className="rounded-xl border border-outline-variant overflow-auto bg-[#e8e8ed]" style={{ maxHeight: "80vh" }}>
        {/* Scale wrapper — transform scales both axes uniformly */}
        <div style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${100 / scale}%`,
        }}>
          {/* ═══ The document ═══ */}
          <div className="bg-white mx-auto shadow-sm" style={{ maxWidth: 800, padding: "48px 56px", fontFamily: "Helvetica, Arial, sans-serif" }}>

            {/* HEADER — matches PDF: logo · Fundslip · subtitle · VERIFIED pill */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/fundslip.svg" alt="" width={14} height={18} style={{ height: "auto" }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>Fundslip</span>
                <span style={{ fontSize: 8, color: "#86868b", marginLeft: 4 }}>Asset Verification Report</span>
              </div>
              <span style={{
                fontSize: 7, fontWeight: 700, letterSpacing: "0.05em",
                color: "#003499", backgroundColor: "#85f8c4", padding: "3px 8px", borderRadius: 8,
              }}>VERIFIED</span>
            </div>

            {/* Rule */}
            <div style={{ height: 1, backgroundColor: "#e5e5ea", margin: "14px 0 16px" }} />

            {/* DOCUMENT TITLE — matches PDF */}
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", marginBottom: 4 }}>{typeTitle(data.statementType)}</div>
            <div style={{ fontSize: 9, color: "#86868b", marginBottom: 20 }}>{dateTime}</div>

            {/* ACCOUNT DETAILS — grid matching PDF */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(details.length, 4)}, 1fr)`, gap: "8px 16px", marginBottom: 16 }}>
              {details.map(d => (
                <div key={d.l}>
                  <div style={{ fontSize: 7, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{d.l}</div>
                  <div style={{ fontSize: 10, color: "#1d1d1f", fontFamily: d.l === "Account" ? "monospace" : "inherit" }}>{d.v}</div>
                </div>
              ))}
            </div>

            {data.personalDetails?.address && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 7, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Address</div>
                <div style={{ fontSize: 10, color: "#1d1d1f" }}>{data.personalDetails.address}</div>
              </div>
            )}

            {/* NET WORTH — surface well */}
            <div style={{ backgroundColor: "#f5f5f7", borderRadius: 6, padding: "10px 14px", marginBottom: 20 }}>
              <div style={{ fontSize: 7, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Total Net Worth (USD)</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#003499" }}>${fmt(data.totalValueUsd)}</div>
            </div>

            {/* HOLDINGS TABLE */}
            <div style={{ fontSize: 7, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Digital Asset Holdings</div>
            <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e5ea" }}>
                  <th style={{ textAlign: "left", fontWeight: 400, fontSize: 7, color: "#86868b", padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Asset</th>
                  <th style={{ textAlign: "right", fontWeight: 400, fontSize: 7, color: "#86868b", padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quantity</th>
                  <th style={{ textAlign: "right", fontWeight: 400, fontSize: 7, color: "#86868b", padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Unit Price</th>
                  <th style={{ textAlign: "right", fontWeight: 400, fontSize: 7, color: "#86868b", padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {data.ethBalance > 0 && (
                  <Hrow cells={["Ethereum (ETH)", data.ethBalance.toFixed(4), `$${fmt(data.ethPriceUsd)}`, `$${fmt(data.ethValueUsd)}`]} />
                )}
                {pricedTokens.map(t => (
                  <Hrow key={t.contractAddress} cells={[
                    `${t.name} (${t.symbol})`,
                    t.balanceFormatted.toLocaleString("en-US", { maximumFractionDigits: 4 }),
                    `$${fmt(t.priceUsd)}`,
                    `$${fmt(t.valueUsd)}`,
                  ]} />
                ))}
                {data.ethBalance === 0 && pricedTokens.length === 0 && (
                  <Hrow cells={["No assets found", "—", "—", "$0.00"]} />
                )}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "#f5f5f7" }}>
                  <td colSpan={3} style={{ textAlign: "right", padding: "6px 4px", fontWeight: 700, color: "#003499" }}>Total</td>
                  <td style={{ textAlign: "right", padding: "6px 0", fontWeight: 700, color: "#003499", fontVariantNumeric: "tabular-nums" }}>${fmt(data.totalValueUsd)}</td>
                </tr>
              </tfoot>
            </table>

            {/* UNPRICED ASSETS */}
            {unpricedTokens.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 7, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Other Assets (No Market Price Available)</div>
                <table style={{ width: "100%", fontSize: 8, borderCollapse: "collapse", color: "#86868b" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e5e5ea" }}>
                      <th style={{ textAlign: "left", fontWeight: 400, fontSize: 7, padding: "3px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Asset</th>
                      <th style={{ textAlign: "right", fontWeight: 400, fontSize: 7, padding: "3px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpricedTokens.map(t => (
                      <tr key={t.contractAddress} style={{ borderBottom: "1px solid #e5e5ea30" }}>
                        <td style={{ padding: "4px 0" }}>{t.name} ({t.symbol})</td>
                        <td style={{ textAlign: "right", padding: "4px 0", fontVariantNumeric: "tabular-nums" }}>{t.balanceFormatted.toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TRANSACTIONS */}
            {!isBs && txs.length > 0 && (
              <div style={{ marginTop: 20 }}>
                {isIs ? (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 7, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Total Income</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#003499" }}>${fmt(recv)}</div>
                    <div style={{ fontSize: 8, color: "#86868b" }}>{txs.length} transaction{txs.length !== 1 ? "s" : ""}</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
                    {[{ l: "Received", v: `$${fmt(recv)}` }, { l: "Sent", v: `$${fmt(sent)}` }, { l: "Net", v: `$${fmt(recv - sent)}` }].map(b => (
                      <div key={b.l} style={{ backgroundColor: "#f5f5f7", borderRadius: 4, padding: "6px 10px" }}>
                        <div style={{ fontSize: 7, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 1 }}>{b.l}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1d1d1f", fontVariantNumeric: "tabular-nums" }}>{b.v}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: 7, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                  {isIs ? "Income Transactions" : "Transaction History"}
                </div>
                <div style={{ fontSize: 6, fontStyle: "italic", color: "#a2a2a7", marginBottom: 6 }}>{priceLabel}</div>

                <table style={{ width: "100%", fontSize: 8, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e5e5ea" }}>
                      {["Date", "Description", isIs ? "From" : "Counterparty", "Type", "Value"].map(h => (
                        <th key={h} style={{ textAlign: h === "Value" ? "right" : "left", fontWeight: 400, fontSize: 7, color: "#86868b", padding: "3px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txs.slice(0, 100).map((tx, i) => (
                      <tr key={`${tx.hash}-${i}`} style={{ borderBottom: "1px solid #e5e5ea20" }}>
                        <td style={{ padding: "4px 0", whiteSpace: "nowrap", color: "#86868b" }}>
                          {new Date(tx.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                        </td>
                        <td style={{ padding: "4px 4px" }}>{tx.description}</td>
                        <td style={{ padding: "4px 4px", fontFamily: "monospace", color: "#86868b" }}>{tx.type === "receive" ? shortAddr(tx.from) : shortAddr(tx.to)}</td>
                        <td style={{ padding: "4px 4px", color: "#86868b" }}>
                          {tx.type === "contract" ? (tx.description.toLowerCase().includes("swap") ? "Swap" : "Action") : tx.type === "receive" ? "In" : "Out"}
                        </td>
                        <td style={{ padding: "4px 0", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{tx.valueUsd > 0 ? `$${fmt(tx.valueUsd)}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {txs.length > 100 && (
                  <div style={{ fontSize: 7, color: "#a2a2a7", marginTop: 4 }}>
                    Showing 100 of {(data.totalTransactionCount || txs.length).toLocaleString()} transactions
                  </div>
                )}
              </div>
            )}

            {/* VERIFICATION FOOTER — matches PDF exactly */}
            <div style={{ borderTop: "1px solid #e5e5ea", marginTop: 24, paddingTop: 14, display: "flex", gap: 20 }}>
              {/* Left: verification text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#1d1d1f", marginBottom: 4 }}>Verify this statement</div>
                <a href={verifyUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 8, color: "#003499", textDecoration: "none" }}>
                  {verifyUrl.replace("https://", "").replace("http://", "").split("?")[0]}
                </a>
                <div style={{ fontSize: 7, color: "#86868b", marginTop: 4 }}>Upload this PDF or scan the QR code to verify.</div>

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 7, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Statement Fingerprint</div>
                  <div style={{ fontSize: 5, fontFamily: "monospace", color: "#1d1d1f", wordBreak: "break-all" }}>{fp}</div>
                </div>
                <div style={{ fontSize: 5, color: "#a2a2a7", marginTop: 4 }}>
                  Cryptographically signed by the wallet owner. Independently verifiable against Ethereum.
                </div>
              </div>
              {/* Right: EIP-712 badge */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 4, whiteSpace: "nowrap" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#85f8c4", marginTop: 1 }} />
                <span style={{ fontSize: 7, color: "#86868b" }}>EIP-712 Signed</span>
              </div>
            </div>

            {/* PAGE FOOTER */}
            <div style={{ borderTop: "1px solid #e5e5ea", marginTop: 14, paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 6, color: "#a2a2a7" }}>
              <span>Fundslip — fundslip.xyz</span>
              <span>{dateTime}</span>
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

/* Holdings table row — matches PDF styling */
function Hrow({ cells }: { cells: string[] }) {
  return (
    <tr style={{ borderBottom: "1px solid #e5e5ea50" }}>
      <td style={{ padding: "6px 0" }}>{cells[0]}</td>
      <td style={{ textAlign: "right", padding: "6px 0", fontVariantNumeric: "tabular-nums" }}>{cells[1]}</td>
      <td style={{ textAlign: "right", padding: "6px 0", fontVariantNumeric: "tabular-nums" }}>{cells[2]}</td>
      <td style={{ textAlign: "right", padding: "6px 0", fontVariantNumeric: "tabular-nums" }}>{cells[3]}</td>
    </tr>
  );
}
