"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useSignTypedData, useChainId } from "wagmi";
import type {
  StatementPeriod, StatementType, Network, StatementData,
  GenerateStep, PersonalDetails, Transaction,
} from "@/types";
import {
  getEthBalance, getTokenBalances, getTransactionHistory,
  getEnsName, getBlockNumber, getNetworkName,
} from "@/lib/ethereum";
import { fetchPrices } from "@/lib/prices";
import {
  computeDataHash, buildSigningRequest, buildPayload,
  statementTypeToCode, embedPayloadInPdf,
} from "@/lib/verification";
import type { Address } from "viem";

function makeStatementId(): string {
  return `FS-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function useStatement() {
  const { address, chain } = useAccount();
  const { signTypedData } = useSignTypedData();
  const fallbackChainId = useChainId();
  // Use the wallet's connected chain — this is what the wallet will actually sign with
  const chainId = chain?.id || fallbackChainId;

  const [step, setStep] = useState<GenerateStep>("config");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [period, setPeriod] = useState<StatementPeriod>("7d");
  const [statementType, setStatementType] = useState<StatementType>("full-history");
  const [networks, setNetworks] = useState<Network[]>(["ethereum"]);
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

  // Pending state for the signing step
  // (signing state managed via signTypedData callbacks — no explicit pending state needed)

  // Fetch balance on connect
  useEffect(() => {
    if (!address) { setTotalBalance(0); return; }
    let cancelled = false;
    (async () => {
      try {
        const { balance } = await getEthBalance(address as Address, chainId);
        const prices = await fetchPrices(["ETH"]);
        const ethPrice = prices.ETH || 0;
        if (!cancelled) setTotalBalance(balance * ethPrice);
        const tokens = await getTokenBalances(address as Address, chainId);
        const syms = tokens.map(t => t.symbol);
        const tp = syms.length > 0 ? await fetchPrices(syms) : {};
        const tv = tokens.reduce((s, t) => s + t.balanceFormatted * (tp[t.symbol] || 0), 0);
        if (!cancelled) setTotalBalance(balance * ethPrice + tv);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [address, chainId]);

  const toggleNetwork = useCallback((network: Network) => {
    setNetworks(prev => prev.includes(network) ? prev.filter(n => n !== network) : [...prev, network]);
  }, []);

  /**
   * Flow:
   * 1. Fetch on-chain data at pinned block
   * 2. Serialize → compute dataHash
   * 3. Generate unsigned PDF
   * 4. Prompt EIP-712 signature
   * 5. Build Base58 payload → embed in PDF metadata
   * 6. Return signed PDF
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

        // 2. Fetch on-chain data
        let ethBalanceRaw = BigInt(0);
        let ethBalanceNum = 0;
        try {
          const result = await getEthBalance(addr as Address, cid);
          ethBalanceRaw = result.raw;
          ethBalanceNum = result.balance;
        } catch (e) { console.error("ETH:", e); }

        let tokens: Awaited<ReturnType<typeof getTokenBalances>> = [];
        try { tokens = await getTokenBalances(addr as Address, cid); } catch (e) { console.error("Tokens:", e); }
        setCurrentProgress(1);

        let prices: Record<string, number> = {};
        try { prices = await fetchPrices(["ETH", ...tokens.map(t => t.symbol)]); } catch (e) { console.error("Prices:", e); }

        const ethPriceUsd = prices.ETH || 0;
        const ethValueUsd = ethBalanceNum * ethPriceUsd;
        const pricedTokens = tokens.map(t => ({
          ...t, priceUsd: prices[t.symbol] || 0, valueUsd: t.balanceFormatted * (prices[t.symbol] || 0),
        }));
        setCurrentProgress(2);

        // Period dates
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
        const periodStartTs = Math.floor(start.getTime() / 1000);
        const periodEndTs = Math.floor(end.getTime() / 1000);

        // Transactions
        let transactions: Transaction[] = [];
        let totalTransactionCount = 0;
        let txHashes: string[] = [];
        if (sType !== "balance-snapshot") {
          try {
            const result = await getTransactionHistory(addr, periodStartTs, periodEndTs, cid, ethPriceUsd, prices);
            transactions = result.transactions;
            totalTransactionCount = result.totalCount;
            txHashes = transactions.map(tx => tx.hash).sort();
          } catch (e) { console.error("Transactions:", e); }
        }

        let ensName: string | null = null;
        try { ensName = await getEnsName(addr as Address, cid); } catch { /* */ }

        const totalValueUsd = ethValueUsd + pricedTokens.reduce((sum, t) => sum + t.valueUsd, 0);
        setTotalBalance(totalValueUsd);
        setCurrentProgress(3);

        // 3. Deterministic serialization → dataHash
        const stypeCode = statementTypeToCode(sType);
        const tokenBalancesForHash = tokens.map(t => ({ address: t.contractAddress, balance: t.balance }));

        const dataHash = computeDataHash(
          addr, cid, blockNumber, periodStartTs, periodEndTs,
          ethBalanceRaw, tokenBalancesForHash, txHashes, stypeCode
        );

        const sid = makeStatementId();
        const data: StatementData = {
          walletAddress: addr, ensName, network: "ethereum",
          periodStart: start, periodEnd: end, statementType: sType,
          ethBalance: ethBalanceNum, ethPriceUsd, ethValueUsd, tokens: pricedTokens,
          transactions, totalValueUsd, generatedAt: new Date(), blockNumber,
          personalDetails: pd.fullName || pd.address ? pd : undefined,
          networkName: getNetworkName(cid), totalTransactionCount,
        };

        // 4. Prompt EIP-712 signature first
        setStep("signing");

        const sigRequest = buildSigningRequest(addr, blockNumber, stypeCode, dataHash);

        signTypedData(
          {
            domain: sigRequest.domain,
            types: sigRequest.types,
            primaryType: sigRequest.primaryType,
            message: sigRequest.message,
          },
          {
            onSuccess: async (signature) => {
              try {
                // 5. Build compact payload (the "fingerprint")
                const payload = buildPayload(
                  addr, cid, blockNumber, stypeCode, dataHash, signature
                );

                // 6. Generate PDF with the fingerprint + verify URL baked in
                const { generatePdfBlob } = await import("@/lib/pdf");
                const verifyUrl = `${window.location.origin}/verify?p=${encodeURIComponent(payload)}`;
                const pdfBlob = await generatePdfBlob(data, payload, sid, verifyUrl);
                const pdfBytes = new Uint8Array(await pdfBlob.arrayBuffer());

                // 7. Embed payload in PDF metadata too (for drag-and-drop verification)
                const signedPdfBytes = await embedPayloadInPdf(pdfBytes, payload);
                const signedBlob = new Blob([signedPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

                setStatementData(data);
                setVerificationHash(payload);
                setStatementId(sid);
                setPdfBlob(signedBlob);
                setPdfBlobUrl(URL.createObjectURL(signedBlob));
                setStep("ready");

              } catch (e) {
                console.error("PDF finalization:", e);
                setError("Failed to finalize the statement. Please try again.");
                setStep("config");

              }
            },
            onError: (err) => {
              console.error("EIP-712 sign error:", err);
              setError("Signature was rejected. Please try again.");
              setStep("config");

            },
          }
        );
      } catch (err) {
        console.error("Generation failed:", err);
        setError("Something went wrong. Please try again.");
        setStep("config");
      }
    })();
  }, [address, chainId, statementType, period, customStart, customEnd, personalDetails, signTypedData]);

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
    networks, toggleNetwork, statementData, verificationHash, statementId,
    totalBalance, generate, reset, customStart, setCustomStart, customEnd,
    setCustomEnd, personalDetails, setPersonalDetails, error, pdfBlobUrl, pdfBlob,
  };
}
