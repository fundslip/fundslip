"use client";

import { Download, Share2, Mail, Send, Check, ArrowLeft, ArrowRight, Copy, ShieldCheck } from "lucide-react";
import { PdfViewer } from "@/components/shared/pdf-viewer";
import type { StatementData } from "@/types";
import { useState, useCallback } from "react";
import Image from "next/image";
import { copyToClipboard } from "@/lib/clipboard";

interface StatementResultProps {
  statementData: StatementData;
  verificationHash: string;
  statementId: string;
  pdfBlobUrl: string;
  pdfBlob: Blob;
  onNewStatement: () => void;
  onDownload: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function StatementResult({
  statementData, verificationHash, statementId, pdfBlobUrl, pdfBlob, onNewStatement, onDownload,
}: StatementResultProps) {
  const [shareEmail, setShareEmail] = useState("");
  const [shareName, setShareName] = useState(statementData.personalDetails?.fullName || "");
  const [shareMessage, setShareMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [hashCopied, setHashCopied] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const truncatedHash = verificationHash ? `${verificationHash.slice(0, 8)}…${verificationHash.slice(-8)}` : "";
  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify?p=${encodeURIComponent(verificationHash)}`
    : `https://fundslip.xyz/verify?p=${encodeURIComponent(verificationHash)}`;

  const handleShareLink = useCallback(async () => {
    const ok = await copyToClipboard(verifyUrl);
    if (ok) { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }
  }, [verifyUrl]);

  const handleCopyHash = useCallback(async () => {
    const ok = await copyToClipboard(verificationHash);
    if (ok) { setHashCopied(true); setTimeout(() => setHashCopied(false), 2000); }
  }, [verificationHash]);

  const handleSendEmail = useCallback(async () => {
    if (!shareEmail) return;
    setEmailError(null);
    setEmailSending(true);
    try {
      // Convert PDF blob to base64 for attachment (cap at 5MB to avoid oversized payloads)
      let pdfBase64 = "";
      if (pdfBlob && pdfBlob.size <= 5 * 1024 * 1024) {
        const buf = await pdfBlob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        pdfBase64 = btoa(binary);
      }

      const res = await fetch("/api/send-statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: shareEmail, pdfBase64, statementId,
          walletAddress: statementData.walletAddress, verificationHash,
          senderName: shareName, message: shareMessage,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to send email" }));
        setEmailError(data.error || `Error ${res.status}`);
      } else {
        setEmailSent(true);
      }
    } catch {
      setEmailError("Network error. Please try again.");
    } finally {
      setEmailSending(false);
    }
  }, [shareEmail, shareName, shareMessage, statementId, statementData.walletAddress, verificationHash, pdfBlob]);

  const periodLabel = `${statementData.periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${statementData.periodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  const typeLabel = statementData.statementType === "full-history" ? "Full History" : statementData.statementType === "balance-snapshot" ? "Snapshot" : "Income";

  return (
    <div className="pt-20 pb-16 px-5 md:px-6">
      <div className="container-page">
        {/* Header with back button */}
        <div className="mb-10">
          <button onClick={onNewStatement}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-brand-black transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Generate another statement
          </button>
          <h1 className="font-headline text-3xl md:text-4xl font-semibold text-brand-black text-center">
            Your statement is ready
          </h1>
        </div>

        {/* Statement card preview — matching the hero style */}
        <div className="max-w-3xl mx-auto mb-8 rounded-2xl border border-outline-variant bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 md:px-6 py-3 border-b border-outline-variant">
            <div className="flex items-center gap-2">
              <Image src="/fundslip.svg" alt="" width={14} height={18} style={{ height: "auto" }} />
              <span className="font-headline font-semibold text-[13px] text-brand-black">Fundslip</span>
            </div>
            <div className="flex items-center gap-1 text-tertiary">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[9px] font-medium uppercase tracking-wide">Verified</span>
            </div>
          </div>
          <div className="px-5 md:px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Account</p>
              <p className="text-[12px] font-mono text-brand-black truncate">
                {statementData.ensName || `${statementData.walletAddress.slice(0, 8)}…${statementData.walletAddress.slice(-6)}`}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Net Worth</p>
              <p className="text-[12px] font-semibold text-brand-black">${fmt(statementData.totalValueUsd)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Block</p>
              <p className="text-[12px] text-brand-black">#{statementData.blockNumber.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Period</p>
              <p className="text-[12px] text-brand-black">{periodLabel}</p>
            </div>
          </div>
        </div>

        {/* Action buttons — centered row */}
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 mb-8">
          <button onClick={onDownload}
            className="flex-1 bg-brand-navy text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-brand-navy/90 transition-colors">
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button onClick={handleShareLink}
            className="flex-1 border border-outline-variant py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-brand-black hover:bg-surface transition-colors">
            {linkCopied ? <><Check className="w-4 h-4 text-tertiary" /> Link Copied</> : <><Share2 className="w-4 h-4" /> Copy Verification Link</>}
          </button>
          <button onClick={() => setShowEmail(!showEmail)}
            className="flex-1 border border-outline-variant py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-brand-black hover:bg-surface transition-colors">
            <Mail className="w-4 h-4" /> Email
          </button>
        </div>

        {/* Email form — collapsible */}
        {showEmail && (
          <div className="max-w-3xl mx-auto mb-8 rounded-xl border border-outline-variant p-5">
            {emailSent ? (
              <p className="text-tertiary text-sm flex items-center gap-2"><Check className="w-4 h-4" /> Sent to {shareEmail}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Recipient email" className="bg-surface border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-brand-navy/20 outline-none" />
                  <input type="text" value={shareName} onChange={(e) => setShareName(e.target.value)}
                    placeholder="Your name (optional)" className="bg-surface border-0 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-brand-navy/20 outline-none" />
                  <button onClick={handleSendEmail} disabled={!shareEmail || emailSending}
                    className="bg-brand-navy text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-brand-navy/90 transition-colors disabled:opacity-50">
                    <Send className="w-4 h-4" /> {emailSending ? "Sending..." : "Send"}
                  </button>
                </div>
                {emailError && (
                  <p className="mt-2 text-error text-sm">{emailError}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Verification details — compact row */}
        <div className="max-w-3xl mx-auto mb-8 flex flex-col sm:flex-row gap-3 text-[12px] text-on-surface-variant items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Statement Fingerprint:</span>
            <code className="font-mono text-brand-black">{truncatedHash}</code>
            <button onClick={handleCopyHash} className="text-on-surface-variant hover:text-brand-black transition-colors">
              {hashCopied ? <Check className="w-3 h-3 text-tertiary" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="text-brand-navy hover:underline flex items-center gap-1">
            Verify Statement <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {/* PDF preview — full width */}
        <div className="max-w-3xl mx-auto">
          <PdfViewer pdfBlob={pdfBlob} />
        </div>
      </div>
    </div>
  );
}
