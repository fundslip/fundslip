import { parseSignedPdf, hashPdfBuffer, buildEip712Message, hasSignature } from "./crypto";
import { getEnsName } from "./ethereum";
import type { VerificationResult } from "@/types";
import type { Address } from "viem";

/**
 * Verify a signed PDF buffer.
 * Extracts the signature, re-hashes the visual PDF, and verifies the EIP-712 signature.
 */
export async function verifyPdfBuffer(
  buffer: Uint8Array,
  docId: string,
  totalBalance: string
): Promise<VerificationResult> {
  const parsed = parseSignedPdf(buffer);
  if (!parsed) {
    return failure("No Fundslip signature found in this file. Ensure this is a Fundslip-generated PDF.");
  }

  const pdfHash = hashPdfBuffer(parsed.originalPdf);
  const eip712 = buildEip712Message(docId, pdfHash, totalBalance, parsed.walletAddress);

  try {
    const { verifyTypedData } = await import("viem");

    const isValid = await verifyTypedData({
      address: parsed.walletAddress as Address,
      domain: eip712.domain,
      types: eip712.types,
      primaryType: eip712.primaryType,
      message: eip712.message,
      signature: parsed.signature as `0x${string}`,
    });

    if (!isValid) {
      return failure("Signature does not match. This document may have been tampered with or forged.");
    }

    let ensName: string | null = null;
    try { ensName = await getEnsName(parsed.walletAddress as Address, 1); } catch { /* */ }

    return {
      verified: true,
      statementId: docId,
      walletAddress: parsed.walletAddress,
      ensName,
      totalValueUsd: parseFloat(totalBalance.replace(/[$,]/g, "")) || 0,
      tokens: [],
      ethBalance: "0",
      statementType: "",
      periodStart: "",
      periodEnd: "",
      blockNumber: 0,
      generatedAt: "",
      verifiedAt: new Date(),
    };
  } catch (err) {
    console.error("Verification error:", err);
    return failure("Cryptographic verification failed.");
  }
}

/**
 * Quick verification from a File upload.
 * Extracts signature metadata, verifies the cryptographic binding.
 *
 * Note: For full verification we need the docId and totalBalance which are
 * embedded in the PDF content. For drag-and-drop we extract what we can
 * and verify the signature is valid for the PDF bytes.
 */
export async function verifyUploadedPdf(file: File): Promise<VerificationResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  if (!hasSignature(buffer)) {
    return failure("No Fundslip signature found. This doesn't appear to be a Fundslip statement.");
  }

  const parsed = parseSignedPdf(buffer);
  if (!parsed) {
    return failure("Could not parse the signature data from this PDF.");
  }

  // Re-hash the original PDF portion
  const pdfHash = hashPdfBuffer(parsed.originalPdf);

  // We need to try recovering the signer. Since we don't know the exact
  // docId/totalBalance from outside the PDF, we'll try to extract them
  // from the PDF text content.
  const pdfText = new TextDecoder("utf-8", { fatal: false }).decode(parsed.originalPdf);

  // Extract docId — it's a 16-char hex string typically shown as FS-XXXXXX or in the content
  const docIdMatch = pdfText.match(/FS-(\d{6})/);
  const docId = docIdMatch ? docIdMatch[0] : "";

  // Extract total balance — look for dollar amount patterns
  const balanceMatch = pdfText.match(/\$[\d,.]+/);
  const totalBalance = balanceMatch ? balanceMatch[0] : "$0.00";

  // Try verification with extracted values
  const eip712 = buildEip712Message(docId || "unknown", pdfHash, totalBalance, parsed.walletAddress);

  try {
    const { verifyTypedData } = await import("viem");

    const isValid = await verifyTypedData({
      address: parsed.walletAddress as Address,
      domain: eip712.domain,
      types: eip712.types,
      primaryType: eip712.primaryType,
      message: eip712.message,
      signature: parsed.signature as `0x${string}`,
    });

    if (!isValid) {
      return failure("Signature verification failed. The document may have been modified after signing.");
    }

    let ensName: string | null = null;
    try { ensName = await getEnsName(parsed.walletAddress as Address, 1); } catch { /* */ }

    return {
      verified: true,
      statementId: docId || "Unknown",
      walletAddress: parsed.walletAddress,
      ensName,
      totalValueUsd: parseFloat(totalBalance.replace(/[$,]/g, "")) || 0,
      tokens: [],
      ethBalance: "0",
      statementType: "",
      periodStart: "",
      periodEnd: "",
      blockNumber: 0,
      generatedAt: "",
      verifiedAt: new Date(),
    };
  } catch (err) {
    console.error("PDF verification error:", err);
    return failure("Could not verify the cryptographic signature in this document.");
  }
}

/**
 * Verify from a verification code string (from QR scan or manual paste).
 * Falls back to the old code-based verification.
 */
export async function verifyCode(code: string): Promise<VerificationResult> {
  // Try to decode as a verification URL
  try {
    const url = new URL(code);
    const codeParam = url.searchParams.get("code");
    if (codeParam) code = codeParam;
  } catch {
    // Not a URL — use raw code
  }

  // For now, code-based verification is secondary to PDF verification.
  // The primary flow is drag-and-drop PDF.
  return failure("Please upload the PDF document for verification. Code-based verification requires the original signed PDF.");
}

function failure(error: string): VerificationResult {
  return {
    verified: false, statementId: "", walletAddress: "", ensName: null,
    totalValueUsd: 0, tokens: [], ethBalance: "0", statementType: "",
    periodStart: "", periodEnd: "", blockNumber: 0, generatedAt: "",
    verifiedAt: new Date(), error,
  };
}
