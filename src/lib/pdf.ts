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
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

type C3 = [number, number, number];
const NAVY: C3 = [0, 52, 153];
const DARK: C3 = [25, 28, 30];
const MUTED: C3 = [67, 70, 84];
const LIGHT_MUTED: C3 = [116, 118, 134];
const LINE: C3 = [236, 238, 240];
const BG: C3 = [242, 244, 246];
const GREEN: C3 = [0, 71, 48];
const GREEN_BADGE: C3 = [133, 248, 196];
const RED: C3 = [186, 26, 26];

function lbl(d: jsPDF, t: string, x: number, y: number) {
  d.setFontSize(6.5); d.setFont("helvetica", "bold"); d.setTextColor(...MUTED);
  d.text(t.toUpperCase(), x, y);
}
function val(d: jsPDF, t: string, x: number, y: number, fs = 9, bold = false, c: C3 = DARK) {
  d.setFontSize(fs); d.setFont("helvetica", bold ? "bold" : "normal"); d.setTextColor(...c);
  d.text(t, x, y);
}

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
  const m = 20; // margin
  const cw = W - m * 2;
  let y = m;

  const isBs = data.statementType === "balance-snapshot";
  const isIs = data.statementType === "income-summary";
  const net = data.networkName || "Ethereum Mainnet";
  const pName = data.personalDetails?.fullName;
  const pAddr = data.personalDetails?.address;

  // ═══ HEADER ═══
  // Logo image from SVG
  try {
    const logoUrl = await getLogoDataUrl();
    if (logoUrl) doc.addImage(logoUrl, "PNG", m, y, 8.5, 10);
  } catch { /* fallback below */ }

  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(...DARK);
  doc.text("Fundslip", m + 12, y + 5.5);
  doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED);
  doc.text(typeTitle(data.statementType), m + 12, y + 10);

  // Right column — badge, date, ID stacked neatly
  const badgeText = "VERIFIED ON-CHAIN";
  doc.setFontSize(5.5); doc.setFont("helvetica", "bold");
  const badgeW = doc.getTextWidth(badgeText) + 6;
  const badgeX = W - m - badgeW;
  doc.setFillColor(...GREEN_BADGE);
  doc.roundedRect(badgeX, y, badgeW, 6, 3, 3, "F");
  doc.setTextColor(0, 33, 20);
  doc.text(badgeText, badgeX + 3, y + 4);

  doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED);
  const dateTime = `${fmtDate(data.generatedAt)} at ${data.generatedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`;
  doc.text(dateTime, W - m, y + 11, { align: "right" });

  y += 20;
  doc.setDrawColor(...LINE); doc.setLineWidth(0.4);
  doc.line(m, y, W - m, y);
  y += 8;

  // ═══ ACCOUNT INFO ═══
  lbl(doc, "Account", m, y);
  if (pName) { lbl(doc, "Name", m + 55, y); lbl(doc, "Network", W - m - 35, y); }
  else lbl(doc, "Network", m + 55, y);
  y += 4.5;
  val(doc, data.ensName || shortAddr(data.walletAddress), m, y);
  if (pName) { val(doc, pName, m + 55, y); val(doc, net, W - m - 35, y); }
  else val(doc, net, m + 55, y);
  y += 6;

  if (pAddr) { lbl(doc, "Postal Address", m, y); y += 4.5; val(doc, pAddr, m, y, 8); y += 6; }

  // Period (not for snapshot)
  if (!isBs) {
    lbl(doc, "Statement Period", m, y); y += 4.5;
    val(doc, `${fmtDate(data.periodStart)} – ${fmtDate(data.periodEnd)}`, m, y);
    y += 8;
  }

  // ═══ NET WORTH ═══
  doc.setFillColor(...BG); doc.roundedRect(m, y, cw, 24, 2, 2, "F");
  doc.setFillColor(104, 219, 169); doc.rect(m, y, 1.5, 24, "F");
  lbl(doc, "Total Net Worth (USD)", m + 6, y + 7);
  doc.setFontSize(24); doc.setFont("helvetica", "bold"); doc.setTextColor(...NAVY);
  doc.text(`$${fmt(data.totalValueUsd)}`, m + 6, y + 18);
  doc.setFontSize(6); doc.setFont("helvetica", "italic"); doc.setTextColor(...MUTED);
  doc.text(`Block #${data.blockNumber.toLocaleString()}`, m + 6, y + 22);
  y += 30;

  // ═══ HOLDINGS TABLE ═══
  lbl(doc, "Digital Asset Holdings", m, y); y += 3;
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
    styles: { fontSize: 8, cellPadding: 3, textColor: DARK, lineColor: LINE, lineWidth: 0.3 },
    headStyles: { fillColor: BG, textColor: MUTED, fontSize: 6.5, fontStyle: "bold", cellPadding: 2.5 },
    footStyles: { fillColor: BG, textColor: NAVY, fontStyle: "bold", fontSize: 8 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
    theme: "plain",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ═══ TRANSACTIONS (full-history & income-summary only) ═══
  if (!isBs) {
    // Filter out spam/zero-value token transfers
    const allTxs = data.transactions.filter(t => t.valueUsd > 0 || t.type === "send");
    const txs = isIs ? allTxs.filter(t => t.type === "receive") : allTxs;

    if (txs.length > 0) {
      // Summary
      const recv = allTxs.filter(t => t.type === "receive").reduce((s, t) => s + t.valueUsd, 0);
      const sent = allTxs.filter(t => t.type === "send").reduce((s, t) => s + t.valueUsd, 0);

      if (isIs) {
        lbl(doc, "Total Income for Period", m, y); y += 5;
        val(doc, `$${fmt(recv)}`, m, y, 16, true, GREEN);
        val(doc, `${txs.length} incoming transaction${txs.length !== 1 ? "s" : ""}`, m + 55, y, 8, false, MUTED);
        y += 12;
      } else {
        const bw = (cw - 8) / 3;
        ([
          { l: "Total Received", v: `$${fmt(recv)}`, c: GREEN },
          { l: "Total Sent", v: `$${fmt(sent)}`, c: RED },
          { l: "Net Change", v: `$${fmt(recv - sent)}`, c: DARK },
        ] as const).forEach((b, i) => {
          const x = m + i * (bw + 4);
          doc.setFillColor(...BG); doc.roundedRect(x, y, bw, 16, 2, 2, "F");
          lbl(doc, b.l, x + 4, y + 6); val(doc, b.v, x + 4, y + 12, 11, true, b.c);
        });
        y += 22;
      }

      // Transaction table
      if (y > H - 60) { doc.addPage(); y = m; }
      lbl(doc, isIs ? "Income Transactions" : "Transaction History", m, y); y += 3;

      doc.setFontSize(5.5); doc.setFont("helvetica", "italic"); doc.setTextColor(...LIGHT_MUTED);
      doc.text("USD values reflect current market prices at time of statement generation, not historical prices at time of transaction.", m, y);
      y += 4;

      autoTable(doc, {
        startY: y, margin: { left: m, right: m },
        head: [["Date", "Description", isIs ? "From" : "Counterparty", "Type", "USD Value*"]],
        body: txs.slice(0, 100).map(tx => [
          new Date(tx.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
          tx.description,
          tx.type === "receive" ? shortAddr(tx.from) : shortAddr(tx.to),
          tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
          tx.valueUsd > 0 ? `$${fmt(tx.valueUsd)}` : "—",
        ]),
        styles: { fontSize: 7, cellPadding: 2.5, textColor: DARK, lineColor: LINE, lineWidth: 0.2, overflow: "ellipsize" },
        headStyles: { fillColor: BG, textColor: MUTED, fontSize: 6, fontStyle: "bold", cellPadding: 2 },
        columnStyles: { 4: { halign: "right" } },
        theme: "plain",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 4;
      if (txs.length > 100) {
        doc.setFontSize(6); doc.setTextColor(...LIGHT_MUTED);
        const total = data.totalTransactionCount || txs.length;
        doc.text(`Showing 100 of ${total.toLocaleString()} transactions in this period`, m, y); y += 4;
      }
    } else {
      lbl(doc, isIs ? "Income Transactions" : "Transaction History", m, y); y += 6;
      doc.setFillColor(...BG); doc.roundedRect(m, y, cw, 12, 2, 2, "F");
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...MUTED);
      doc.text("No transactions found for this period.", m + 6, y + 7.5);
      y += 18;
    }
  }

  // ═══ VERIFICATION FOOTER ═══
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastY = (doc as any).lastAutoTable?.finalY || y;
  let fy = H - 48;
  if (lastY > fy - 10) { doc.addPage(); fy = H - 48; }

  doc.setDrawColor(...LINE); doc.setLineWidth(0.4); doc.line(m, fy, W - m, fy);
  fy += 4;
  doc.setFillColor(250, 251, 252); doc.roundedRect(m, fy, cw, 32, 2, 2, "F");

  // QR code — links to verify page (payload will be in PDF metadata)
  const qrUrl = verifyUrl || "https://fundslip.xyz/verify";
  try {
    const qr = await QRCode.toDataURL(qrUrl, { width: 300, margin: 1, color: { dark: "#191c1e", light: "#ffffff" } });
    doc.addImage(qr, "PNG", m + 4, fy + 4, 22, 22);
  } catch { /* skip */ }

  const tx = m + 30;
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...DARK);
  doc.text("VERIFY THIS STATEMENT", tx, fy + 6);

  // Clickable link
  doc.setFontSize(6.5); doc.setTextColor(...NAVY);
  doc.textWithLink("fundslip.xyz/verify", tx, fy + 11, { url: qrUrl });

  doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(...MUTED);
  doc.text("Upload this PDF or scan the QR code to verify authenticity.", tx, fy + 16);

  // Show fingerprint (Base58 payload)
  doc.setFont("helvetica", "bold"); doc.setFontSize(5.5); doc.text("Data Fingerprint:", tx, fy + 21);
  doc.setFont("courier", "normal"); doc.setFontSize(4.5);
  const maxW = cw - 34;
  // Show as much as fits, truncate middle if needed
  const fp = hash || "";
  if (doc.getTextWidth(fp) > maxW && fp.length > 40) {
    doc.text(`${fp.slice(0, 30)}...${fp.slice(-30)}`, tx, fy + 25);
  } else {
    doc.text(fp, tx, fy + 25);
  }

  doc.setFont("helvetica", "normal"); doc.setFontSize(5); doc.setTextColor(...LIGHT_MUTED);
  doc.text("Cryptographically signed by the wallet owner. Independently verifiable against the Ethereum blockchain.", tx, fy + 30, { maxWidth: cw - 34 });

  // Page footer
  const pfy = H - 10;
  doc.setFontSize(5.5); doc.setTextColor(...LIGHT_MUTED); doc.setFont("helvetica", "normal");
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
