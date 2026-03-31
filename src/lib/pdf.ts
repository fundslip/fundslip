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

// ── Colors — exact same as preview C object ──

type C3 = [number, number, number];
const NAVY: C3 = [0, 52, 153];
const BLACK: C3 = [29, 29, 31];
const GRAY: C3 = [134, 134, 139];
const LIGHT: C3 = [162, 162, 167];
const RULE: C3 = [229, 229, 234];
const SURFACE: C3 = [245, 245, 247];
const WHITE: C3 = [255, 255, 255];
const EMERALD: C3 = [133, 248, 196];

// ── Drawing helpers ──

function label(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFontSize(5.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
  doc.text(text.toUpperCase(), x, y);
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
  const L = 24;
  const R = W - 24;
  const CW = R - L;
  let y = 22;

  const isBs = data.statementType === "balance-snapshot";
  const isIs = data.statementType === "income-summary";
  const net = data.networkName || "Ethereum Mainnet";
  const name = data.personalDetails?.fullName;
  const addr = data.personalDetails?.address;
  const dateTime = `${fmtDate(data.generatedAt)} at ${data.generatedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`;

  // ════════════════════════════════════════════
  // HEADER — logo + brand + report label + verified pill
  // ════════════════════════════════════════════

  try {
    const logoUrl = await getLogoDataUrl();
    if (logoUrl) doc.addImage(logoUrl, "PNG", L, y - 1, 5, 6.5);
  } catch { /* */ }

  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...BLACK);
  doc.text("Fundslip", L + 8, y + 3);

  doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(...GRAY);
  doc.text("Asset Verification Report", L + 27, y + 3);

  // VERIFIED pill
  doc.setFontSize(4.5); doc.setFont("helvetica", "bold");
  const badge = "VERIFIED";
  const bw = doc.getTextWidth(badge) + 4;
  doc.setFillColor(...EMERALD);
  doc.roundedRect(R - bw, y + 0.5, bw, 4, 2, 2, "F");
  doc.setTextColor(...NAVY);
  doc.text(badge, R - bw + 2, y + 3);

  y += 8;
  rule(doc, L, y, R);
  y += 6;

  // ════════════════════════════════════════════
  // TITLE + DATE
  // ════════════════════════════════════════════

  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(...BLACK);
  doc.text(typeTitle(data.statementType), L, y);
  y += 3.5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(...GRAY);
  doc.text(dateTime, L, y);
  y += 8;

  // ════════════════════════════════════════════
  // DETAILS GRID
  // ════════════════════════════════════════════

  const details: { l: string; v: string; mono?: boolean }[] = [
    { l: "Account", v: data.ensName || shortAddr(data.walletAddress), mono: true },
    { l: "Network", v: net },
    { l: "Block", v: `#${data.blockNumber.toLocaleString()}` },
  ];
  if (name) details.push({ l: "Name", v: name });
  if (!isBs) details.push({ l: "Period", v: `${fmtDateShort(data.periodStart)} – ${fmtDateShort(data.periodEnd)}` });

  const cols = Math.min(details.length, 4);
  const colW = CW / cols;
  details.forEach((d, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x = L + col * colW;
    const dy = y + row * 9;
    label(doc, d.l, x, dy);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK);
    if (d.mono) doc.setFont("courier", "normal");
    doc.text(d.v, x, dy + 3.5);
  });
  y += Math.ceil(details.length / 4) * 9 + 2;

  if (addr) {
    label(doc, "Address", L, y);
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK);
    doc.text(addr, L, y + 3.5);
    y += 9;
  }

  // ════════════════════════════════════════════
  // NET WORTH — rounded box matching preview
  // ════════════════════════════════════════════

  doc.setFillColor(...SURFACE);
  doc.roundedRect(L, y, CW, 14, 2, 2, "F");
  label(doc, "Total Net Worth (USD)", L + 4, y + 4.5);
  doc.setFontSize(15); doc.setFont("helvetica", "bold"); doc.setTextColor(...NAVY);
  doc.text(`$${fmt(data.totalValueUsd)}`, L + 4, y + 10.5);
  y += 20;

  // ════════════════════════════════════════════
  // HOLDINGS TABLE
  // ════════════════════════════════════════════

  label(doc, "Digital Asset Holdings", L, y);
  y += 3;

  const pricedTokens = data.tokens.filter(t => t.valueUsd > 0.01);
  const unpricedCount = data.tokens.length - pricedTokens.length;
  const holdings: string[][] = [];
  if (data.ethBalance > 0) {
    holdings.push(["Ethereum (ETH)", data.ethBalance.toFixed(4), `$${fmt(data.ethPriceUsd)}`, `$${fmt(data.ethValueUsd)}`]);
  }
  for (const t of pricedTokens) {
    holdings.push([
      `${t.name} (${t.symbol})`,
      t.balanceFormatted.toLocaleString("en-US", { maximumFractionDigits: 4 }),
      `$${fmt(t.priceUsd)}`, `$${fmt(t.valueUsd)}`,
    ]);
  }
  if (holdings.length === 0) holdings.push(["No assets found", "—", "—", "$0.00"]);

  autoTable(doc, {
    startY: y,
    margin: { left: L, right: 24 },
    head: [["Asset", "Quantity", "Unit Price", "Value"]],
    body: holdings,
    foot: [["", "", "Total", `$${fmt(data.totalValueUsd)}`]],
    styles: { fontSize: 7, cellPadding: { top: 2, right: 1, bottom: 2, left: 1 }, textColor: BLACK, lineColor: [...RULE, 80] as unknown as C3, lineWidth: 0.1 },
    headStyles: { fillColor: WHITE, textColor: GRAY, fontSize: 5.5, fontStyle: "normal", cellPadding: { top: 1.5, right: 1, bottom: 1.5, left: 1 } },
    footStyles: { fillColor: SURFACE, textColor: NAVY, fontStyle: "bold", fontSize: 7 },
    columnStyles: { 0: { cellWidth: "auto" }, 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
    theme: "plain",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 2.5;

  // Price label + unpriced tokens footnote
  doc.setFontSize(4.5); doc.setFont("helvetica", "italic"); doc.setTextColor(...LIGHT);
  const holdingsPriceLabel = data.isHistoricalPricing && data.priceDate
    ? `USD values reflect prices as of ${data.priceDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (period end date).`
    : "USD values reflect prices at time of generation.";
  doc.text(holdingsPriceLabel, L, y);
  y += 2.5;
  if (unpricedCount > 0) {
    doc.text(`${unpricedCount} additional token${unpricedCount !== 1 ? "s" : ""} held with no market value.`, L, y);
    y += 2.5;
  }
  y += 5;

  // ════════════════════════════════════════════
  // TRANSACTIONS
  // ════════════════════════════════════════════

  if (!isBs) {
    const displayTxs = processForDisplay(data.transactions);
    const allTxs = displayTxs.filter(t => t.valueUsd > 0 || t.type === "send" || t.type === "contract");
    const txs = isIs ? displayTxs.filter(t => t.type === "receive") : allTxs;

    if (txs.length > 0) {
      const recv = allTxs.filter(t => t.type === "receive").reduce((s, t) => s + t.valueUsd, 0);
      const sent = allTxs.filter(t => t.type === "send" || t.type === "contract").reduce((s, t) => s + t.valueUsd, 0);

      if (isIs) {
        label(doc, "Total Income", L, y);
        y += 3.5;
        doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(...NAVY);
        doc.text(`$${fmt(recv)}`, L, y);
        doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
        doc.text(`${txs.length} transaction${txs.length !== 1 ? "s" : ""}`, L + 35, y);
        y += 7;
      } else {
        // Received / Sent / Net summary boxes — matching preview layout
        const boxW = (CW - 3) / 3;
        const boxH = 11;
        const boxes = [
          { l: "Received", v: `$${fmt(recv)}` },
          { l: "Sent", v: `$${fmt(sent)}` },
          { l: "Net", v: `$${fmt(recv - sent)}` },
        ];
        boxes.forEach((b, i) => {
          const x = L + i * (boxW + 1.5);
          doc.setFillColor(...SURFACE);
          doc.roundedRect(x, y, boxW, boxH, 1.5, 1.5, "F");
          label(doc, b.l, x + 3, y + 3.5);
          doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(...BLACK);
          doc.text(b.v, x + 3, y + 8);
        });
        y += boxH + 5;
      }

      if (y > H - 50) { doc.addPage(); y = 22; }

      label(doc, isIs ? "Income Transactions" : "Transaction History", L, y);
      y += 2.5;
      doc.setFontSize(4.5); doc.setFont("helvetica", "italic"); doc.setTextColor(...LIGHT);
      const priceLabel = data.isHistoricalPricing && data.priceDate
        ? `USD values reflect prices as of ${data.priceDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (period end date).`
        : "USD values reflect prices at time of generation.";
      doc.text(priceLabel, L, y);
      y += 3;

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
        styles: { fontSize: 6, cellPadding: { top: 1.5, right: 1, bottom: 1.5, left: 1 }, textColor: BLACK, lineColor: [...RULE, 50] as unknown as C3, lineWidth: 0.08, overflow: "ellipsize" },
        headStyles: { fillColor: WHITE, textColor: GRAY, fontSize: 5, fontStyle: "normal", cellPadding: { top: 1.5, right: 1, bottom: 1.5, left: 1 } },
        columnStyles: { 0: { cellWidth: 22 }, 2: { cellWidth: 22, font: "courier", fontSize: 5.5 }, 3: { cellWidth: 12 }, 4: { halign: "right", cellWidth: 18 } },
        theme: "plain",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 3;

      if (txs.length > 100) {
        doc.setFontSize(5); doc.setTextColor(...LIGHT);
        doc.text(`Showing 100 of ${(data.totalTransactionCount || txs.length).toLocaleString()} transactions`, L, y);
        y += 3;
      }
    } else {
      label(doc, isIs ? "Income Transactions" : "Transaction History", L, y);
      y += 4;
      doc.setFillColor(...SURFACE);
      doc.roundedRect(L, y, CW, 8, 1.5, 1.5, "F");
      doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
      doc.text("No transactions found for this period.", L + 4, y + 5);
      y += 14;
    }
  }

  // ════════════════════════════════════════════
  // VERIFICATION FOOTER — matches preview layout
  // ════════════════════════════════════════════

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastTableY = (doc as any).lastAutoTable?.finalY || y;
  let fy = H - 30;
  if (lastTableY > fy - 6) { doc.addPage(); fy = H - 30; }

  rule(doc, L, fy, R);
  fy += 4;

  // QR code
  const qrUrl = verifyUrl || "https://fundslip.xyz/verify";
  try {
    const qr = await QRCode.toDataURL(qrUrl, { width: 200, margin: 1, color: { dark: "#1d1d1f", light: "#ffffff" } });
    doc.addImage(qr, "PNG", L, fy, 13, 13);
  } catch { /* */ }

  // Text block — next to QR
  const vx = L + 16;

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BLACK);
  doc.text("Verify this statement", vx, fy + 3);

  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...NAVY);
  doc.textWithLink("fundslip.xyz/verify", vx, fy + 6.5, { url: qrUrl });

  // Fingerprint
  doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); doc.setTextColor(...GRAY);
  doc.text("Fingerprint:", vx, fy + 10);
  doc.setFont("courier", "normal"); doc.setFontSize(5); doc.setTextColor(...BLACK);
  const fp = hash || "";
  doc.text(fp.length > 60 ? `${fp.slice(0, 28)}…${fp.slice(-28)}` : fp, vx + 13, fy + 10);

  // EIP-712 badge — right aligned
  doc.setFillColor(...EMERALD);
  doc.circle(R - 19, fy + 2, 1, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(...GRAY);
  doc.text("EIP-712 Signed", R - 17, fy + 2.8);

  // Page footer
  const pfY = H - 8;
  doc.setFontSize(5.5); doc.setTextColor(...LIGHT); doc.setFont("helvetica", "normal");
  doc.text(`${sid} · ${dateTime}`, L, pfY);
  doc.text("fundslip.xyz", R, pfY, { align: "right" });

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
