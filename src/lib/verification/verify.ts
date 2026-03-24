/**
 * Verification flow.
 *
 * 1. Decode payload → wallet, chainId, blockNumber, statementType, dataHash, signature
 * 2. Reconstruct EIP-712 message with the dataHash from the payload
 * 3. Verify signature → if recovered signer === claimed wallet → AUTHENTIC
 * 4. Fetch on-chain data for display (balances, transactions) — for the PDF preview
 *
 * The dataHash proves data integrity (it was computed from on-chain data at generation).
 * The signature proves authenticity (only the wallet owner could sign it).
 * Together: the wallet owner attested to this exact on-chain state at this block.
 */

import { verifyTypedData, type Address, getAddress } from "viem";
import { decodePayload, type DecodedPayload } from "./payload";
import { getEip712Domain, EIP712_TYPES, codeToStatementType } from "./constants";
import { getEthBalance, getTokenBalances, getTransactionHistory, getEnsName, getNetworkName } from "../ethereum";
import { fetchPrices } from "../prices";
import { extractPayloadFromPdf } from "./pdf-extract";
import type { StatementData, TokenBalance, Transaction } from "@/types";

export interface VerifyResult {
  status: "verified" | "signature_mismatch" | "error";
  recoveredSigner?: string;
  wallet?: string;
  chainId?: number;
  blockNumber?: number;
  statementType?: string;
  ensName?: string | null;
  ethBalanceFormatted?: number;
  totalValueUsd?: number;
  error?: string;
  statementData?: StatementData;
}

export async function verifyPayload(
  payloadString: string,
  onProgress?: (step: number, label: string) => void
): Promise<VerifyResult> {
  // 1. Decode
  let decoded: DecodedPayload;
  try {
    decoded = decodePayload(payloadString);
    onProgress?.(0, "Payload decoded successfully");
  } catch (e) {
    return { status: "error", error: `Invalid statement fingerprint: ${e instanceof Error ? e.message : "decode failed"}` };
  }

  const checksumWallet = getAddress(decoded.wallet);
  const stType = codeToStatementType(decoded.statementType);

  // 2. Verify EIP-712 signature
  onProgress?.(1, "Verifying cryptographic signature...");

  let isValid = false;
  try {
    isValid = await verifyTypedData({
      address: checksumWallet,
      domain: getEip712Domain(),
      types: EIP712_TYPES,
      primaryType: "Statement",
      message: {
        wallet: checksumWallet,
        blockNumber: BigInt(decoded.blockNumber),
        statementType: decoded.statementType,
        dataHash: decoded.dataHash,
      },
      signature: decoded.signature,
    });
  } catch (e) {
    console.error("Signature verification error:", e);
  }

  if (!isValid) {
    return {
      status: "signature_mismatch",
      wallet: decoded.wallet,
      blockNumber: decoded.blockNumber,
      error: "Signature does not match. This statement may be forged or the fingerprint is corrupted.",
    };
  }

  // 3. Signature valid! Now fetch on-chain data for display
  onProgress?.(2, "Fetching on-chain data for preview...");

  let ethBalanceNum = 0;
  try {
    ethBalanceNum = (await getEthBalance(checksumWallet, decoded.chainId)).balance;
  } catch (e) {
    console.warn("Failed to fetch ETH balance during verification:", e);
  }

  let tokens: Awaited<ReturnType<typeof getTokenBalances>> = [];
  try {
    tokens = await getTokenBalances(checksumWallet, decoded.chainId);
  } catch (e) {
    console.warn("Failed to fetch token balances during verification:", e);
  }

  let prices: Record<string, number> = {};
  try {
    prices = await fetchPrices(["ETH", ...tokens.map(t => t.symbol)]);
  } catch (e) {
    console.warn("Failed to fetch prices during verification:", e);
  }

  const ethPriceUsd = prices.ETH || 0;
  const ethValueUsd = ethBalanceNum * ethPriceUsd;
  const pricedTokens: TokenBalance[] = tokens.map(t => ({
    ...t, priceUsd: prices[t.symbol] || 0, valueUsd: t.balanceFormatted * (prices[t.symbol] || 0),
  }));
  const totalValueUsd = ethValueUsd + pricedTokens.reduce((s, t) => s + t.valueUsd, 0);

  let transactions: Transaction[] = [];
  if (decoded.statementType !== 0) {
    onProgress?.(3, "Fetching transaction history...");
    // Use 90-day window since exact period is in the dataHash, not the payload
    const now = Math.floor(Date.now() / 1000);
    const rangeStart = now - 90 * 86400;
    try {
      const result = await getTransactionHistory(decoded.wallet, rangeStart, now, decoded.chainId, ethPriceUsd, prices);
      transactions = result.transactions;
    } catch (e) {
      console.warn("Failed to fetch transactions during verification:", e);
    }
  }

  let ensName: string | null = null;
  try { ensName = await getEnsName(checksumWallet); } catch { /* */ }

  onProgress?.(4, "Building preview...");

  const nowDate = new Date();
  // Derive period from transaction data if available, otherwise use 90-day window
  const txTimestamps = transactions.map(t => t.timestamp).filter(t => t > 0);
  const periodEnd = txTimestamps.length > 0 ? new Date(Math.max(...txTimestamps) * 1000) : nowDate;
  const periodStart = txTimestamps.length > 0 ? new Date(Math.min(...txTimestamps) * 1000) : new Date(nowDate.getTime() - 90 * 86400000);

  const statementData: StatementData = {
    walletAddress: decoded.wallet,
    ensName,
    network: "ethereum",
    periodStart,
    periodEnd,
    statementType: stType as StatementData["statementType"],
    ethBalance: ethBalanceNum,
    ethPriceUsd,
    ethValueUsd,
    tokens: pricedTokens,
    transactions,
    totalValueUsd,
    generatedAt: nowDate,
    blockNumber: decoded.blockNumber,
    networkName: getNetworkName(decoded.chainId),
  };

  onProgress?.(5, "Verified!");

  return {
    status: "verified",
    recoveredSigner: checksumWallet,
    wallet: decoded.wallet,
    chainId: decoded.chainId,
    blockNumber: decoded.blockNumber,
    statementType: stType,
    ensName,
    ethBalanceFormatted: ethBalanceNum,
    totalValueUsd,
    statementData,
  };
}

export async function verifyFromPdf(
  file: File,
  onProgress?: (step: number, label: string) => void
): Promise<VerifyResult> {
  onProgress?.(0, "Extracting verification data from PDF...");
  const pdfBytes = new Uint8Array(await file.arrayBuffer());
  const payload = await extractPayloadFromPdf(pdfBytes);
  if (!payload) {
    return { status: "error", error: "No Fundslip verification data found in this PDF." };
  }
  return verifyPayload(payload, onProgress);
}

export function extractPayloadFromUrl(urlOrPayload: string): string | null {
  try {
    const url = new URL(urlOrPayload);
    return url.searchParams.get("p");
  } catch { /* not a URL */ }
  if (urlOrPayload.length > 80 && /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/.test(urlOrPayload)) {
    return urlOrPayload;
  }
  return null;
}
