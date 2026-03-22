import { SiweMessage } from "siwe";
import { keccak256, toBytes, recoverMessageAddress } from "viem";
import type { StatementData } from "@/types";

export function createSiweMessage(
  address: string, chainId: number, statementText: string
): SiweMessage {
  return new SiweMessage({
    domain: typeof window !== "undefined" ? window.location.host : "fundslip.xyz",
    address, statement: statementText,
    uri: typeof window !== "undefined" ? window.location.origin : "https://fundslip.xyz",
    version: "1", chainId, nonce: generateNonce(),
  });
}

function generateNonce(): string {
  const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let r = "";
  for (let i = 0; i < 16; i++) r += c.charAt(Math.floor(Math.random() * c.length));
  return r;
}

export function computeStatementHash(data: StatementData): string {
  const serialized = JSON.stringify({
    w: data.walletAddress.toLowerCase(),
    t: data.statementType,
    ps: data.periodStart.toISOString(),
    pe: data.periodEnd.toISOString(),
    b: data.blockNumber,
    eth: data.ethBalance.toFixed(8),
    usd: data.totalValueUsd.toFixed(2),
  });
  return keccak256(toBytes(serialized));
}

/**
 * Build a compact verification code.
 * Format: base64url({ data fields + signature })
 * Short enough for QR codes, contains everything needed to verify.
 */
export function buildVerificationCode(
  data: StatementData, dataHash: string, signature: string, statementId: string
): string {
  // Pack only essential fields — keeps code compact
  const payload = [
    statementId,                          // FS-123456
    data.walletAddress,                   // 0x...
    data.statementType,                   // balance-snapshot | full-history | income-summary
    data.blockNumber.toString(),          // block at snapshot
    Math.round(data.totalValueUsd * 100).toString(), // USD in cents for precision
    data.ethBalance.toFixed(8),           // ETH balance
    data.periodStart.toISOString(),       // period start
    data.periodEnd.toISOString(),         // period end
    data.generatedAt.toISOString(),       // generation timestamp
    dataHash,                             // keccak256 of data
    signature,                            // wallet ECDSA signature
  ].join("|");

  return btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export interface DecodedVerification {
  statementId: string;
  walletAddress: string;
  statementType: string;
  blockNumber: number;
  totalValueUsd: number;
  ethBalance: number;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  dataHash: string;
  signature: string;
}

export function decodeVerificationCode(code: string): DecodedVerification | null {
  try {
    let b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const raw = atob(b64);
    const parts = raw.split("|");
    if (parts.length < 11) return null;

    return {
      statementId: parts[0],
      walletAddress: parts[1],
      statementType: parts[2],
      blockNumber: parseInt(parts[3]),
      totalValueUsd: parseInt(parts[4]) / 100,
      ethBalance: parseFloat(parts[5]),
      periodStart: parts[6],
      periodEnd: parts[7],
      generatedAt: parts[8],
      dataHash: parts[9],
      signature: parts[10],
    };
  } catch {
    return null;
  }
}

export async function verifyCode(code: string): Promise<{ valid: boolean; data?: DecodedVerification; error?: string }> {
  const decoded = decodeVerificationCode(code);
  if (!decoded) {
    return { valid: false, error: "Invalid verification code format." };
  }

  try {
    // Reconstruct the exact message that was signed
    const signedMessage = `Fundslip Statement ${decoded.statementId}\n\nI verify this financial statement is accurate.\n\nHash: ${decoded.dataHash}`;

    const recovered = await recoverMessageAddress({
      message: signedMessage,
      signature: decoded.signature as `0x${string}`,
    });

    if (recovered.toLowerCase() !== decoded.walletAddress.toLowerCase()) {
      return { valid: false, error: "Signature does not match the claimed wallet address. This statement may be forged." };
    }

    return { valid: true, data: decoded };
  } catch {
    return { valid: false, error: "Could not verify the cryptographic signature." };
  }
}

export function generateStatementId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `FS-${num}`;
}
