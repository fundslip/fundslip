"use client";

import { Download, Share2, Mail, Send, Check, ArrowRight } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { PdfViewer } from "@/components/shared/pdf-viewer";
import type { StatementData } from "@/types";
import { useState, useCallback } from "react";

interface StatementResultProps {
  statementData: StatementData;
  verificationHash: string;
  statementId: string;
  pdfBlobUrl: string;
  pdfBlob: Blob;
  onNewStatement: () => void;
  onDownload: () => void;
}

export function StatementResult({
  statementData, verificationHash, statementId, pdfBlobUrl, pdfBlob, onNewStatement, onDownload,
}: StatementResultProps) {
  const [shareEmail, setShareEmail] = useState("");
  const [shareName, setShareName] = useState(statementData.personalDetails?.fullName || "");
  const [shareMessage, setShareMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const truncatedFp = verificationHash ? `${verificationHash.slice(0, 12)}...${verificationHash.slice(-12)}` : "";
  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify?p=${encodeURIComponent(verificationHash)}`
    : `https://fundslip.xyz/verify?p=${encodeURIComponent(verificationHash)}`;

  const handleShareLink = useCallback(async () => {
    await navigator.clipboard.writeText(verifyUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [verifyUrl]);

  const handleSendEmail = useCallback(async () => {
    if (!shareEmail) return;
    try {
      await fetch("/api/send-statement", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: shareEmail, pdfBase64: "", statementId, walletAddress: statementData.walletAddress, verificationHash, senderName: shareName, message: shareMessage }),
      });
      setEmailSent(true);
    } catch { /* */ }
  }, [shareEmail, shareName, shareMessage, statementId, statementData.walletAddress, verificationHash]);

  const periodLabel = `${statementData.periodStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${statementData.periodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  const typeLabel = statementData.statementType === "full-history" ? "Full Transaction History" : statementData.statementType === "balance-snapshot" ? "Balance Snapshot" : "Income Summary";

  return (
    <div className="pt-24 pb-16 px-6 lg:px-8 container-page">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left */}
        <div className="w-full lg:w-5/12 space-y-5">
          <div>
            <p className="section-label mb-1">Statement Ready</p>
            <h1 className="font-headline text-[28px] font-bold text-gray-900 mb-2">
              Your statement is ready.
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your {typeLabel} for <span className="font-medium text-gray-700">{periodLabel}</span> has been generated and signed.
            </p>
          </div>

          {/* Download */}
          <button type="button" onClick={onDownload}
            className="w-full bg-navy text-white py-4 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2.5 hover:bg-navy-light transition-colors">
            <Download className="w-4 h-4" strokeWidth={2} /> Download PDF Statement
          </button>

          {/* Share Link */}
          <button type="button" onClick={handleShareLink}
            className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            {linkCopied ? <><Check className="w-4 h-4 text-emerald" /> Link Copied!</> : <><Share2 className="w-4 h-4" /> Share Secure Link</>}
          </button>

          {/* Email */}
          <div className="bg-white rounded-xl p-5">
            <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" strokeWidth={1.5} /> Share via Email
            </h3>
            {emailSent ? (
              <p className="flex items-center gap-2 text-emerald-dark text-sm font-medium"><Check className="w-4 h-4" /> Sent to {shareEmail}</p>
            ) : (
              <div className="space-y-2.5">
                <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="Recipient's email"
                  className="w-full border border-[rgba(0,0,0,0.08)] rounded-lg px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:border-navy focus:ring-[3px] focus:ring-navy/[0.08] outline-none" />
                <input type="text" value={shareName} onChange={(e) => setShareName(e.target.value)} placeholder="Your name (optional)"
                  className="w-full border border-[rgba(0,0,0,0.08)] rounded-lg px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:border-navy focus:ring-[3px] focus:ring-navy/[0.08] outline-none" />
                <input type="text" value={shareMessage} onChange={(e) => setShareMessage(e.target.value)} placeholder="Short message (optional)"
                  className="w-full border border-[rgba(0,0,0,0.08)] rounded-lg px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:border-navy focus:ring-[3px] focus:ring-navy/[0.08] outline-none" />
                <button type="button" onClick={handleSendEmail} disabled={!shareEmail}
                  className="w-full bg-navy text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-navy-light transition-colors disabled:opacity-40">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            )}
          </div>

          {/* Verification Details */}
          <div className="bg-white rounded-xl p-5 space-y-3">
            <p className="section-label">Data Fingerprint</p>
            <div className="flex items-center gap-2">
              <code className="flex-grow bg-gray-50 px-3 py-2 rounded-lg text-[11px] font-mono text-gray-500 truncate">{truncatedFp}</code>
              <CopyButton text={verificationHash} />
            </div>
            <p className="text-xs text-gray-400">
              {statementData.generatedAt.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
            </p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="text-navy font-semibold text-sm flex items-center gap-1.5 group">
              Verify this statement <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <button type="button" onClick={onNewStatement} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              Generate Another
            </button>
          </div>
        </div>

        {/* Right — PDF Preview */}
        <div className="w-full lg:w-7/12">
          <PdfViewer pdfBlob={pdfBlob} />
        </div>
      </div>
    </div>
  );
}
