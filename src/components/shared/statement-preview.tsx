"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut } from "lucide-react";
import QRCode from "qrcode";
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

// PDF colors
const C = {
  navy: "#003499",
  black: "#1d1d1f",
  gray: "#86868b",
  light: "#a2a2a7",
  rule: "#e5e5ea",
  surface: "#f5f5f7",
  emerald: "#85f8c4",
};

// Shared label style — matches PDF label() helper exactly
const labelStyle: React.CSSProperties = { fontSize: 7, color: C.gray, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 400, marginBottom: 3 };
const valueStyle: React.CSSProperties = { fontSize: 10, color: C.black };
const thStyle: React.CSSProperties = { ...labelStyle, padding: "5px 0", textAlign: "left", fontWeight: 400 };
const thRight: React.CSSProperties = { ...thStyle, textAlign: "right" };

interface Props {
  data: StatementData;
  statementId: string;
  verifyUrl: string;
  fingerprint?: string;
}

export function StatementPreview({ data, statementId, verifyUrl, fingerprint }: Props) {
  const [zoom, setZoom] = useState(100);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const zoomIn = useCallback(() => setZoom(z => Math.min(200, z + 25)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(50, z - 25)), []);
  const scale = zoom / 100;

  // Generate QR code for verify URL
  useEffect(() => {
    if (!verifyUrl) return;
    QRCode.toDataURL(verifyUrl, { width: 200, margin: 1, color: { dark: "#1d1d1f", light: "#ffffff" } })
      .then(setQrDataUrl).catch(() => {});
  }, [verifyUrl]);

  const isBs = data.statementType === "balance-snapshot";
  const isIs = data.statementType === "income-summary";
  const pricedTokens = data.tokens.filter(t => t.valueUsd > 0.01);
  const displayTxs = processForDisplay(data.transactions);
  const txs = isIs ? displayTxs.filter(t => t.type === "receive") : displayTxs.filter(t => t.valueUsd > 0 || t.type === "send" || t.type === "contract");

  const dateTime = `${fmtDate(data.generatedAt)} at ${data.generatedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`;
  const priceLabel = data.isHistoricalPricing && data.priceDate
    ? `USD values reflect prices as of ${fmtDate(data.priceDate)} (period end date).`
    : "USD values reflect prices at time of generation.";
  const recv = txs.filter(t => t.type === "receive").reduce((s, t) => s + t.valueUsd, 0);
  const sent = txs.filter(t => t.type === "send" || t.type === "contract").reduce((s, t) => s + t.valueUsd, 0);

  const details: { l: string; v: string; mono?: boolean }[] = [
    { l: "Account", v: data.ensName || shortAddr(data.walletAddress), mono: true },
    { l: "Network", v: data.networkName || "Ethereum Mainnet" },
    { l: "Block", v: `#${data.blockNumber.toLocaleString()}` },
  ];
  if (data.personalDetails?.fullName) details.push({ l: "Name", v: data.personalDetails.fullName });
  if (!isBs) details.push({ l: "Period", v: `${fmtDateShort(data.periodStart)} – ${fmtDateShort(data.periodEnd)}` });

  return (
    <div className="relative">
      {/* Scrollable frame */}
      <div className="rounded-xl border border-outline-variant overflow-auto bg-[#e8e8ed]" style={{ maxHeight: "80vh" }}>
          {/* The document page — CSS zoom on outer wrapper so scroll container sees correct size */}
          <div style={{ zoom: scale }}>
          <div style={{
            backgroundColor: "#fff",
            width: 760,
            margin: "0 auto",
            padding: "44px 52px",
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            boxShadow: scale < 1 ? "0 1px 4px rgba(0,0,0,0.08)" : undefined,
          }}>

            {/* ── HEADER ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Image src="/fundslip.svg" alt="" width={13} height={17} style={{ height: "auto" }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: C.black }}>Fundslip</span>
                <span style={{ fontSize: 7.5, color: C.gray, marginLeft: 6 }}>Asset Verification Report</span>
              </div>
              <span style={{ fontSize: 6, fontWeight: 700, letterSpacing: "0.06em", color: C.navy, backgroundColor: C.emerald, padding: "2.5px 7px", borderRadius: 7 }}>VERIFIED</span>
            </div>

            <div style={{ height: 1, backgroundColor: C.rule, margin: "12px 0 14px" }} />

            {/* ── TITLE ── */}
            <div style={{ fontSize: 20, fontWeight: 700, color: C.black, marginBottom: 3 }}>{typeTitle(data.statementType)}</div>
            <div style={{ fontSize: 8, color: C.gray, marginBottom: 18 }}>{dateTime}</div>

            {/* ── DETAILS GRID ── */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(details.length, 4)}, 1fr)`, gap: "6px 12px", marginBottom: 14 }}>
              {details.map(d => (
                <div key={d.l}>
                  <div style={labelStyle}>{d.l}</div>
                  <div style={{ ...valueStyle, fontFamily: d.mono ? "'SF Mono', ui-monospace, monospace" : "inherit" }}>{d.v}</div>
                </div>
              ))}
            </div>

            {data.personalDetails?.address && (
              <div style={{ marginBottom: 14 }}>
                <div style={labelStyle}>Address</div>
                <div style={{ fontSize: 9, color: C.black }}>{data.personalDetails.address}</div>
              </div>
            )}

            {/* ── NET WORTH ── */}
            <div style={{ backgroundColor: C.surface, borderRadius: 5, padding: "9px 12px", marginBottom: 18 }}>
              <div style={labelStyle}>Total Net Worth (USD)</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>${fmt(data.totalValueUsd)}</div>
            </div>

            {/* ── HOLDINGS ── */}
            <div style={labelStyle}>Digital Asset Holdings</div>
            <table style={{ width: "100%", fontSize: 8.5, borderCollapse: "collapse", marginBottom: 16 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.rule}` }}>
                  <th style={thStyle}>Asset</th>
                  <th style={thRight}>Quantity</th>
                  <th style={thRight}>Unit Price</th>
                  <th style={thRight}>Value</th>
                </tr>
              </thead>
              <tbody>
                {data.ethBalance > 0 && <Hrow cells={["Ethereum (ETH)", data.ethBalance.toFixed(4), `$${fmt(data.ethPriceUsd)}`, `$${fmt(data.ethValueUsd)}`]} />}
                {pricedTokens.map(t => (
                  <Hrow key={t.contractAddress} cells={[
                    `${t.name} (${t.symbol})`,
                    t.balanceFormatted.toLocaleString("en-US", { maximumFractionDigits: 4 }),
                    `$${fmt(t.priceUsd)}`, `$${fmt(t.valueUsd)}`,
                  ]} />
                ))}
                {data.ethBalance === 0 && pricedTokens.length === 0 && <Hrow cells={["No assets found", "—", "—", "$0.00"]} />}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: C.surface }}>
                  <td colSpan={3} style={{ textAlign: "right", padding: "6px 4px", fontWeight: 700, color: C.navy, fontSize: 8.5 }}>Total</td>
                  <td style={{ textAlign: "right", padding: "6px 0", fontWeight: 700, color: C.navy, fontVariantNumeric: "tabular-nums", fontSize: 8.5 }}>${fmt(data.totalValueUsd)}</td>
                </tr>
              </tfoot>
            </table>

            {/* ── TRANSACTIONS ── */}
            {!isBs && txs.length > 0 && (
              <>
                {isIs ? (
                  <div style={{ marginBottom: 10 }}>
                    <div style={labelStyle}>Total Income</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>${fmt(recv)}</div>
                    <div style={{ fontSize: 8, color: C.gray }}>{txs.length} transaction{txs.length !== 1 ? "s" : ""}</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 12 }}>
                    {[{ l: "Received", v: `$${fmt(recv)}` }, { l: "Sent", v: `$${fmt(sent)}` }, { l: "Net", v: `$${fmt(recv - sent)}` }].map(b => (
                      <div key={b.l} style={{ backgroundColor: C.surface, borderRadius: 4, padding: "5px 8px" }}>
                        <div style={{ fontSize: 6.5, color: C.gray, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>{b.l}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.black, fontVariantNumeric: "tabular-nums" }}>{b.v}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={labelStyle}>{isIs ? "Income Transactions" : "Transaction History"}</div>
                <div style={{ fontSize: 5.5, fontStyle: "italic", color: C.light, marginBottom: 5 }}>{priceLabel}</div>

                <table style={{ width: "100%", fontSize: 7.5, borderCollapse: "collapse", marginBottom: 8 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.rule}` }}>
                      {["Date", "Description", isIs ? "From" : "Counterparty", "Type", "Value"].map((h, i) => (
                        <th key={h} style={{ ...thStyle, fontSize: 6.5, textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txs.slice(0, 100).map((tx, i) => (
                      <tr key={`${tx.hash}-${i}`} style={{ borderBottom: `1px solid ${C.rule}20` }}>
                        <td style={{ padding: "4px 2px 4px 0", whiteSpace: "nowrap", color: C.gray }}>
                          {new Date(tx.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                        </td>
                        <td style={{ padding: "4px 4px" }}>{tx.description}</td>
                        <td style={{ padding: "4px 4px", fontFamily: "monospace", fontSize: 7, color: C.gray }}>{tx.type === "receive" ? shortAddr(tx.from) : shortAddr(tx.to)}</td>
                        <td style={{ padding: "4px 4px", color: C.gray }}>
                          {tx.type === "contract" ? (tx.description.toLowerCase().includes("swap") ? "Swap" : "Action") : tx.type === "receive" ? "In" : "Out"}
                        </td>
                        <td style={{ padding: "4px 0", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{tx.valueUsd > 0 ? `$${fmt(tx.valueUsd)}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {txs.length > 100 && (
                  <div style={{ fontSize: 6.5, color: C.light }}>Showing 100 of {(data.totalTransactionCount || txs.length).toLocaleString()} transactions</div>
                )}
              </>
            )}

            {/* ── VERIFICATION FOOTER — matches PDF exactly ── */}
            <div style={{ borderTop: `1px solid ${C.rule}`, marginTop: 20, paddingTop: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {qrDataUrl && <img src={qrDataUrl} alt="Verify" style={{ width: 48, height: 48, flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.black, lineHeight: 1.2 }}>Verify this statement</div>
                <a href={verifyUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: C.navy, textDecoration: "none", display: "block", marginTop: 2, lineHeight: 1.2 }}>fundslip.xyz/verify</a>
                {fingerprint && (
                  <div style={{ marginTop: 4, lineHeight: 1.2 }}>
                    <span style={{ fontSize: 7.5, color: C.gray }}>Fingerprint: </span>
                    <span style={{ fontSize: 6.5, fontFamily: "'SF Mono', ui-monospace, monospace", color: C.black }}>
                      {fingerprint.length > 60 ? `${fingerprint.slice(0, 28)}…${fingerprint.slice(-28)}` : fingerprint}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.emerald }} />
                <span style={{ fontSize: 8, color: C.gray }}>EIP-712 Signed</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: C.light, marginTop: 8 }}>
              <span>{statementId} · {dateTime}</span>
              <span>fundslip.xyz</span>
            </div>

          </div>
          </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-outline-variant rounded-xl px-2 py-1.5 shadow-sm select-none">
        <button type="button" onClick={zoomOut} disabled={zoom <= 50} className="p-1 hover:bg-surface rounded-lg transition-colors disabled:opacity-30">
          <ZoomOut className="w-3.5 h-3.5 text-on-surface-variant" />
        </button>
        <span className="text-[10px] text-on-surface-variant font-mono w-8 text-center">{zoom}%</span>
        <button type="button" onClick={zoomIn} disabled={zoom >= 200} className="p-1 hover:bg-surface rounded-lg transition-colors disabled:opacity-30">
          <ZoomIn className="w-3.5 h-3.5 text-on-surface-variant" />
        </button>
      </div>
    </div>
  );
}

function Hrow({ cells }: { cells: string[] }) {
  return (
    <tr style={{ borderBottom: `1px solid ${C.rule}50` }}>
      <td style={{ padding: "5px 0" }}>{cells[0]}</td>
      <td style={{ textAlign: "right", padding: "5px 0", fontVariantNumeric: "tabular-nums" }}>{cells[1]}</td>
      <td style={{ textAlign: "right", padding: "5px 0", fontVariantNumeric: "tabular-nums" }}>{cells[2]}</td>
      <td style={{ textAlign: "right", padding: "5px 0", fontVariantNumeric: "tabular-nums" }}>{cells[3]}</td>
    </tr>
  );
}
