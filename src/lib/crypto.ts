/**
 * Fundslip Cryptographic Binding Module
 *
 * Architecture: "Double Hash" — the PDF's raw bytes are hashed, then that hash
 * is bound to an EIP-712 typed data signature from the wallet owner. The
 * signature is appended to the PDF after %%EOF with a custom delimiter.
 *
 * This creates a tamper-proof chain:
 *   PDF bytes → keccak256 → pdfHash → EIP-712 signature → appended to PDF
 *
 * Verification reverses the process:
 *   Split at delimiter → re-hash Part A → recover signer → compare addresses
 */

import { keccak256, type Address } from "viem";

// ─── Constants ───

const DELIMITER = "|||FUNDSLIP_SIG:";
const DELIMITER_BYTES = new TextEncoder().encode(DELIMITER);

// EIP-712 domain and types — must be identical in sign and verify
const EIP712_DOMAIN = {
  name: "Fundslip",
  version: "1",
} as const;

const EIP712_TYPES = {
  Statement: [
    { name: "docId", type: "string" },
    { name: "pdfHash", type: "bytes32" },
    { name: "totalBalance", type: "string" },
    { name: "wallet", type: "address" },
  ],
} as const;

// ─── Phase 1: Generation ───

/**
 * Generate a deterministic document ID from core data.
 * Takes first 16 hex chars of keccak256(wallet + timestamp + data).
 */
export function generateDocId(
  wallet: string,
  timestamp: number,
  statementType: string,
  blockNumber: number
): string {
  const input = `${wallet.toLowerCase()}:${timestamp}:${statementType}:${blockNumber}`;
  const hash = keccak256(new TextEncoder().encode(input));
  return hash.slice(2, 18); // first 16 hex chars, no 0x prefix
}

/**
 * Hash the raw PDF bytes using keccak256.
 * This is the "visual hash" — any change to the PDF changes this hash.
 */
export function hashPdfBuffer(pdfBuffer: Uint8Array): `0x${string}` {
  return keccak256(pdfBuffer);
}

/**
 * Build the EIP-712 typed data object for signing.
 * The wallet will display this structured data to the user.
 */
export function buildEip712Message(
  docId: string,
  pdfHash: `0x${string}`,
  totalBalance: string,
  wallet: string
) {
  return {
    domain: EIP712_DOMAIN,
    types: EIP712_TYPES,
    primaryType: "Statement" as const,
    message: {
      docId,
      pdfHash,
      totalBalance,
      wallet: wallet as Address,
    },
  };
}

/**
 * Append the signature and wallet address to the PDF buffer after %%EOF.
 * Format: [original PDF bytes]|||FUNDSLIP_SIG:[signature]:[walletAddress]
 *
 * PDF readers ignore anything after %%EOF, so the file remains valid.
 */
export function appendSignatureToPdf(
  pdfBuffer: Uint8Array,
  signature: string,
  walletAddress: string
): Uint8Array {
  const suffix = `${DELIMITER}${signature}:${walletAddress}`;
  const suffixBytes = new TextEncoder().encode(suffix);

  const result = new Uint8Array(pdfBuffer.length + suffixBytes.length);
  result.set(pdfBuffer, 0);
  result.set(suffixBytes, pdfBuffer.length);

  return result;
}

/**
 * Full generation pipeline.
 * Call this after PDF is generated and you have the signature.
 *
 * Returns: { signedPdf: Uint8Array, docId: string }
 */
export function finalizeSignedPdf(
  pdfBuffer: Uint8Array,
  signature: string,
  walletAddress: string,
  docId: string
): { signedPdf: Uint8Array; docId: string } {
  const signedPdf = appendSignatureToPdf(pdfBuffer, signature, walletAddress);
  return { signedPdf, docId };
}


// ─── Phase 2: Verification ───

export interface VerificationInput {
  originalPdf: Uint8Array;
  signature: string;
  walletAddress: string;
}

/**
 * Parse an uploaded PDF buffer to extract the original PDF and appended signature.
 * Returns null if no signature delimiter is found.
 */
export function parseSignedPdf(buffer: Uint8Array): VerificationInput | null {
  // Search for the delimiter in the buffer
  const delimiterIndex = findDelimiter(buffer);
  if (delimiterIndex === -1) return null;

  // Part A: original PDF (everything before the delimiter)
  const originalPdf = buffer.slice(0, delimiterIndex);

  // Part B: signature data (everything after the delimiter)
  const sigData = new TextDecoder().decode(buffer.slice(delimiterIndex + DELIMITER_BYTES.length));
  const colonIndex = sigData.lastIndexOf(":");
  if (colonIndex === -1) return null;

  // The signature contains colons (0x...), so we split on the LAST colon
  // which separates signature from wallet address
  // Format: [signature]:[walletAddress]
  // Wallet address is always 42 chars (0x + 40 hex)
  const walletAddress = sigData.slice(-42);
  const signature = sigData.slice(0, sigData.length - 43); // -42 for address, -1 for colon

  if (!walletAddress.startsWith("0x") || walletAddress.length !== 42) return null;
  if (!signature.startsWith("0x")) return null;

  return { originalPdf, signature, walletAddress };
}

/**
 * Full verification pipeline.
 *
 * 1. Parse the buffer to split PDF from signature
 * 2. Re-hash the original PDF bytes
 * 3. Recover the signer from the EIP-712 signature
 * 4. Compare recovered address with claimed address
 */
export async function verifySignedPdf(
  buffer: Uint8Array,
  docId: string,
  totalBalance: string
): Promise<{
  verified: boolean;
  walletAddress?: string;
  pdfHash?: string;
  error?: string;
}> {
  // 1. Parse
  const parsed = parseSignedPdf(buffer);
  if (!parsed) {
    return { verified: false, error: "No Fundslip signature found in this PDF." };
  }

  // 2. Re-hash the original PDF
  const pdfHash = hashPdfBuffer(parsed.originalPdf);

  // 3. Build the same EIP-712 message that was signed
  const typedData = buildEip712Message(docId, pdfHash, totalBalance, parsed.walletAddress);

  // 4. Recover signer using viem
  try {
    const { verifyTypedData } = await import("viem");

    const isValid = await verifyTypedData({
      address: parsed.walletAddress as Address,
      domain: typedData.domain,
      types: typedData.types,
      primaryType: typedData.primaryType,
      message: typedData.message,
      signature: parsed.signature as `0x${string}`,
    });

    if (!isValid) {
      return {
        verified: false,
        walletAddress: parsed.walletAddress,
        pdfHash,
        error: "Signature does not match. This document may have been tampered with.",
      };
    }

    return {
      verified: true,
      walletAddress: parsed.walletAddress,
      pdfHash,
    };
  } catch (err) {
    console.error("EIP-712 verification error:", err);
    return {
      verified: false,
      walletAddress: parsed.walletAddress,
      pdfHash,
      error: "Cryptographic verification failed.",
    };
  }
}

/**
 * Quick check: does this buffer contain a Fundslip signature?
 */
export function hasSignature(buffer: Uint8Array): boolean {
  return findDelimiter(buffer) !== -1;
}

/**
 * Extract just the wallet address from a signed PDF without full verification.
 */
export function extractWalletFromSignedPdf(buffer: Uint8Array): string | null {
  const parsed = parseSignedPdf(buffer);
  return parsed?.walletAddress || null;
}


// ─── Internal Helpers ───

function findDelimiter(buffer: Uint8Array): number {
  // Boyer-Moore-ish search for the delimiter bytes in the buffer
  outer:
  for (let i = 0; i <= buffer.length - DELIMITER_BYTES.length; i++) {
    for (let j = 0; j < DELIMITER_BYTES.length; j++) {
      if (buffer[i + j] !== DELIMITER_BYTES[j]) continue outer;
    }
    return i;
  }
  return -1;
}
