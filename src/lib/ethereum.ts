import { createPublicClient, http, formatEther, formatUnits, type Address, type Chain } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { TRACKED_TOKENS, ERC20_ABI } from "./constants";
import { MAINNET_RPC, SEPOLIA_RPC } from "./wagmi-config";
import { discoverTokens } from "./alchemy";
import type { TokenBalance, Transaction } from "@/types";

// Cache public clients — reuse connections instead of creating fresh on every call
const clientCache = new Map<number, ReturnType<typeof createPublicClient>>();

function getClient(chainId: number) {
  const cached = clientCache.get(chainId);
  if (cached) return cached;
  const isSepolia = chainId === sepolia.id;
  const chain: Chain = isSepolia ? sepolia : mainnet;
  const rpc = isSepolia ? SEPOLIA_RPC : MAINNET_RPC;
  const client = createPublicClient({ chain, transport: http(rpc, { timeout: 5_000 }) });
  clientCache.set(chainId, client);
  return client;
}

export function getNetworkName(chainId: number): string {
  if (chainId === sepolia.id) return "Sepolia Testnet";
  return "Ethereum Mainnet";
}

// Blockscout for all chains — free, no API key needed
function getBlockscoutBase(chainId: number): string {
  if (chainId === sepolia.id) return "https://eth-sepolia.blockscout.com/api";
  return "https://eth.blockscout.com/api";
}

function buildUrl(chainId: number, params: Record<string, string>): string {
  return `${getBlockscoutBase(chainId)}?${new URLSearchParams(params).toString()}`;
}

export async function getEthBalance(address: Address, chainId: number = 1): Promise<{ balance: number; raw: bigint }> {
  const client = getClient(chainId);
  const raw = await client.getBalance({ address });
  return { balance: parseFloat(formatEther(raw)), raw };
}

/**
 * Detect and fetch all ERC-20 token balances for a wallet.
 *
 * Primary: Alchemy token discovery (finds every token the wallet holds)
 * Fallback: hardcoded TRACKED_TOKENS list (26 major tokens)
 *
 * Balances are fetched at the given blockNumber for deterministic signing.
 * If no blockNumber is provided, fetches at the latest block.
 */
export async function getTokenBalances(
  address: Address,
  chainId: number = 1,
  blockNumber?: number
): Promise<TokenBalance[]> {
  if (chainId !== mainnet.id) return [];

  // Try Alchemy-based discovery first
  const discovered = await discoverTokens(address, chainId);
  if (discovered && discovered.length > 0) {
    return fetchBalancesForDiscoveredTokens(address, discovered, chainId, blockNumber);
  }

  // Alchemy unavailable or returned nothing — fall back to hardcoded list
  if (discovered === null) {
    console.info("Alchemy unavailable, falling back to hardcoded token list");
  }
  return fetchHardcodedTokenBalances(address, chainId, blockNumber);
}

/**
 * Fetch balances for Alchemy-discovered tokens via multicall at a specific block.
 */
async function fetchBalancesForDiscoveredTokens(
  address: Address,
  discovered: { contractAddress: string; name: string; symbol: string; decimals: number }[],
  chainId: number,
  blockNumber?: number
): Promise<TokenBalance[]> {
  const client = getClient(chainId);

  const contracts = discovered.map((t) => ({
    address: t.contractAddress as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf" as const,
    args: [address],
  }));

  let results;
  try {
    results = await client.multicall({
      contracts,
      ...(blockNumber ? { blockNumber: BigInt(blockNumber) } : {}),
    });
  } catch {
    // If multicall fails at the specific block, try without blockNumber
    try {
      results = await client.multicall({ contracts });
    } catch {
      return [];
    }
  }

  const tokens: TokenBalance[] = [];
  for (let i = 0; i < discovered.length; i++) {
    const result = results[i];
    const token = discovered[i];
    if (result.status === "success" && result.result) {
      const rawBalance = result.result as bigint;
      if (rawBalance > BigInt(0)) {
        const balanceFormatted = parseFloat(formatUnits(rawBalance, token.decimals));
        tokens.push({
          name: token.name,
          symbol: token.symbol,
          balance: rawBalance.toString(),
          balanceFormatted,
          decimals: token.decimals,
          contractAddress: token.contractAddress.toLowerCase(),
          priceUsd: 0,
          valueUsd: 0,
        });
      }
    }
  }
  return tokens;
}

/**
 * Original hardcoded token balance fetching — used as fallback.
 */
async function fetchHardcodedTokenBalances(
  address: Address,
  chainId: number,
  blockNumber?: number
): Promise<TokenBalance[]> {
  const client = getClient(chainId);

  const contracts = TRACKED_TOKENS.map((token) => ({
    address: token.address as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf" as const,
    args: [address],
  }));

  let results;
  try {
    results = await client.multicall({
      contracts,
      ...(blockNumber ? { blockNumber: BigInt(blockNumber) } : {}),
    });
  } catch { return []; }

  const tokens: TokenBalance[] = [];
  for (let i = 0; i < TRACKED_TOKENS.length; i++) {
    const result = results[i];
    const token = TRACKED_TOKENS[i];
    if (result.status === "success" && result.result) {
      const rawBalance = result.result as bigint;
      if (rawBalance > BigInt(0)) {
        const balanceFormatted = parseFloat(formatUnits(rawBalance, token.decimals));
        tokens.push({
          name: token.name, symbol: token.symbol, balance: rawBalance.toString(),
          balanceFormatted, decimals: token.decimals, contractAddress: token.address,
          priceUsd: 0, valueUsd: 0,
        });
      }
    }
  }
  return tokens;
}

export async function getTransactionHistory(
  address: string, startTimestamp: number, endTimestamp: number,
  chainId: number = 1, ethPriceUsd: number = 0, tokenPrices: Record<string, number> = {}
): Promise<{ transactions: Transaction[]; totalCount: number }> {
  const startBlock = await getBlockByTimestamp(startTimestamp, "after", chainId);
  const endBlock = await getBlockByTimestamp(endTimestamp, "before", chainId);

  const [ethTxs, tokenTxs] = await Promise.all([
    fetchExplorerTxs("txlist", address, startBlock, endBlock, chainId),
    fetchExplorerTxs("tokentx", address, startBlock, endBlock, chainId),
  ]);

  const transactions: Transaction[] = [];

  for (const tx of ethTxs) {
    if (!tx.value || tx.value === "0") continue;
    const ts = parseInt(tx.timeStamp);
    if (ts < startTimestamp || ts > endTimestamp) continue; // enforce date range
    const isReceive = tx.to?.toLowerCase() === address.toLowerCase();
    const ethAmount = parseFloat(formatEther(BigInt(tx.value)));
    transactions.push({
      hash: tx.hash, from: tx.from, to: tx.to || "", value: tx.value,
      timestamp: ts, blockNumber: parseInt(tx.blockNumber),
      gasUsed: tx.gasUsed || "0", gasPrice: tx.gasPrice || "0",
      type: isReceive ? "receive" : "send",
      valueUsd: ethAmount * ethPriceUsd,
      description: `${isReceive ? "Received" : "Sent"} ${ethAmount.toFixed(4)} ETH`,
    });
  }

  // Collect unique token symbols from transactions to fetch missing prices
  const STABLECOINS = new Set(["USDC", "USDT", "DAI", "PYUSD", "BUSD", "TUSD", "FRAX", "LUSD", "GUSD", "EURC", "USDP", "cUSD", "USDbC"]);
  const missingSymbols = new Set<string>();
  for (const tx of tokenTxs) {
    const sym = tx.tokenSymbol || "";
    if (sym && !tokenPrices[sym] && !STABLECOINS.has(sym)) missingSymbols.add(sym);
  }

  // Fetch prices for tokens we don't have yet (merged into new object to avoid mutating caller's reference)
  let mergedPrices = tokenPrices;
  if (missingSymbols.size > 0) {
    try {
      const { fetchPrices } = await import("./prices");
      const extra = await fetchPrices([...missingSymbols]);
      mergedPrices = { ...tokenPrices, ...extra };
    } catch { /* continue with what we have */ }
  }

  for (const tx of tokenTxs) {
    const ts = parseInt(tx.timeStamp);
    if (ts < startTimestamp || ts > endTimestamp) continue;
    const isReceive = tx.to?.toLowerCase() === address.toLowerCase();
    const decimals = parseInt(tx.tokenDecimal || "18");
    const amount = parseFloat(formatUnits(BigInt(tx.value), decimals));
    const symbol = tx.tokenSymbol || "";
    const tokenPrice = mergedPrices[symbol] || (STABLECOINS.has(symbol) ? 1 : 0);
    const usdValue = amount * tokenPrice;

    // Skip spam airdrops: tokens with no USD value from null address or with $ in symbol
    if (usdValue === 0 && (
      tx.from?.toLowerCase() === "0x0000000000000000000000000000000000000000" ||
      symbol.startsWith("$") ||
      amount > 1_000_000
    )) continue;

    transactions.push({
      hash: tx.hash, from: tx.from, to: tx.to || "", value: tx.value,
      timestamp: ts, blockNumber: parseInt(tx.blockNumber),
      tokenSymbol: symbol, tokenName: tx.tokenName,
      gasUsed: tx.gasUsed || "0", gasPrice: tx.gasPrice || "0",
      type: isReceive ? "receive" : "send",
      valueUsd: usdValue,
      description: `${isReceive ? "Received" : "Sent"} ${amount.toFixed(4)} ${symbol}`,
    });
  }

  transactions.sort((a, b) => b.timestamp - a.timestamp);
  const totalCount = transactions.length;
  return { transactions: transactions.slice(0, 500), totalCount };
}

async function getBlockByTimestamp(timestamp: number, closest: "before" | "after", chainId: number): Promise<string> {
  const url = buildUrl(chainId, { module: "block", action: "getblocknobytime", timestamp: timestamp.toString(), closest });
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "1" && data.result && data.result !== "0") return data.result;
  } catch { /* continue to fallback */ }
  // Fallback: use latest block for "before" or earliest reasonable for "after"
  if (closest === "before") {
    try { return String(await getClient(chainId).getBlockNumber()); } catch { /* */ }
  }
  return "1"; // Block 1, not 0 (genesis) — avoids fetching entire chain history
}

const PAGE_SIZE = 1000;
const MAX_TRANSACTIONS = 500;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchExplorerTxs(action: string, address: string, startBlock: string, endBlock: string, chainId: number): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all: any[] = [];
  let page = 1;

  while (all.length < MAX_TRANSACTIONS) {
    const url = buildUrl(chainId, {
      module: "account", action, address,
      startblock: startBlock, endblock: endBlock,
      sort: "desc", page: page.toString(), offset: PAGE_SIZE.toString(),
    });

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!Array.isArray(data.result) || data.result.length === 0) break;
      all.push(...data.result);
      if (data.result.length < PAGE_SIZE) break; // last page
      page++;
    } catch {
      break;
    }
  }

  return all.slice(0, MAX_TRANSACTIONS);
}

export async function getEnsName(address: Address): Promise<string | null> {
  // ENS only exists on mainnet — always resolve from mainnet regardless of connected chain
  try { return await getClient(1).getEnsName({ address }); } catch { return null; }
}

export async function getBlockNumber(chainId: number = 1): Promise<number> {
  return Number(await getClient(chainId).getBlockNumber());
}
