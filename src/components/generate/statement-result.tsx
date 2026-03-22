"use client";

import {
  Download,
  Share2,
  Mail,
  Send,
  Check,
  ArrowRight,
} from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { PdfViewer } from "@/components/shared/pdf-viewer";
import type { StatementData } from "@/types";
import { useState, useCallback } from "react";
import Link from "next/link";

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
  statementData,
  verificationHash,
  statementId,
  pdfBlobUrl,
  pdfBlob,
  onNewStatement,
  onDownload,
}: StatementResultProps) {
  const [shareEmail, setShareEmail] = useState("");
  const [shareName, setShareName] = useState(statementData.personalDetails?.fullName || "");
  const [shareMessage, setShareMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const truncatedHash = verificationHash
    ? `${verificationHash.slice(0, 6)}...${verificationHash.slice(-14)}`
    : "";

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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: shareEmail, pdfBase64: "", statementId,
          walletAddress: statementData.walletAddress, verificationHash,
          senderName: shareName, message: shareMessage,
        }),
      });
      setEmailSent(true);
    } catch { /* email service may not be configured */ }
  }, [shareEmail, shareName, shareMessage, statementId, statementData.walletAddress, verificationHash]);

  const periodLabel = `${statementData.periodStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${statementData.periodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

  const typeLabel = statementData.statementType === "full-history"
    ? "Full Transaction History"
    : statementData.statementType === "balance-snapshot"
    ? "Balance Snapshot"
    : "Income Summary";

  return (
    <div className="pt-20 pb-16 px-6 md:px-10 container-page">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Column */}
        <div className="w-full lg:w-5/12 space-y-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
              Statement Ready
            </h1>
            <p className="text-on-surface-variant mt-2 leading-relaxed text-sm">
              Your {typeLabel} for the period of{" "}
              <span className="font-semibold text-on-surface">{periodLabel}</span>{" "}
              has been successfully generated and verified.
            </p>
          </div>

          <button
            onClick={onDownload}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-headline font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Download className="w-5 h-5" />
            Download PDF Statement
          </button>

          <button
            onClick={handleShareLink}
            className="w-full bg-secondary-container text-on-secondary-container py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-primary-fixed transition-colors"
          >
            {linkCopied ? (
              <><Check className="w-4 h-4 text-tertiary" /> Link Copied!</>
            ) : (
              <><Share2 className="w-4 h-4" /> Share Secure Link</>
            )}
          </button>

          {/* Share via Email */}
          <div className="bg-surface-container-lowest rounded-xl p-5 ring-1 ring-outline-variant/15">
            <h3 className="font-headline font-bold text-sm mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Share via Email
            </h3>
            {emailSent ? (
              <div className="flex items-center gap-2 text-tertiary font-medium text-sm">
                <Check className="w-4 h-4" /> Sent to {shareEmail}
              </div>
            ) : (
              <div className="space-y-2.5">
                <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Recipient's email"
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                <input type="text" value={shareName} onChange={(e) => setShareName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                <input type="text" value={shareMessage} onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Short message (optional)"
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                <button onClick={handleSendEmail} disabled={!shareEmail}
                  className="w-full bg-primary text-on-primary py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            )}
          </div>

          {/* Verification Details */}
          <div className="bg-surface-container-lowest rounded-xl p-5 ring-1 ring-outline-variant/15">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-3">
              Verification Details
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Data Fingerprint</p>
                <div className="flex items-center gap-2">
                  <code className="flex-grow bg-surface-container-low px-3 py-2 rounded text-[11px] font-mono text-on-surface-variant truncate">
                    {truncatedHash}
                  </code>
                  <CopyButton text={verificationHash} />
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Timestamp</p>
                <p className="text-sm text-on-surface">
                  {statementData.generatedAt.toLocaleString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1">
            <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline group">
              Verify this statement
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <button onClick={onNewStatement} className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium">
              Generate Another
            </button>
          </div>
        </div>

        {/* Right Column: PDF Preview via pdfjs-dist canvas */}
        <div className="w-full lg:w-7/12">
          <PdfViewer pdfBlob={pdfBlob} />
        </div>
      </div>
    </div>
  );
}
