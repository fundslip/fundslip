import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { StatementData } from "@/types";
import QRCode from "qrcode";
import { getLogoDataUrl } from "./logo";

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function shortAddr(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

type C3 = [number, number, number];
const NAVY: C3 = [0, 52, 153];
const BLACK: C3 = [29, 29, 31];
const GRAY: C3 = [134, 134, 139];
const LIGHT_GRAY: C3 = [162, 162, 167];
const LINE: C3 = [229, 229, 234];
const BG: C3 = [245, 245, 247];
const GREEN: C3 = [5, 150, 105];
const GREEN_ACCENT: C3 = [133, 248, 196];
const RED: C3 = [220, 38, 38];
const WHITE: C3 = [255, 255, 255];

function typeTitle(type: string): string {
  if (type === "balance-snapshot") return "Balance Snapshot";
  if (type === "income-summary") return "Income Statement";
  return "Full Transaction History";
}

export async function generatePdfBlob(
  data: StatementData, hash: string, sid: string, verifyUrl: string
): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const m = 22;
  const cw = W - m * 2;
  let y = m;

  const isBs = data.statementType === "balance-snapshot";
  const isIs = data.statementType === "income-summary";
  const net = data.networkName || "Ethereum Mainnet";
  const pName = data.personalDetails?.fullName;
  const pAddr = data.personalDetails?.address;

  // ── HEADER ──
  try {
    const logoUrl = await getLogoDataUrl();
    if (logoUrl) doc.addImage(logoUrl, "PNG", m, y, 7, 8.5);
  } catch { /* */ }

  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...BLACK);
  doc.text("Fundslip", m + 10, y + 5);
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
  doc.text(typeTitle(data.statementType), m + 10, y + 9);

  // Verified badge — pill
  const badgeText = "VERIFIED";
  doc.setFontSize(5); doc.setFont("helvetica", "bold");
  const bw = doc.getTextWidth(badgeText) + 5;
  const bx = W - m - bw;
  doc.setFillColor(...GREEN_ACCENT);
  doc.roundedRect(bx, y + 0.5, bw, 5, 2.5, 2.5, "F");
  doc.setTextColor(5, 80, 55);
  doc.text(badgeText, bx + 2.5, y + 3.8);

  const dateTime = `${fmtDate(data.generatedAt)} at ${data.generatedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`;
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
  doc.text(dateTime, W - m, y + 10, { align: "right" });

  y += 16;
  doc.setDrawColor(...LINE); doc.setLineWidth(0.25);
  doc.line(m, y, W - m, y);
  y += 6;

  // ── ACCOUNT ROW ──
  const cols = [
    { label: "Account", value: data.ensName || shortAddr(data.walletAddress) },
    ...(pName ? [{ label: "Name", value: pName }] : []),
    { label: "Network", value: net },
    { label: "Block", value: `#${data.blockNumber.toLocaleString()}` },
  ];
  const colW = cw / cols.length;
  cols.forEach((col, i) => {
    const x = m + i * colW;
    doc.setFontSize(5.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
    doc.text(col.label.toUpperCase(), x, y);
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...BLACK);
    doc.text(col.value, x, y + 4.5);
  });
  y += 10;

  if (pAddr) {
    doc.setFontSize(5.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
    doc.text("ADDRESS", m, y);
    doc.setFontSize(8); doc.setTextColor(...BLACK);
    doc.text(pAddr, m, y + 4.5);
    y += 10;
  }

  if (!isBs) {
    doc.setFontSize(5.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
    doc.text("STATEMENT PERIOD", m, y);
    doc.setFontSize(8.5); doc.setTextColor(...BLACK);
    doc.text(`${fmtDate(data.periodStart)} – ${fmtDate(data.periodEnd)}`, m, y + 4.5);
    y += 10;
  }

  // ── NET WORTH ──
  y += 2;
  doc.setFillColor(...BG); doc.roundedRect(m, y, cw, 20, 3, 3, "F");
  doc.setFontSize(5.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
  doc.text("TOTAL NET WORTH (USD)", m + 5, y + 6);
  doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.setTextColor(...NAVY);
  doc.text(`$${fmt(data.totalValueUsd)}`, m + 5, y + 15);
  y += 26;

  // ── HOLDINGS ──
  doc.setFontSize(5.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
  doc.text("DIGITAL ASSET HOLDINGS", m, y); y += 3;

  const hBody: string[][] = [];
  if (data.ethBalance > 0) hBody.push(["Ethereum (ETH)", data.ethBalance.toFixed(4), `$${fmt(data.ethPriceUsd)}`, `$${fmt(data.ethValueUsd)}`]);
  for (const t of data.tokens.filter(t => t.valueUsd > 0.01))
    hBody.push([`${t.name} (${t.symbol})`, t.balanceFormatted.toLocaleString("en-US", { maximumFractionDigits: 4 }), `$${fmt(t.priceUsd)}`, `$${fmt(t.valueUsd)}`]);
  if (hBody.length === 0) hBody.push(["No assets found", "—", "—", "$0.00"]);

  autoTable(doc, {
    startY: y, margin: { left: m, right: m },
    head: [["Asset", "Quantity", "Unit Price", "Total Value"]],
    body: hBody,
    foot: [["", "", "Total", `$${fmt(data.totalValueUsd)}`]],
    styles: { fontSize: 7.5, cellPadding: 2.5, textColor: BLACK, lineColor: LINE, lineWidth: 0.15 },
    headStyles: { fillColor: WHITE, textColor: GRAY, fontSize: 5.5, fontStyle: "normal", cellPadding: 2 },
    footStyles: { fillColor: BG, textColor: NAVY, fontStyle: "bold", fontSize: 7.5 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
    theme: "plain",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── TRANSACTIONS ──
  if (!isBs) {
    const allTxs = data.transactions.filter(t => t.valueUsd > 0 || t.type === "send");
    const txs = isIs ? allTxs.filter(t => t.type === "receive") : allTxs;

    if (txs.length > 0) {
      const recv = allTxs.filter(t => t.type === "receive").reduce((s, t) => s + t.valueUsd, 0);
      const sent = allTxs.filter(t => t.type === "send").reduce((s, t) => s + t.valueUsd, 0);

      if (isIs) {
        doc.setFontSize(5.5); doc.setTextColor(...GRAY); doc.text("TOTAL INCOME", m, y); y += 4;
        doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(...GREEN);
        doc.text(`$${fmt(recv)}`, m, y);
        doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
        doc.text(`${txs.length} transaction${txs.length !== 1 ? "s" : ""}`, m + 45, y);
        y += 10;
      } else {
        const bw = (cw - 6) / 3;
        ([
          { l: "RECEIVED", v: `$${fmt(recv)}`, c: GREEN },
          { l: "SENT", v: `$${fmt(sent)}`, c: RED },
          { l: "NET CHANGE", v: `$${fmt(recv - sent)}`, c: BLACK },
        ] as const).forEach((b, i) => {
          const x = m + i * (bw + 3);
          doc.setFillColor(...BG); doc.roundedRect(x, y, bw, 14, 2, 2, "F");
          doc.setFontSize(5.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
          doc.text(b.l, x + 3, y + 5);
          doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...b.c);
          doc.text(b.v, x + 3, y + 11);
        });
        y += 20;
      }

      if (y > H - 55) { doc.addPage(); y = m; }
      doc.setFontSize(5.5); doc.setTextColor(...GRAY); doc.text(isIs ? "INCOME TRANSACTIONS" : "TRANSACTION HISTORY", m, y); y += 2;
      doc.setFontSize(4.5); doc.setFont("helvetica", "italic"); doc.setTextColor(...LIGHT_GRAY);
      doc.text("USD values reflect prices at time of generation, not at time of transaction.", m, y);
      y += 4;

      autoTable(doc, {
        startY: y, margin: { left: m, right: m },
        head: [["Date", "Description", isIs ? "From" : "Counterparty", "Type", "Value"]],
        body: txs.slice(0, 100).map(tx => [
          new Date(tx.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
          tx.description,
          tx.type === "receive" ? shortAddr(tx.from) : shortAddr(tx.to),
          tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
          tx.valueUsd > 0 ? `$${fmt(tx.valueUsd)}` : "—",
        ]),
        styles: { fontSize: 6.5, cellPadding: 2, textColor: BLACK, lineColor: LINE, lineWidth: 0.1, overflow: "ellipsize" },
        headStyles: { fillColor: WHITE, textColor: GRAY, fontSize: 5.5, fontStyle: "normal", cellPadding: 1.5 },
        columnStyles: { 4: { halign: "right" } },
        theme: "plain",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 3;
      if (txs.length > 100) {
        doc.setFontSize(5.5); doc.setTextColor(...LIGHT_GRAY);
        doc.text(`Showing 100 of ${(data.totalTransactionCount || txs.length).toLocaleString()} transactions`, m, y); y += 3;
      }
    } else {
      doc.setFontSize(5.5); doc.setTextColor(...GRAY); doc.text(isIs ? "INCOME TRANSACTIONS" : "TRANSACTION HISTORY", m, y); y += 5;
      doc.setFillColor(...BG); doc.roundedRect(m, y, cw, 10, 2, 2, "F");
      doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...GRAY);
      doc.text("No transactions found for this period.", m + 4, y + 6.5);
      y += 16;
    }
  }

  // ── VERIFICATION FOOTER ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastY = (doc as any).lastAutoTable?.finalY || y;
  let fy = H - 40;
  if (lastY > fy - 8) { doc.addPage(); fy = H - 40; }

  doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(m, fy, W - m, fy);
  fy += 3;

  const qrUrl = verifyUrl || "https://fundslip.xyz/verify";
  try {
    const qr = await QRCode.toDataURL(qrUrl, { width: 240, margin: 1, color: { dark: "#1d1d1f", light: "#ffffff" } });
    doc.addImage(qr, "PNG", m, fy + 1, 18, 18);
  } catch { /* */ }

  const tx = m + 22;
  doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(...BLACK);
  doc.text("Verify this statement", tx, fy + 4);
  doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.setTextColor(...NAVY);
  doc.textWithLink("fundslip.xyz/verify", tx, fy + 8.5, { url: qrUrl });
  doc.setTextColor(...GRAY); doc.setFontSize(5.5);
  doc.text("Upload this PDF or scan the QR code.", tx, fy + 13);

  doc.setFont("helvetica", "normal"); doc.setFontSize(5); doc.setTextColor(...GRAY);
  doc.text("FINGERPRINT", tx, fy + 18);
  doc.setFont("courier", "normal"); doc.setFontSize(4.5); doc.setTextColor(...BLACK);
  const fp = hash || "";
  const maxFpW = cw - 24;
  if (doc.getTextWidth(fp) > maxFpW && fp.length > 40) {
    doc.text(`${fp.slice(0, 28)}…${fp.slice(-28)}`, tx, fy + 22);
  } else {
    doc.text(fp, tx, fy + 22);
  }

  doc.setFont("helvetica", "normal"); doc.setFontSize(4.5); doc.setTextColor(...LIGHT_GRAY);
  doc.text("Cryptographically signed. Independently verifiable against Ethereum.", tx, fy + 27);

  // Page footer
  const pfy = H - 8;
  doc.setFontSize(5); doc.setTextColor(...LIGHT_GRAY); doc.setFont("helvetica", "normal");
  doc.text("Generated by Fundslip — fundslip.xyz", m, pfy);
  doc.text(dateTime, W - m, pfy, { align: "right" });

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
