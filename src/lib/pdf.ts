import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { StatementData } from "@/types";
import QRCode from "qrcode";
import { getLogoDataUrl } from "./logo";
import { processForDisplay } from "./ethereum";

// ── Helpers ──

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${fmt(n)}`;
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function fmtDateShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function shortAddr(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
function typeTitle(type: string): string {
  if (type === "balance-snapshot") return "Balance Snapshot";
  if (type === "income-summary") return "Income Statement";
  return "Full Transaction History";
}

// ── Colors — 7-color brand palette ──

type C3 = [number, number, number];
const NAVY: C3 = [0, 52, 153];         // #003499 — brand accent
const BLACK: C3 = [29, 29, 31];        // #1d1d1f — primary text
const GRAY: C3 = [134, 134, 139];      // #86868b — secondary text
const LIGHT: C3 = [162, 162, 167];     // lighter gray for captions
const RULE: C3 = [229, 229, 234];      // #e5e5ea — borders
const SURFACE: C3 = [245, 245, 247];   // #f5f5f7 — surface wells
const WHITE: C3 = [255, 255, 255];     // #ffffff
const EMERALD: C3 = [133, 248, 196];   // #85f8c4 — verified accent

// ── Drawing helpers ──

function label(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
  doc.text(text.toUpperCase(), x, y);
}

function value(doc: jsPDF, text: string, x: number, y: number, size = 9, bold = false, color: C3 = BLACK) {
  doc.setFontSize(size); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(...color);
  doc.text(text, x, y);
}

function rule(doc: jsPDF, x1: number, y: number, x2: number) {
  doc.setDrawColor(...RULE); doc.setLineWidth(0.15); doc.line(x1, y, x2, y);
}

export async function generatePdfBlob(
  data: StatementData, hash: string, sid: string, verifyUrl: string
): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const L = 24;           // left margin
  const R = W - 24;       // right edge
  const CW = R - L;       // content width
  let y = 24;

  const isBs = data.statementType === "balance-snapshot";
  const isIs = data.statementType === "income-summary";
  const net = data.networkName || "Ethereum Mainnet";
  const name = data.personalDetails?.fullName;
  const addr = data.personalDetails?.address;
  const dateTime = `${fmtDate(data.generatedAt)} at ${data.generatedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`;

  // ════════════════════════════════════════════
  // HEADER — Logo · Wordmark · Verified badge
  // ════════════════════════════════════════════

  try {
    const logoUrl = await getLogoDataUrl();
    if (logoUrl) doc.addImage(logoUrl, "PNG", L, y - 1, 6.5, 8);
  } catch { /* */ }

  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...BLACK);
  doc.text("Fundslip", L + 9.5, y + 3.5);

  // Subtitle next to wordmark
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...GRAY);
  doc.text("Asset Verification Report", L + 34, y + 3.5);

  // "VERIFIED" pill — right aligned, emerald bg + navy text
  doc.setFontSize(5); doc.setFont("helvetica", "bold");
  const badge = "VERIFIED";
  const bw = doc.getTextWidth(badge) + 5;
  doc.setFillColor(...EMERALD);
  doc.roundedRect(R - bw, y + 0.5, bw, 4.5, 2.25, 2.25, "F");
  doc.setTextColor(...NAVY);
  doc.text(badge, R - bw + 2.5, y + 3.5);

  y += 12;
  rule(doc, L, y, R);
  y += 8;

  // ════════════════════════════════════════════
  // DOCUMENT TITLE
  // ════════════════════════════════════════════

  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(...BLACK);
  doc.text(typeTitle(data.statementType), L, y);
  y += 5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...GRAY);
  doc.text(dateTime, L, y);
  y += 12;

  // ════════════════════════════════════════════
  // ACCOUNT DETAILS — clean label/value grid
  // ════════════════════════════════════════════

  const details: { l: string; v: string }[] = [
    { l: "Account", v: data.ensName || shortAddr(data.walletAddress) },
    { l: "Network", v: net },
    { l: "Block", v: `#${data.blockNumber.toLocaleString()}` },
  ];
  if (name) details.push({ l: "Name", v: name });
  if (!isBs) details.push({ l: "Period", v: `${fmtDateShort(data.periodStart)} – ${fmtDateShort(data.periodEnd)}` });

  const detailColW = CW / Math.min(details.length, 4);
  details.forEach((d, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x = L + col * detailColW;
    const dy = y + row * 11;
    label(doc, d.l, x, dy);
    value(doc, d.v, x, dy + 4.5);
  });
  y += Math.ceil(details.length / 4) * 11 + 2;

  if (addr) {
    label(doc, "Address", L, y);
    value(doc, addr, L, y + 4.5, 8);
    y += 12;
  }

  // ════════════════════════════════════════════
  // NET WORTH — prominent surface well
  // ════════════════════════════════════════════

  doc.setFillColor(...SURFACE);
  doc.roundedRect(L, y, CW, 18, 3, 3, "F");
  label(doc, "Total Net Worth (USD)", L + 5, y + 6);
  doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(...NAVY);
  doc.text(`$${fmt(data.totalValueUsd)}`, L + 5, y + 13.5);
  y += 24;

  // ════════════════════════════════════════════
  // HOLDINGS TABLE
  // ════════════════════════════════════════════

  label(doc, "Digital Asset Holdings", L, y);
  y += 3;

  // Split tokens into priced (with USD value) and unpriced (balance only)
  const pricedTokens = data.tokens.filter(t => t.valueUsd > 0.01);
  const unpricedTokens = data.tokens.filter(t => t.priceUsd === 0 && t.balanceFormatted > 0);

  const holdings: string[][] = [];
  if (data.ethBalance > 0) {
    holdings.push([
      "Ethereum (ETH)",
      data.ethBalance.toFixed(4),
      `$${fmt(data.ethPriceUsd)}`,
      `$${fmt(data.ethValueUsd)}`,
    ]);
  }
  for (const t of pricedTokens) {
    holdings.push([
      `${t.name} (${t.symbol})`,
      t.balanceFormatted.toLocaleString("en-US", { maximumFractionDigits: 4 }),
      `$${fmt(t.priceUsd)}`,
      `$${fmt(t.valueUsd)}`,
    ]);
  }
  if (holdings.length === 0) holdings.push(["No assets found", "—", "—", "$0.00"]);

  autoTable(doc, {
    startY: y,
    margin: { left: L, right: 24 },
    head: [["Asset", "Quantity", "Unit Price", "Value"]],
    body: holdings,
    foot: [["", "", "Total", `$${fmt(data.totalValueUsd)}`]],
    styles: {
      fontSize: 7.5, cellPadding: 2.8,
      textColor: BLACK, lineColor: RULE, lineWidth: 0.1,
    },
    headStyles: {
      fillColor: WHITE, textColor: GRAY,
      fontSize: 6, fontStyle: "normal", cellPadding: 2,
    },
    footStyles: {
      fillColor: SURFACE, textColor: NAVY,
      fontStyle: "bold", fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    theme: "plain",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // Unpriced assets section (tokens without market data)
  if (unpricedTokens.length > 0) {
    label(doc, "Other Assets (No Market Price Available)", L, y);
    y += 3;

    const otherRows: string[][] = unpricedTokens.map(t => [
      `${t.name} (${t.symbol})`,
      t.balanceFormatted.toLocaleString("en-US", { maximumFractionDigits: 4 }),
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: L, right: 24 },
      head: [["Asset", "Quantity"]],
      body: otherRows,
      styles: {
        fontSize: 7, cellPadding: 2.5,
        textColor: GRAY, lineColor: RULE, lineWidth: 0.1,
      },
      headStyles: {
        fillColor: WHITE, textColor: GRAY,
        fontSize: 6, fontStyle: "normal", cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { halign: "right" },
      },
      theme: "plain",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ════════════════════════════════════════════
  // TRANSACTIONS (full-history & income only)
  // ════════════════════════════════════════════

  if (!isBs) {
    const displayTxs = processForDisplay(data.transactions);
    const allTxs = displayTxs.filter(t => t.valueUsd > 0 || t.type === "send" || t.type === "contract");
    const txs = isIs ? displayTxs.filter(t => t.type === "receive") : allTxs;

    if (txs.length > 0) {
      const recv = allTxs.filter(t => t.type === "receive").reduce((s, t) => s + t.valueUsd, 0);
      const sent = allTxs.filter(t => t.type === "send" || t.type === "contract").reduce((s, t) => s + t.valueUsd, 0);

      // Summary boxes
      if (isIs) {
        label(doc, "Total Income", L, y);
        y += 4.5;
        value(doc, `$${fmt(recv)}`, L, y, 14, true, NAVY);
        value(doc, `${txs.length} transaction${txs.length !== 1 ? "s" : ""}`, L + 48, y, 7, false, GRAY);
        y += 10;
      } else {
        const boxW = (CW - 4) / 3;
        const boxes: { l: string; v: string; c: C3 }[] = [
          { l: "Received", v: `$${fmt(recv)}`, c: NAVY },
          { l: "Sent", v: `$${fmt(sent)}`, c: BLACK },
          { l: "Net", v: `$${fmt(recv - sent)}`, c: NAVY },
        ];
        boxes.forEach((b, i) => {
          const x = L + i * (boxW + 2);
          doc.setFillColor(...SURFACE);
          doc.roundedRect(x, y, boxW, 13, 2, 2, "F");
          label(doc, b.l, x + 3, y + 4.5);
          value(doc, b.v, x + 3, y + 10, 9, true, b.c);
        });
        y += 19;
      }

      // Page break if needed
      if (y > H - 50) { doc.addPage(); y = 24; }

      label(doc, isIs ? "Income Transactions" : "Transaction History", L, y);
      y += 2.5;
      doc.setFontSize(4.5); doc.setFont("helvetica", "italic"); doc.setTextColor(...LIGHT);
      const priceLabel = data.isHistoricalPricing && data.priceDate
        ? `USD values reflect prices as of ${data.priceDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (period end date).`
        : "USD values reflect prices at time of generation.";
      doc.text(priceLabel, L, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        margin: { left: L, right: 24 },
        head: [["Date", "Description", isIs ? "From" : "Counterparty", "Type", "Value"]],
        body: txs.slice(0, 100).map(tx => {
          const typeLabel = tx.type === "contract"
            ? (tx.description.toLowerCase().includes("swap") ? "Swap" : "Action")
            : tx.type === "receive" ? "In" : "Out";
          return [
            new Date(tx.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
            tx.description,
            tx.type === "receive" ? shortAddr(tx.from) : shortAddr(tx.to),
            typeLabel,
            tx.valueUsd > 0 ? `$${fmt(tx.valueUsd)}` : "—",
          ];
        }),
        styles: {
          fontSize: 6.5, cellPadding: 2.2,
          textColor: BLACK, lineColor: RULE, lineWidth: 0.08,
          overflow: "ellipsize",
        },
        headStyles: {
          fillColor: WHITE, textColor: GRAY,
          fontSize: 5.5, fontStyle: "normal", cellPadding: 1.5,
        },
        columnStyles: { 4: { halign: "right" } },
        theme: "plain",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 3;

      if (txs.length > 100) {
        doc.setFontSize(5.5); doc.setTextColor(...LIGHT);
        const total = data.totalTransactionCount || txs.length;
        doc.text(`Showing 100 of ${total.toLocaleString()} transactions`, L, y);
        y += 3;
      }
    } else {
      label(doc, isIs ? "Income Transactions" : "Transaction History", L, y);
      y += 5;
      doc.setFillColor(...SURFACE);
      doc.roundedRect(L, y, CW, 9, 2, 2, "F");
      value(doc, "No transactions found for this period.", L + 4, y + 6, 7, false, GRAY);
      y += 15;
    }
  }

  // ════════════════════════════════════════════
  // VERIFICATION FOOTER
  // ════════════════════════════════════════════

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastTableY = (doc as any).lastAutoTable?.finalY || y;
  let fy = H - 38;
  if (lastTableY > fy - 6) { doc.addPage(); fy = H - 38; }

  rule(doc, L, fy, R);
  fy += 5;

  // QR code
  const qrUrl = verifyUrl || "https://fundslip.xyz/verify";
  try {
    const qr = await QRCode.toDataURL(qrUrl, {
      width: 200, margin: 1,
      color: { dark: "#1d1d1f", light: "#ffffff" },
    });
    doc.addImage(qr, "PNG", L, fy, 16, 16);
  } catch { /* */ }

  const vx = L + 20;

  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...BLACK);
  doc.text("Verify this statement", vx, fy + 4);

  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...NAVY);
  doc.textWithLink("fundslip.xyz/verify", vx, fy + 8.5, { url: qrUrl });

  doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); doc.setTextColor(...GRAY);
  doc.text("Upload this PDF or scan the QR code to verify.", vx, fy + 12.5);

  // Fingerprint
  label(doc, "Statement Fingerprint", vx, fy + 17);
  doc.setFont("courier", "normal"); doc.setFontSize(4); doc.setTextColor(...BLACK);
  const fp = hash || "";
  const maxFpW = CW - 22;
  if (doc.getTextWidth(fp) > maxFpW && fp.length > 50) {
    doc.text(`${fp.slice(0, 30)}…${fp.slice(-30)}`, vx, fy + 20.5);
  } else {
    doc.text(fp, vx, fy + 20.5);
  }

  doc.setFont("helvetica", "normal"); doc.setFontSize(4); doc.setTextColor(...LIGHT);
  doc.text("Cryptographically signed by the wallet owner. Independently verifiable against Ethereum.", vx, fy + 24);

  // EIP-712 badge — small emerald dot + text
  doc.setFillColor(...EMERALD);
  doc.circle(R - 25, fy + 3.5, 1.2, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(5); doc.setTextColor(...GRAY);
  doc.text("EIP-712 Signed", R - 22.5, fy + 4.5);

  // ── Page footer ──
  const pfY = H - 8;
  doc.setFontSize(5); doc.setTextColor(...LIGHT); doc.setFont("helvetica", "normal");
  doc.text("Fundslip — fundslip.xyz", L, pfY);
  doc.text(dateTime, R, pfY, { align: "right" });

  return doc.output("blob");
}

export function downloadPdf(pdfBlobUrl: string, statementId: string) {
  const a = document.createElement("a");
  a.href = pdfBlobUrl;
  a.download = `fundslip-statement-${statementId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
