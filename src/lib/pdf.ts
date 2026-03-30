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

// ── Colors — matching preview C object ──

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
  doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
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
  let y = 24;

  const isBs = data.statementType === "balance-snapshot";
  const isIs = data.statementType === "income-summary";
  const net = data.networkName || "Ethereum Mainnet";
  const name = data.personalDetails?.fullName;
  const addr = data.personalDetails?.address;
  const dateTime = `${fmtDate(data.generatedAt)} at ${data.generatedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`;

  // ════════════════════════════════════════════
  // HEADER — matches preview exactly
  // ════════════════════════════════════════════

  try {
    const logoUrl = await getLogoDataUrl();
    if (logoUrl) doc.addImage(logoUrl, "PNG", L, y - 1, 6, 7.5);
  } catch { /* */ }

  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...BLACK);
  doc.text("Fundslip", L + 9, y + 3.5);

  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...GRAY);
  doc.text("Asset Verification Report", L + 33, y + 3.5);

  // VERIFIED pill
  doc.setFontSize(5); doc.setFont("helvetica", "bold");
  const badge = "VERIFIED";
  const bw = doc.getTextWidth(badge) + 4;
  doc.setFillColor(...EMERALD);
  doc.roundedRect(R - bw, y + 0.8, bw, 4, 2, 2, "F");
  doc.setTextColor(...NAVY);
  doc.text(badge, R - bw + 2, y + 3.3);

  y += 10;
  rule(doc, L, y, R);
  y += 7;

  // ════════════════════════════════════════════
  // TITLE
  // ════════════════════════════════════════════

  doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.setTextColor(...BLACK);
  doc.text(typeTitle(data.statementType), L, y);
  y += 4;
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...GRAY);
  doc.text(dateTime, L, y);
  y += 10;

  // ════════════════════════════════════════════
  // DETAILS GRID
  // ════════════════════════════════════════════

  const details: { l: string; v: string }[] = [
    { l: "Account", v: data.ensName || shortAddr(data.walletAddress) },
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
    const dy = y + row * 10;
    label(doc, d.l, x, dy);
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK);
    doc.text(d.v, x, dy + 4);
  });
  y += Math.ceil(details.length / 4) * 10 + 2;

  if (addr) {
    label(doc, "Address", L, y);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK);
    doc.text(addr, L, y + 4);
    y += 10;
  }

  // ════════════════════════════════════════════
  // NET WORTH
  // ════════════════════════════════════════════

  doc.setFillColor(...SURFACE);
  doc.roundedRect(L, y, CW, 16, 2.5, 2.5, "F");
  label(doc, "Total Net Worth (USD)", L + 4, y + 5);
  doc.setFontSize(17); doc.setFont("helvetica", "bold"); doc.setTextColor(...NAVY);
  doc.text(`$${fmt(data.totalValueUsd)}`, L + 4, y + 12);
  y += 22;

  // ════════════════════════════════════════════
  // HOLDINGS TABLE
  // ════════════════════════════════════════════

  label(doc, "Digital Asset Holdings", L, y);
  y += 3;

  const pricedTokens = data.tokens.filter(t => t.valueUsd > 0.01);
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
    styles: { fontSize: 7.5, cellPadding: 2.5, textColor: BLACK, lineColor: RULE, lineWidth: 0.1 },
    headStyles: { fillColor: WHITE, textColor: GRAY, fontSize: 6, fontStyle: "normal", cellPadding: 2 },
    footStyles: { fillColor: SURFACE, textColor: NAVY, fontStyle: "bold", fontSize: 7.5 },
    columnStyles: { 0: { cellWidth: "auto" }, 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
    theme: "plain",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 7;

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
        y += 4;
        doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(...NAVY);
        doc.text(`$${fmt(recv)}`, L, y);
        doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
        doc.text(`${txs.length} transaction${txs.length !== 1 ? "s" : ""}`, L + 40, y);
        y += 8;
      } else {
        const boxW = (CW - 4) / 3;
        const boxes = [
          { l: "Received", v: `$${fmt(recv)}` },
          { l: "Sent", v: `$${fmt(sent)}` },
          { l: "Net", v: `$${fmt(recv - sent)}` },
        ];
        boxes.forEach((b, i) => {
          const x = L + i * (boxW + 2);
          doc.setFillColor(...SURFACE);
          doc.roundedRect(x, y, boxW, 12, 2, 2, "F");
          label(doc, b.l, x + 3, y + 4);
          doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...BLACK);
          doc.text(b.v, x + 3, y + 9);
        });
        y += 17;
      }

      if (y > H - 50) { doc.addPage(); y = 24; }

      label(doc, isIs ? "Income Transactions" : "Transaction History", L, y);
      y += 2.5;
      doc.setFontSize(4.5); doc.setFont("helvetica", "italic"); doc.setTextColor(...LIGHT);
      const priceLabel = data.isHistoricalPricing && data.priceDate
        ? `USD values reflect prices as of ${data.priceDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (period end date).`
        : "USD values reflect prices at time of generation.";
      doc.text(priceLabel, L, y);
      y += 3.5;

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
        styles: { fontSize: 6.5, cellPadding: 2, textColor: BLACK, lineColor: RULE, lineWidth: 0.08, overflow: "ellipsize" },
        headStyles: { fillColor: WHITE, textColor: GRAY, fontSize: 5.5, fontStyle: "normal", cellPadding: 1.5 },
        columnStyles: { 4: { halign: "right" } },
        theme: "plain",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 3;

      if (txs.length > 100) {
        doc.setFontSize(5.5); doc.setTextColor(...LIGHT);
        doc.text(`Showing 100 of ${(data.totalTransactionCount || txs.length).toLocaleString()} transactions`, L, y);
        y += 3;
      }
    } else {
      label(doc, isIs ? "Income Transactions" : "Transaction History", L, y);
      y += 5;
      doc.setFillColor(...SURFACE);
      doc.roundedRect(L, y, CW, 9, 2, 2, "F");
      doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
      doc.text("No transactions found for this period.", L + 4, y + 6);
      y += 15;
    }
  }

  // ════════════════════════════════════════════
  // VERIFICATION FOOTER — matches preview exactly
  // ════════════════════════════════════════════

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastTableY = (doc as any).lastAutoTable?.finalY || y;
  let fy = H - 34;
  if (lastTableY > fy - 6) { doc.addPage(); fy = H - 34; }

  rule(doc, L, fy, R);
  fy += 5;

  // QR code
  const qrUrl = verifyUrl || "https://fundslip.xyz/verify";
  try {
    const qr = await QRCode.toDataURL(qrUrl, { width: 200, margin: 1, color: { dark: "#1d1d1f", light: "#ffffff" } });
    doc.addImage(qr, "PNG", L, fy, 14, 14);
  } catch { /* */ }

  // Text block — next to QR
  const vx = L + 18;

  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLACK);
  doc.text("Verify this statement", vx, fy + 3.5);

  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...NAVY);
  doc.textWithLink("fundslip.xyz/verify", vx, fy + 7, { url: qrUrl });

  // Fingerprint
  doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(...GRAY);
  doc.text("Fingerprint:", vx, fy + 11);
  doc.setFont("courier", "normal"); doc.setFontSize(5); doc.setTextColor(...BLACK);
  const fp = hash || "";
  doc.text(fp.length > 60 ? `${fp.slice(0, 28)}…${fp.slice(-28)}` : fp, vx + 14, fy + 11);

  // EIP-712 badge — right
  doc.setFillColor(...EMERALD);
  doc.circle(R - 20, fy + 2.5, 1.2, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...GRAY);
  doc.text("EIP-712 Signed", R - 17.5, fy + 3.5);

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
