/**
 * Alchemy token detection — discovers all ERC-20 tokens a wallet holds.
 *
 * Uses alchemy_getTokenBalances for discovery and alchemy_getTokenMetadata
 * for name/symbol/decimals. Falls back gracefully if no Alchemy key is set.
 */

import { createPublicClient, http, type Chain } from "viem";
import { mainnet, sepolia } from "viem/chains";

export interface DiscoveredToken {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  rawBalance: string; // hex from Alchemy — current balance, NOT pinned
}

interface AlchemyTokenBalanceResult {
  address: string;
  tokenBalances: { contractAddress: string; tokenBalance: string }[];
  pageKey?: string;
}

interface AlchemyTokenMetadata {
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  logo: string | null;
}

// Spam detection patterns
const SPAM_PATTERNS = [
  /^https?:\/\//i,           // URLs in name
  /\.(com|io|xyz|net|org)/i, // domains in name
  /^\$[A-Z]/,                // $TOKEN style
  /visit|claim|airdrop/i,    // phishing
  /[\u0000-\u001f]/,         // control characters
];

function getAlchemyUrl(chainId: number): string | null {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) return null;

  if (chainId === mainnet.id) return `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
  if (chainId === sepolia.id) return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
  return null;
}

function getAlchemyClient(chainId: number) {
  const url = getAlchemyUrl(chainId);
  if (!url) return null;

  const chain: Chain = chainId === sepolia.id ? sepolia : mainnet;
  return createPublicClient({ chain, transport: http(url, { timeout: 15_000 }) });
}

/**
 * Discover all ERC-20 tokens a wallet currently holds via Alchemy.
 * Returns token addresses with metadata. Returns null if Alchemy is unavailable.
 */
export async function discoverTokens(
  address: string,
  chainId: number
): Promise<DiscoveredToken[] | null> {
  const client = getAlchemyClient(chainId);
  if (!client) return null;

  // 1. Get all token balances (paginated)
  let allBalances: { contractAddress: string; tokenBalance: string }[] = [];
  let pageKey: string | undefined;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rpc = client.request as (args: { method: string; params: unknown[] }) => Promise<any>;

    do {
      const opts = pageKey ? { pageKey } : undefined;
      const params = opts ? [address, "erc20", opts] : [address, "erc20"];

      const result: AlchemyTokenBalanceResult = await rpc({
        method: "alchemy_getTokenBalances",
        params,
      });

      allBalances = allBalances.concat(result.tokenBalances);
      pageKey = result.pageKey;
    } while (pageKey);
  } catch (e) {
    console.warn("Alchemy token discovery failed:", e);
    return null;
  }

  // 2. Filter zero balances
  const nonZero = allBalances.filter((t) => {
    const bal = t.tokenBalance;
    return bal && bal !== "0x" && bal !== "0x0" && bal !== "0x0000000000000000000000000000000000000000000000000000000000000000";
  });

  if (nonZero.length === 0) return [];

  // 3. Fetch metadata for each token (parallelized)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpc = client.request as (args: { method: string; params: unknown[] }) => Promise<any>;

  const metadataResults = await Promise.allSettled(
    nonZero.map(async (t) => {
      try {
        const meta: AlchemyTokenMetadata = await rpc({
          method: "alchemy_getTokenMetadata",
          params: [t.contractAddress],
        });
        return { ...t, meta };
      } catch {
        return { ...t, meta: null as AlchemyTokenMetadata | null };
      }
    })
  );

  // 4. Build token list, filter spam
  const tokens: DiscoveredToken[] = [];
  for (const result of metadataResults) {
    if (result.status !== "fulfilled") continue;
    const { contractAddress, tokenBalance, meta } = result.value;

    const name = meta?.name || "Unknown Token";
    const symbol = meta?.symbol || "???";
    const decimals = meta?.decimals ?? 18;

    // Skip tokens with no symbol or suspicious metadata
    if (!meta?.symbol) continue;
    if (isSpamName(name) || isSpamName(symbol)) continue;

    tokens.push({
      contractAddress: contractAddress.toLowerCase(),
      name,
      symbol,
      decimals,
      rawBalance: tokenBalance,
    });
  }

  return tokens;
}

function isSpamName(value: string): boolean {
  if (value.length > 50) return true;
  return SPAM_PATTERNS.some((p) => p.test(value));
}

/**
 * Check if Alchemy is configured and available for this chain.
 */
export function isAlchemyAvailable(chainId: number): boolean {
  return getAlchemyUrl(chainId) !== null;
}
