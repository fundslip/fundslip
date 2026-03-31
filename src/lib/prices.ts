import { TRACKED_TOKENS } from "./constants";

// Proxied through Next.js API route to avoid CORS on rate-limited responses
const CG_BASE = "/api/coingecko";

const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
  WETH: "weth",
  WBTC: "wrapped-bitcoin",
  LINK: "chainlink",
  UNI: "uniswap",
  AAVE: "aave",
  MKR: "maker",
  SNX: "havven",
  COMP: "compound-governance-token",
  CRV: "curve-dao-token",
  LDO: "lido-dao",
  APE: "apecoin",
  SHIB: "shiba-inu",
  MATIC: "matic-network",
  ARB: "arbitrum",
  OP: "optimism",
  stETH: "staked-ether",
  rETH: "rocket-pool-eth",
  cbETH: "coinbase-wrapped-staked-eth",
  PEPE: "pepe",
  ENS: "ethereum-name-service",
  RPL: "rocket-pool",
  GRT: "the-graph",
};

// ─── Caching ───

const CACHE_TTL = 5 * 60_000; // 5 minutes

let priceCache: { prices: Record<string, number>; timestamp: number } | null = null;

// Session-level historical price cache: "key" → price
const historicalCache = new Map<string, number>();

// Deduplication — prevents duplicate concurrent fetches
const inflightRequests = new Map<string, Promise<Response | null>>();

async function deduplicatedFetch(url: string): Promise<Response | null> {
  const existing = inflightRequests.get(url);
  if (existing) return existing;

  const promise = fetchOnce(url).finally(() => inflightRequests.delete(url));
  inflightRequests.set(url, promise);
  return promise;
}

// ─── Public API ───

/**
 * Fetch prices by symbol. This is the primary pricing method.
 * 1 API call for any number of symbols. Cached for 5 minutes.
 */
export async function fetchPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  // Return cached if fresh AND has ALL requested symbols
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
    const cached: Record<string, number> = {};
    let allFound = true;
    for (const s of symbols) {
      if (priceCache.prices[s] !== undefined) {
        cached[s] = priceCache.prices[s];
      } else if (COINGECKO_IDS[s]) {
        // Only count as missing if it's a known symbol we can actually fetch
        allFound = false;
      }
    }
    if (allFound) return cached;
  }

  const ids = symbols
    .map((s) => COINGECKO_IDS[s])
    .filter(Boolean);

  if (ids.length === 0) return {};

  const prices = await fetchFromCoinGecko(ids, symbols);
  if (Object.keys(prices).length > 0) {
    // Merge with existing cache
    priceCache = {
      prices: { ...(priceCache?.prices || {}), ...prices },
      timestamp: Date.now(),
    };
    return prices;
  }

  // Fallback: CryptoCompare
  const fallbackPrices = await fetchFromFallback(symbols);
  if (Object.keys(fallbackPrices).length > 0) {
    priceCache = {
      prices: { ...(priceCache?.prices || {}), ...fallbackPrices },
      timestamp: Date.now(),
    };
    return fallbackPrices;
  }

  return {};
}

// Real contract addresses → symbol. Only tokens at these exact addresses get priced.
// A fake token with symbol "USDT" at a random address will NOT be priced.
const VERIFIED_ADDRESS_TO_SYMBOL = new Map<string, string>(
  TRACKED_TOKENS.map(t => [t.address.toLowerCase(), t.symbol])
);

/**
 * Price a list of tokens. 1 API call total.
 * Only prices tokens whose contract address matches a known legitimate token.
 * Fake/spam tokens with copied symbols get $0.
 */
export async function priceTokensBySymbol(
  tokens: { symbol: string; contractAddress: string }[]
): Promise<Map<string, number>> {
  if (tokens.length === 0) return new Map();

  // Only trust tokens at verified contract addresses
  const verifiedSymbols = new Set<string>();
  for (const t of tokens) {
    const realSymbol = VERIFIED_ADDRESS_TO_SYMBOL.get(t.contractAddress.toLowerCase());
    if (realSymbol) verifiedSymbols.add(realSymbol);
  }

  if (verifiedSymbols.size === 0) return new Map();

  // 1 API call for all verified symbols
  const prices = await fetchPrices([...verifiedSymbols]);

  // Map prices back to contract addresses — only for verified tokens
  const result = new Map<string, number>();
  for (const t of tokens) {
    const realSymbol = VERIFIED_ADDRESS_TO_SYMBOL.get(t.contractAddress.toLowerCase());
    if (realSymbol && prices[realSymbol]) {
      result.set(t.contractAddress.toLowerCase(), prices[realSymbol]);
    }
  }

  return result;
}

export async function fetchAllPrices(): Promise<Record<string, number>> {
  const symbols = ["ETH", ...TRACKED_TOKENS.map((t) => t.symbol)];
  return fetchPrices(symbols);
}

// ─── Historical prices ───

/**
 * Fetch historical ETH price at a specific date.
 */
export async function fetchHistoricalEthPrice(targetTimestamp: number): Promise<{ price: number; isHistorical: boolean }> {
  const now = Math.floor(Date.now() / 1000);
  if ((now - targetTimestamp) < 86400) {
    const p = await fetchPrices(["ETH"]);
    return { price: p.ETH || 0, isHistorical: false };
  }

  const dateKey = new Date(targetTimestamp * 1000).toISOString().split("T")[0];
  const cacheKey = `eth:${dateKey}`;
  if (historicalCache.has(cacheKey)) {
    return { price: historicalCache.get(cacheKey)!, isHistorical: true };
  }

  const d = new Date(targetTimestamp * 1000);
  const ddmmyyyy = `${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${d.getUTCFullYear()}`;
  const url = `${CG_BASE}/coins/ethereum/history?date=${ddmmyyyy}&localization=false`;

  try {
    const res = await deduplicatedFetch(url);
    if (!res || !res.ok) return { price: 0, isHistorical: true };
    const data = await res.json();
    const price = data?.market_data?.current_price?.usd || 0;
    if (price > 0) historicalCache.set(cacheKey, price);
    return { price, isHistorical: true };
  } catch {
    return { price: 0, isHistorical: true };
  }
}

/**
 * Fetch historical prices for tokens at a specific date.
 *
 * Recent (< 24h): uses current symbol-based pricing — 1 API call total.
 * Historical (>= 24h): fetches /coins/{id}/history per verified token.
 *   - Only verified tokens (matching TRACKED_TOKENS addresses) get priced
 *   - CoinGecko free tier limited to past 365 days
 *   - Results cached for the session so repeat generates are free
 *   - 2 concurrent fetches with 2s delay between batches (~30 calls/min safe)
 */
export async function fetchHistoricalTokenPrices(
  tokens: { symbol: string; contractAddress: string }[],
  targetTimestamp: number,
): Promise<{ prices: Map<string, number>; isHistorical: boolean }> {
  const now = Math.floor(Date.now() / 1000);

  // Recent: use current prices (1 API call, no historical lookup needed)
  if ((now - targetTimestamp) < 86400) {
    const prices = await priceTokensBySymbol(tokens);
    return { prices, isHistorical: false };
  }

  // Historical: fetch per-token price at the target date
  const dateKey = new Date(targetTimestamp * 1000).toISOString().split("T")[0];
  const d = new Date(targetTimestamp * 1000);
  const ddmmyyyy = `${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${d.getUTCFullYear()}`;

  // Collect verified tokens that need historical pricing
  const toLookup: { addr: string; coinId: string; cacheKey: string }[] = [];
  const result = new Map<string, number>();

  for (const t of tokens) {
    const addr = t.contractAddress.toLowerCase();
    const symbol = VERIFIED_ADDRESS_TO_SYMBOL.get(addr);
    if (!symbol) continue; // Unverified token — can't price

    const coinId = COINGECKO_IDS[symbol];
    if (!coinId) continue; // No CoinGecko mapping

    const cacheKey = `${coinId}:${dateKey}`;
    if (historicalCache.has(cacheKey)) {
      // Cache hit — no API call needed
      result.set(addr, historicalCache.get(cacheKey)!);
    } else {
      toLookup.push({ addr, coinId, cacheKey });
    }
  }

  // Fetch uncached historical prices — 2 concurrent, 2s delay between batches
  const CONCURRENCY = 2;

  for (let i = 0; i < toLookup.length; i += CONCURRENCY) {
    const batch = toLookup.slice(i, i + CONCURRENCY);

    const results = await Promise.allSettled(
      batch.map(async ({ addr, coinId, cacheKey }) => {
        const url = `${CG_BASE}/coins/${coinId}/history?date=${ddmmyyyy}&localization=false`;
        const res = await deduplicatedFetch(url);
        if (!res || !res.ok) return { addr, cacheKey, price: 0 };

        const data = await res.json();
        const price = data?.market_data?.current_price?.usd || 0;
        return { addr, cacheKey, price };
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        const { addr, cacheKey, price } = r.value;
        if (price > 0) {
          result.set(addr, price);
          historicalCache.set(cacheKey, price);
        }
        // price === 0 means CoinGecko has no data for this date — leave unpriced
      }
    }

    // Delay between batches to respect rate limits
    if (i + CONCURRENCY < toLookup.length) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return { prices: result, isHistorical: true };
}

// ─── Internal ───

async function fetchFromCoinGecko(ids: string[], symbols: string[]): Promise<Record<string, number>> {
  const url = `${CG_BASE}/simple/price?ids=${ids.join(",")}&vs_currencies=usd`;

  try {
    const res = await deduplicatedFetch(url);
    if (!res || !res.ok) return {};
    const data = await res.json();

    const prices: Record<string, number> = {};
    for (const symbol of symbols) {
      const id = COINGECKO_IDS[symbol];
      if (id && data[id]?.usd) {
        prices[symbol] = data[id].usd;
      }
    }
    return prices;
  } catch {
    return {};
  }
}

async function fetchFromFallback(symbols: string[]): Promise<Record<string, number>> {
  const fsyms = symbols.filter(s => s !== "stETH" && s !== "rETH" && s !== "cbETH").join(",");
  if (!fsyms) return {};

  try {
    const res = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${fsyms}`);
    const data = await res.json();

    const prices: Record<string, number> = {};
    for (const symbol of symbols) {
      if (data[symbol] && data[symbol] > 0) {
        prices[symbol] = 1 / data[symbol];
      }
    }
    return prices;
  } catch {
    return {};
  }
}

/**
 * Single fetch, single retry on 429. No exponential backoff hammering.
 */
async function fetchOnce(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const retry = await fetch(url);
        return retry.status === 429 ? null : retry;
      } catch { return null; }
    }
    return res;
  } catch {
    return null;
  }
}
