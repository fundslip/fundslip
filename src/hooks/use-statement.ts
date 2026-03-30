"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import { signTypedData as coreSignTypedData, reconnect as coreReconnect } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi-config";
import type {
  StatementPeriod, StatementType, StatementData,
  GenerateStep, PersonalDetails, Transaction,
} from "@/types";
import {
  getEthBalance, getTokenBalances, getTransactionHistory,
  getEnsName, getBlockNumber, getNetworkName,
} from "@/lib/ethereum";
import { fetchPrices, fetchPricesByContract, fetchHistoricalPrices, fetchHistoricalEthPrice } from "@/lib/prices";
import {
  computeDataHash, buildSigningRequest, buildPayload,
  statementTypeToCode, embedPayloadInPdf,
} from "@/lib/verification";
import type { Address } from "viem";

const BAL_KEY = "fundslip:bal:";

function readBalanceCache(address: string, chainId: number): number {
  try {
    const v = localStorage.getItem(`${BAL_KEY}${address.toLowerCase()}:${chainId}`);
    return v ? parseFloat(v) : 0;
  } catch { return 0; }
}

function writeBalanceCache(address: string, chainId: number, balance: number) {
  try { localStorage.setItem(`${BAL_KEY}${address.toLowerCase()}:${chainId}`, String(balance)); } catch { /* */ }
}

function makeStatementId(blockNumber: number): string {
  return `FS-${blockNumber}`;
}

export function useStatement() {
  const { address, chain } = useAccount();
  const fallbackChainId = useChainId();
  // Use the wallet's connected chain — this is what the wallet will actually sign with
  const chainId = chain?.id || fallbackChainId;

  const [step, setStep] = useState<GenerateStep>("config");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [period, setPeriod] = useState<StatementPeriod>("7d");
  const [statementType, setStatementType] = useState<StatementType>("full-history");
  const [statementData, setStatementData] = useState<StatementData | null>(null);
  const [verificationHash, setVerificationHash] = useState("");
  const [statementId, setStatementId] = useState("");
  const [totalBalance, setTotalBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const [customStart, setCustomStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split("T")[0]);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({ fullName: "", address: "" });

  // Revoke blob URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  // Fetch balance — cache-first, refresh in background
  useEffect(() => {
    if (!address) { setTotalBalance(0); return; }

    // Instantly show cached balance for this address+chain (no network wait)
    const cached = readBalanceCache(address, chainId);
    if (cached > 0) setTotalBalance(cached);

    // Fetch fresh in background
    let cancelled = false;
    (async () => {
      try {
        const [ethResult, tokens, ethPrice] = await Promise.all([
          getEthBalance(address as Address, chainId),
          getTokenBalances(address as Address, chainId),
          fetchPrices(["ETH"]).then(p => p.ETH || 0).catch(() => 0),
        ]);

        let total = ethResult.balance * ethPrice;

        if (tokens.length > 0) {
          // Use contract-based pricing for dynamically detected tokens
          const contractAddrs = tokens.map(t => t.contractAddress);
          const contractPrices = await fetchPricesByContract(contractAddrs).catch(() => new Map<string, number>());

          // Also try symbol-based as fallback for known tokens
          const unpricedSymbols = tokens
            .filter(t => !contractPrices.has(t.contractAddress.toLowerCase()))
            .map(t => t.symbol);
          const symbolPrices = unpricedSymbols.length > 0
            ? await fetchPrices(unpricedSymbols).catch(() => ({} as Record<string, number>))
            : {};

          for (const t of tokens) {
            const price = contractPrices.get(t.contractAddress.toLowerCase()) || symbolPrices[t.symbol] || 0;
            total += t.balanceFormatted * price;
          }
        }

        if (!cancelled) {
          setTotalBalance(total);
          writeBalanceCache(address, chainId, total);
        }
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [address, chainId]);

  /**
   * Flow:
   * 1. Fetch on-chain data at pinned block
   * 2. Serialize → compute dataHash
   * 3. Prompt EIP-712 signature (using @wagmi/core to handle chain mismatch)
   * 4. Build Base58 payload → embed in PDF metadata
   * 5. Return signed PDF
   */
  const generate = useCallback(() => {
    if (!address) return;
    setError(null);
    setStep("generating");
    setCurrentProgress(0);

    const sType = statementType;
    const per = period;
    const cs = customStart;
    const ce = customEnd;
    const pd = personalDetails;
    const cid = chainId;
    const addr = address;

    (async () => {
      try {
        // 1. Pin the block
        let blockNumber = 0;
        try { blockNumber = await getBlockNumber(cid); } catch { /* */ }

        // 2. Fetch on-chain data (balances at pinned block)
        let ethBalanceRaw = BigInt(0);
        let ethBalanceNum = 0;
        try {
          const result = await getEthBalance(addr as Address, cid);
          ethBalanceRaw = result.raw;
          ethBalanceNum = result.balance;
        } catch (e) { console.error("ETH:", e); }

        let tokens: Awaited<ReturnType<typeof getTokenBalances>> = [];
        try { tokens = await getTokenBalances(addr as Address, cid, blockNumber); } catch (e) { console.error("Tokens:", e); }
        setCurrentProgress(1);

        // Calculate period dates FIRST — needed to determine if we use historical pricing
        const end = new Date();
        const start = new Date();
        switch (per) {
          case "7d": start.setDate(start.getDate() - 7); break;
          case "30d": start.setDate(start.getDate() - 30); break;
          case "90d": start.setDate(start.getDate() - 90); break;
          case "custom":
            start.setTime(new Date(cs + "T00:00:00").getTime());
            end.setTime(new Date(ce + "T23:59:59").getTime());
            break;
        }
        // Validate date range
        if (start >= end) {
          setError("Start date must be before end date.");
          setStep("config");
          return;
        }
        const periodStartTs = Math.floor(start.getTime() / 1000);
        const periodEndTs = Math.floor(end.getTime() / 1000);

        // 3. Fetch prices — historical for past periods, current for today
        let ethPriceUsd = 0;
        let isHistoricalPricing = false;
        const contractPrices = new Map<string, number>();

        try {
          // ETH price
          const ethResult = await fetchHistoricalEthPrice(periodEndTs);
          ethPriceUsd = ethResult.price;
          isHistoricalPricing = ethResult.isHistorical;

          // Token prices
          if (tokens.length > 0) {
            const contractAddrs = tokens.map(t => t.contractAddress);
            const { prices: fetched } = await fetchHistoricalPrices(contractAddrs, periodEndTs);
            for (const [a, price] of fetched) contractPrices.set(a, price);

            // Fallback: current prices for tokens CoinGecko couldn't price historically
            const unpriced = tokens.filter(t => !contractPrices.has(t.contractAddress.toLowerCase()));
            if (unpriced.length > 0) {
              const currentPrices = await fetchPricesByContract(unpriced.map(t => t.contractAddress)).catch(() => new Map<string, number>());
              for (const [a, p] of currentPrices) {
                if (!contractPrices.has(a)) contractPrices.set(a, p);
              }
            }
          }
        } catch (e) { console.error("Prices:", e); }

        const ethValueUsd = ethBalanceNum * ethPriceUsd;

        // Build priced token list
        const pricedTokens = tokens.map(t => {
          const price = contractPrices.get(t.contractAddress.toLowerCase()) || 0;
          return { ...t, priceUsd: price, valueUsd: t.balanceFormatted * price };
        });

        pricedTokens.sort((a, b) => {
          if (a.valueUsd > 0 && b.valueUsd > 0) return b.valueUsd - a.valueUsd;
          if (a.valueUsd > 0) return -1;
          if (b.valueUsd > 0) return 1;
          return a.symbol.localeCompare(b.symbol);
        });

        setCurrentProgress(2);

        // Build symbol prices map for transaction history
        const symbolPricesForTxs: Record<string, number> = {};
        for (const t of pricedTokens) {
          if (t.priceUsd > 0) symbolPricesForTxs[t.symbol] = t.priceUsd;
        }

        // Transactions
        let transactions: Transaction[] = [];
        let totalTransactionCount = 0;
        let txHashes: string[] = [];
        if (sType !== "balance-snapshot") {
          try {
            const result = await getTransactionHistory(addr, periodStartTs, periodEndTs, cid, ethPriceUsd, symbolPricesForTxs);
            transactions = result.transactions;
            totalTransactionCount = result.totalCount;
            txHashes = transactions.map(tx => tx.hash).sort();
          } catch (e) { console.error("Transactions:", e); }
        }

        // ENS always resolves from mainnet (it's identity, not chain-specific)
        let ensName: string | null = null;
        try { ensName = await getEnsName(addr as Address); } catch { /* */ }

        const totalValueUsd = ethValueUsd + pricedTokens.reduce((sum, t) => sum + t.valueUsd, 0);
        setTotalBalance(totalValueUsd);
        setCurrentProgress(3);

        // 3. Deterministic serialization → dataHash
        // ALL tokens (priced and unpriced) go into the hash for completeness
        const stypeCode = statementTypeToCode(sType);
        const tokenBalancesForHash = tokens.map(t => ({ address: t.contractAddress, balance: t.balance }));

        const dataHash = computeDataHash(
          addr, cid, blockNumber, periodStartTs, periodEndTs,
          ethBalanceRaw, tokenBalancesForHash, txHashes, stypeCode
        );

        const sid = makeStatementId(blockNumber);
        const data: StatementData = {
          walletAddress: addr, ensName, network: "ethereum",
          periodStart: start, periodEnd: end, statementType: sType,
          ethBalance: ethBalanceNum, ethPriceUsd, ethValueUsd, tokens: pricedTokens,
          transactions, totalValueUsd, generatedAt: new Date(), blockNumber,
          personalDetails: pd.fullName || pd.address ? pd : undefined,
          networkName: getNetworkName(cid), totalTransactionCount,
          priceDate: isHistoricalPricing ? end : new Date(),
          isHistoricalPricing,
        };

        // 4. Prompt EIP-712 signature (using @wagmi/core for chain mismatch handling)
        setStep("signing");

        const sigRequest = buildSigningRequest(addr, blockNumber, stypeCode, dataHash);
        const signPayload = {
          domain: sigRequest.domain,
          types: sigRequest.types,
          primaryType: sigRequest.primaryType,
          message: sigRequest.message,
        };

        let signature: `0x${string}`;
        try {
          signature = await coreSignTypedData(wagmiConfig, signPayload);
        } catch (signErr: unknown) {
          // Handle wagmi ConnectorChainMismatchError by reconnecting and retrying
          if (signErr instanceof Error && signErr.name === "ConnectorChainMismatchError") {
            try {
              await coreReconnect(wagmiConfig);
              signature = await coreSignTypedData(wagmiConfig, signPayload);
            } catch {
              setError("Chain mismatch. Please refresh the page and try again.");
              setStep("config");
              return;
            }
          } else {
            console.error("EIP-712 sign error:", signErr);
            setError("Signature was rejected. Please try again.");
            setStep("config");
            return;
          }
        }

        // 5. Build compact payload (the "fingerprint")
        const payload = buildPayload(addr, cid, blockNumber, stypeCode, dataHash, signature);

        // 6. Generate PDF with the fingerprint + verify URL baked in
        const { generatePdfBlob } = await import("@/lib/pdf");
        const verifyUrl = `${window.location.origin}/verify?p=${encodeURIComponent(payload)}`;
        const genPdfBlob = await generatePdfBlob(data, payload, sid, verifyUrl);
        const pdfBytes = new Uint8Array(await genPdfBlob.arrayBuffer());

        // 7. Embed payload in PDF metadata too (for drag-and-drop verification)
        const signedPdfBytes = await embedPayloadInPdf(pdfBytes, payload);
        const signedBlob = new Blob([signedPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

        setStatementData(data);
        setVerificationHash(payload);
        setStatementId(sid);
        setPdfBlob(signedBlob);
        setPdfBlobUrl(URL.createObjectURL(signedBlob));
        setStep("ready");

      } catch (err) {
        console.error("Generation failed:", err);
        setError("Something went wrong. Please try again.");
        setStep("config");
      }
    })();
  }, [address, chainId, statementType, period, customStart, customEnd, personalDetails]);

  const reset = useCallback(() => {
    setStep("config");
    setCurrentProgress(0);
    setStatementData(null);
    setVerificationHash("");
    setStatementId("");
    setError(null);
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    setPdfBlobUrl(null);
    setPdfBlob(null);

  }, [pdfBlobUrl]);

  return {
    step, currentProgress, period, setPeriod, statementType, setStatementType,
    chainId, statementData, verificationHash, statementId,
    totalBalance, generate, reset, customStart, setCustomStart, customEnd,
    setCustomEnd, personalDetails, setPersonalDetails, error, pdfBlobUrl, pdfBlob,
  };
}
