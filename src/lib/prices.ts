import { TRACKED_TOKENS } from "./constants";

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

// Simple in-memory cache to avoid CoinGecko rate limits
let priceCache: { prices: Record<string, number>; timestamp: number } | null = null;
const CACHE_TTL = 60_000; // 1 minute

// Contract address → USD price cache (separate from symbol cache)
let contractPriceCache: { prices: Map<string, number>; timestamp: number } | null = null;

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
      } else {
        allFound = false;
      }
    }
    if (allFound) return cached;
  }

  const ids = symbols
    .map((s) => COINGECKO_IDS[s])
    .filter(Boolean);

  if (ids.length === 0) return {};

  // Try CoinGecko first
  const prices = await fetchFromCoinGecko(ids, symbols);
  if (Object.keys(prices).length > 0) {
    priceCache = { prices, timestamp: Date.now() };
    return prices;
  }

  // Fallback: try alternative free API
  const fallbackPrices = await fetchFromFallback(symbols);
  if (Object.keys(fallbackPrices).length > 0) {
    priceCache = { prices: fallbackPrices, timestamp: Date.now() };
    return fallbackPrices;
  }

  return {};
}

async function fetchFromCoinGecko(ids: string[], symbols: string[]): Promise<Record<string, number>> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`;

  try {
    const res = await fetch(url);
    if (res.status === 429) {
      console.warn("CoinGecko rate limited");
      return {};
    }
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

// Fallback using CryptoCompare free API
async function fetchFromFallback(symbols: string[]): Promise<Record<string, number>> {
  const fsyms = symbols.filter(s => s !== "stETH" && s !== "rETH" && s !== "cbETH").join(",");
  if (!fsyms) return {};

  try {
    const res = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${fsyms}`);
    const data = await res.json();

    // CryptoCompare returns inverse: USD -> crypto. We need crypto -> USD
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

export async function fetchAllPrices(): Promise<Record<string, number>> {
  const symbols = ["ETH", ...TRACKED_TOKENS.map((t) => t.symbol)];
  return fetchPrices(symbols);
}

/**
 * Fetch prices by contract address via CoinGecko's token_price endpoint.
 * Returns a Map of lowercase contract address → USD price.
 * Tokens without CoinGecko data are simply absent from the map.
 */
export async function fetchPricesByContract(
  contractAddresses: string[],
  platform: string = "ethereum"
): Promise<Map<string, number>> {
  if (contractAddresses.length === 0) return new Map();

  // Check cache
  if (contractPriceCache && Date.now() - contractPriceCache.timestamp < CACHE_TTL) {
    const cached = new Map<string, number>();
    let allFound = true;
    for (const addr of contractAddresses) {
      const key = addr.toLowerCase();
      if (contractPriceCache.prices.has(key)) {
        cached.set(key, contractPriceCache.prices.get(key)!);
      } else {
        allFound = false;
      }
    }
    if (allFound) return cached;
  }

  const prices = new Map<string, number>();
  const BATCH_SIZE = 25; // safe limit for CoinGecko free tier

  for (let i = 0; i < contractAddresses.length; i += BATCH_SIZE) {
    const batch = contractAddresses.slice(i, i + BATCH_SIZE);
    const addresses = batch.map((a) => a.toLowerCase()).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${addresses}&vs_currencies=usd`;

    try {
      const res = await fetchWithRetry(url);
      if (!res) continue;

      const data = await res.json();
      for (const [addr, priceData] of Object.entries(data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usd = (priceData as any)?.usd;
        if (typeof usd === "number" && usd > 0) {
          prices.set(addr.toLowerCase(), usd);
        }
      }
    } catch {
      // Continue with what we have
    }

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < contractAddresses.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Update cache
  contractPriceCache = {
    prices: new Map([...(contractPriceCache?.prices || new Map()), ...prices]),
    timestamp: Date.now(),
  };

  return prices;
}

// ─── Historical prices ───

// Cache: "addr:date" → price (persists for session)
const historicalCache = new Map<string, number>();

/**
 * Fetch historical prices for tokens at a specific date.
 * Uses CoinGecko's contract-address market_chart/range endpoint.
 * Returns Map of lowercase contract address → USD price at that date.
 *
 * If targetDate is within last 24 hours, delegates to current-price fetching.
 */
export async function fetchHistoricalPrices(
  contractAddresses: string[],
  targetTimestamp: number, // Unix seconds — the date to price at
  platform: string = "ethereum"
): Promise<{ prices: Map<string, number>; isHistorical: boolean }> {
  const now = Math.floor(Date.now() / 1000);
  const isRecent = (now - targetTimestamp) < 86400; // within 24 hours

  // Recent: use current prices (faster, no historical API needed)
  if (isRecent) {
    const prices = await fetchPricesByContract(contractAddresses, platform);
    return { prices, isHistorical: false };
  }

  const prices = new Map<string, number>();
  const toLookup: string[] = [];

  // Check cache first
  const dateKey = new Date(targetTimestamp * 1000).toISOString().split("T")[0];
  for (const addr of contractAddresses) {
    const key = `${addr.toLowerCase()}:${dateKey}`;
    if (historicalCache.has(key)) {
      prices.set(addr.toLowerCase(), historicalCache.get(key)!);
    } else {
      toLookup.push(addr);
    }
  }

  if (toLookup.length === 0) return { prices, isHistorical: true };

  // Fetch historical prices — 1 call per token with concurrency limit
  const CONCURRENCY = 3;
  const DELAY_MS = 700; // stay well under 30 calls/minute

  for (let i = 0; i < toLookup.length; i += CONCURRENCY) {
    const batch = toLookup.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (addr) => {
        // 2-day window around target to ensure we get a data point
        const from = targetTimestamp - 86400;
        const to = targetTimestamp + 86400;
        const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${addr.toLowerCase()}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;

        const res = await fetchWithRetry(url);
        if (!res) return { addr, price: null };

        const data = await res.json();
        if (!data.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
          return { addr, price: null };
        }

        // Find the price point closest to our target
        const targetMs = targetTimestamp * 1000;
        let closest = data.prices[0];
        let minDiff = Math.abs(closest[0] - targetMs);
        for (const point of data.prices) {
          const diff = Math.abs(point[0] - targetMs);
          if (diff < minDiff) { closest = point; minDiff = diff; }
        }

        return { addr, price: closest[1] as number };
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value.price !== null) {
        const addr = r.value.addr.toLowerCase();
        prices.set(addr, r.value.price);
        historicalCache.set(`${addr}:${dateKey}`, r.value.price);
      }
    }

    // Delay between batches
    if (i + CONCURRENCY < toLookup.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  return { prices, isHistorical: true };
}

/**
 * Fetch historical ETH price at a specific date.
 * Uses CoinGecko /coins/ethereum/history endpoint.
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

  // CoinGecko Demo API uses dd-mm-yyyy format
  const d = new Date(targetTimestamp * 1000);
  const ddmmyyyy = `${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${d.getUTCFullYear()}`;
  const url = `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${ddmmyyyy}&localization=false`;

  try {
    const res = await fetchWithRetry(url);
    if (!res) return { price: 0, isHistorical: true };
    const data = await res.json();
    const price = data?.market_data?.current_price?.usd || 0;
    if (price > 0) historicalCache.set(cacheKey, price);
    return { price, isHistorical: true };
  } catch {
    return { price: 0, isHistorical: true };
  }
}

/**
 * Fetch with exponential backoff on 429 rate limit.
 */
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        if (attempt === maxRetries) return null;
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`CoinGecko 429, retrying in ${Math.round(delay)}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch {
      if (attempt === maxRetries) return null;
    }
  }
  return null;
}
