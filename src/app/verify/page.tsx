"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { QrScanner } from "@/components/verify/qr-scanner";
import { PdfUpload } from "@/components/verify/pdf-upload";
import { HashInput } from "@/components/verify/hash-input";
import { VerifyResult } from "@/components/verify/verify-result";
import { VerifyingProgress } from "@/components/verify/verifying-progress";
import type { VerificationResult } from "@/types";
import type { VerifyResult as CryptoVerifyResult } from "@/lib/verification";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

function toUiResult(r: CryptoVerifyResult): VerificationResult {
  if (r.status === "verified") {
    return {
      verified: true,
      statementId: `Block #${r.blockNumber?.toLocaleString() || "?"}`,
      walletAddress: r.recoveredSigner || r.wallet || "",
      ensName: r.ensName || null,
      totalValueUsd: r.totalValueUsd || 0,
      tokens: r.statementData?.tokens.map(t => ({ symbol: t.symbol, balance: t.balance })) || [],
      ethBalance: r.ethBalanceFormatted?.toString() || "0",
      statementType: r.statementType || "",
      periodStart: "",
      periodEnd: "",
      blockNumber: r.blockNumber || 0,
      generatedAt: "",
      verifiedAt: new Date(),
      statementData: r.statementData,
    };
  }
  return {
    verified: false, statementId: "", walletAddress: r.wallet || "", ensName: null,
    totalValueUsd: 0, tokens: [], ethBalance: "0", statementType: "",
    periodStart: "", periodEnd: "", blockNumber: 0, generatedAt: "",
    verifiedAt: new Date(), error: r.error,
  };
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);
  const [verifyLabel, setVerifyLabel] = useState("");
  const [lastFingerprint, setLastFingerprint] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);

  const onProgress = useCallback((step: number, label: string) => {
    setVerifyStep(step);
    setVerifyLabel(label);
  }, []);

  const handleCodeVerify = useCallback(async (input: string) => {
    if (!input) return;
    setIsVerifying(true);
    setResult(null);
    setVerifyStep(0);
    setVerifyLabel("Decoding...");
    try {
      const { verifyPayload, extractPayloadFromUrl } = await import("@/lib/verification");
      const payload = extractPayloadFromUrl(input);
      if (!payload) {
        setResult({
          verified: false, statementId: "", walletAddress: "", ensName: null,
          totalValueUsd: 0, tokens: [], ethBalance: "0", statementType: "",
          periodStart: "", periodEnd: "", blockNumber: 0, generatedAt: "",
          verifiedAt: new Date(), error: "Invalid input. Paste the verification code from the statement.",
        });
      } else {
        setLastFingerprint(payload);
        const r = await verifyPayload(payload, onProgress);
        setResult(toUiResult(r));
      }
    } catch (e) {
      console.error("Verify error:", e);
      setResult({
        verified: false, statementId: "", walletAddress: "", ensName: null,
        totalValueUsd: 0, tokens: [], ethBalance: "0", statementType: "",
        periodStart: "", periodEnd: "", blockNumber: 0, generatedAt: "",
        verifiedAt: new Date(), error: "Verification failed. Please try again.",
      });
    }
    setIsVerifying(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  }, [onProgress]);

  const handlePdfUpload = useCallback(async (file: File) => {
    setIsVerifying(true);
    setResult(null);
    setVerifyStep(0);
    setVerifyLabel("Reading PDF...");
    try {
      const { verifyFromPdf, extractPayloadFromPdf } = await import("@/lib/verification");
      // Extract fingerprint from PDF for display
      const pdfBytes = new Uint8Array(await file.arrayBuffer());
      const extractedFp = await extractPayloadFromPdf(pdfBytes);
      if (extractedFp) setLastFingerprint(extractedFp);
      const r = await verifyFromPdf(file, onProgress);
      setResult(toUiResult(r));
    } catch {
      setResult({
        verified: false, statementId: "", walletAddress: "", ensName: null,
        totalValueUsd: 0, tokens: [], ethBalance: "0", statementType: "",
        periodStart: "", periodEnd: "", blockNumber: 0, generatedAt: "",
        verifiedAt: new Date(), error: "Failed to process the PDF.",
      });
    }
    setIsVerifying(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  }, [onProgress]);

  useEffect(() => {
    const p = searchParams.get("p") || searchParams.get("code");
    if (p) handleCodeVerify(p);
  }, [searchParams, handleCodeVerify]);

  // Verifying in progress — full screen centered like generating
  if (isVerifying) {
    return (
      <>
        <Navbar />
        <VerifyingProgress currentStep={verifyStep} statusLabel={verifyLabel} />
        <Footer />
      </>
    );
  }

  // Result ready
  if (result) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-24 px-6 lg:px-8">
          <div className="container-page">
            <button type="button" onClick={() => setResult(null)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Verify another statement
            </button>
            <VerifyResult result={result} fingerprint={lastFingerprint} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Input form
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-24 px-6 lg:px-8">
        <div className="container-page">
          <header className="mb-12">
            <p className="section-label mb-2">Statement Verification</p>
            <h1 className="font-headline text-[32px] font-bold text-gray-900 mb-3">
              Verify a Fundslip Statement
            </h1>
            <p className="text-gray-500 text-base max-w-xl leading-relaxed">
              Upload the PDF, scan the QR code, or paste the verification code.
              We verify the cryptographic signature against on-chain data.
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7"><QrScanner onScan={handleCodeVerify} /></div>
            <div className="md:col-span-5"><PdfUpload onFileSelected={handlePdfUpload} /></div>
            <div className="md:col-span-12"><HashInput onVerify={handleCodeVerify} isVerifying={isVerifying} /></div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function VerifyPage() {
  return (
    <Providers>
      <Suspense><VerifyContent /></Suspense>
    </Providers>
  );
}
