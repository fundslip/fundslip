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

export async function fetchPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  // Return cached if fresh
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
    const cached: Record<string, number> = {};
    for (const s of symbols) {
      if (priceCache.prices[s] !== undefined) cached[s] = priceCache.prices[s];
    }
    if (Object.keys(cached).length > 0) return cached;
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
