import { createPublicClient, http, formatEther, formatUnits, type Address, type Chain } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { TRACKED_TOKENS, ERC20_ABI } from "./constants";
import { MAINNET_RPC, SEPOLIA_RPC } from "./wagmi-config";
import { discoverTokens, fetchAssetTransfers, type AlchemyTransfer } from "./alchemy";
import type { TokenBalance, Transaction } from "@/types";

// ─── Dynamic contract name resolution ───

// Session cache: address → name
const contractNameCache = new Map<string, string | null>();

/**
 * Resolve contract names dynamically via Blockscout V2 API.
 * Returns verified contract names like "Lido Staked Ether", "UniswapV2Router02", etc.
 * Caches results for the session. Returns null for EOAs and unverified contracts.
 */
async function lookupContractNames(addresses: string[], chainId: number): Promise<Map<string, string>> {
  const base = chainId === sepolia.id
    ? "https://eth-sepolia.blockscout.com/api/v2/addresses"
    : "https://eth.blockscout.com/api/v2/addresses";

  const toLookup = addresses.filter(a => !contractNameCache.has(a.toLowerCase()));

  // Fetch in parallel, max 10 concurrent to stay within rate limits
  const BATCH = 10;
  for (let i = 0; i < toLookup.length; i += BATCH) {
    const batch = toLookup.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (addr) => {
        try {
          const res = await fetch(`${base}/${addr}`);
          if (!res.ok) return { addr, name: null };
          const data = await res.json();
          // Use token name if available (better for ERC-20s), else contract name
          const name: string | null = data.token?.name || data.name || null;
          return { addr, name: name && data.is_contract ? name : null };
        } catch {
          return { addr, name: null };
        }
      })
    );
    for (const r of results) {
      if (r.status === "fulfilled") {
        contractNameCache.set(r.value.addr.toLowerCase(), r.value.name);
      }
    }
  }

  const result = new Map<string, string>();
  for (const addr of addresses) {
    const name = contractNameCache.get(addr.toLowerCase());
    if (name) result.set(addr.toLowerCase(), name);
  }
  return result;
}

// ─── Dynamic function selector resolution ───

// Session cache for looked-up selectors
const selectorCache = new Map<string, string>();

/**
 * Batch-lookup function selectors from Openchain 4byte signature database.
 * Resolves ANY selector dynamically — no hardcoded list needed.
 */
async function lookupSelectors(selectors: string[]): Promise<Map<string, string>> {
  const unknown = selectors.filter(s => !selectorCache.has(s));
  if (unknown.length === 0) return selectorCache;

  const BATCH = 50;
  for (let i = 0; i < unknown.length; i += BATCH) {
    const batch = unknown.slice(i, i + BATCH).join(",");
    try {
      const res = await fetch(`https://api.openchain.xyz/signature-database/v1/lookup?function=${batch}&filter=true`);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.ok && data.result?.function) {
        for (const [sel, sigs] of Object.entries(data.result.function)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const arr = sigs as any[];
          if (arr?.length > 0) selectorCache.set(sel.toLowerCase(), arr[0].name);
        }
      }
    } catch { /* continue with what we have */ }
  }
  return selectorCache;
}

/**
 * Parse a Solidity function signature into a clean human-readable action.
 * "swapExactETHForTokens(uint256,address[],address,uint256)" → "Swap"
 * "commit(bytes32)" → "Commit"
 * "setApprovalForAll(address,bool)" → "Set Approval For All"
 */
function parseAction(signature: string): string {
  const name = signature.split("(")[0];
  const lower = name.toLowerCase();

  // Common action categories — short, clean labels
  if (lower.includes("swap") || lower.includes("exactinput") || lower.includes("exactoutput")) return "Swap";
  if (lower === "approve" || lower === "increaseallowance") return "Approve";
  if (lower === "setapprovalforall") return "Approve All";
  if (lower === "transfer" || lower === "transferfrom" || lower === "safetransferfrom") return "Transfer";
  if (lower.includes("register")) return "Register";
  if (lower.includes("commit")) return "Commit";
  if (lower.includes("renew")) return "Renew";
  if (lower.includes("claim") || lower.includes("harvest")) return "Claim";
  if (lower.includes("stake") || lower.includes("deposit")) return "Deposit";
  if (lower.includes("unstake") || lower.includes("withdraw") || lower.includes("redeem")) return "Withdraw";
  if (lower.includes("mint")) return "Mint";
  if (lower.includes("burn")) return "Burn";
  if (lower.includes("vote") || lower.includes("castvote")) return "Vote";
  if (lower === "wrap" || lower === "deposit") return "Wrap";
  if (lower === "unwrap") return "Unwrap";
  if (lower.includes("multicall") || lower === "execute") return "Execute";
  if (lower.includes("bridge")) return "Bridge";
  if (lower.includes("borrow")) return "Borrow";
  if (lower.includes("repay")) return "Repay";
  if (lower.includes("liquidat")) return "Liquidation";
  if (lower.includes("supply")) return "Supply";
  if (lower.includes("delegate")) return "Delegate";

  // Convert camelCase → Title Case: "setResolver" → "Set Resolver"
  return name.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()).trim();
}

// Resolve token symbol from contract address (uses TRACKED_TOKENS + dynamic cache)
function resolveTokenSymbol(address: string): string | null {
  const toLower = address.toLowerCase();
  const tracked = TRACKED_TOKENS.find(t => t.address.toLowerCase() === toLower);
  if (tracked) return tracked.symbol;
  // Check the dynamic contract name cache (populated by lookupContractNames)
  const cached = contractNameCache.get(toLower);
  if (cached) return cached;
  return null;
}

function labelTransaction(
  to: string | null,
  input: string | undefined,
  action: string | null, // resolved action from dynamic lookup
  contractName: string | null,
): { type: Transaction["type"]; label: string } {
  if (!to) return { type: "contract", label: "Contract Deployment" };

  const hasCalldata = input && input !== "0x" && input.length > 2;
  if (!hasCalldata) return { type: "send", label: "" }; // caller adds amount

  // Token-specific labels: "Approve USDT", "Transfer USDC"
  if (action === "Approve" || action === "Approve All" || action === "Transfer") {
    const sym = resolveTokenSymbol(to);
    const label = sym ? `${action} ${sym}` : action;
    return { type: "contract", label };
  }

  // Contract name + action: "Uniswap V3 — Swap"
  if (contractName && action) return { type: "contract", label: `${contractName} — ${action}` };
  if (contractName) return { type: "contract", label: contractName };
  if (action) return { type: "contract", label: action };

  return { type: "contract", label: "Contract Call" };
}

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

  // Base: Blockscout — has calldata for contract label decoding (ENS, approvals, etc.)
  const result = await buildFromBlockscout(address, startBlock, endBlock, startTimestamp, endTimestamp, chainId, ethPriceUsd, tokenPrices);

  // Supplement: Alchemy — catches transfers Blockscout missed (NFTs, internal ETH, exotic tokens)
  try {
    const alchemyTransfers = await fetchAssetTransfers(address, startBlock, endBlock, chainId);
    if (alchemyTransfers && alchemyTransfers.length > 0) {
      const existingHashes = new Set(result.transactions.map(t => t.hash.toLowerCase()));
      const additional = buildAlchemySupplementalTransfers(
        alchemyTransfers, address, startTimestamp, endTimestamp, existingHashes, ethPriceUsd, tokenPrices
      );
      if (additional.length > 0) {
        result.transactions.push(...additional);
        result.transactions.sort((a, b) => b.blockNumber - a.blockNumber);
        result.totalCount += additional.length;
      }
    }
  } catch { /* Alchemy supplement is best-effort */ }

  return { transactions: result.transactions.slice(0, 500), totalCount: result.totalCount };
}

// ─── Alchemy supplemental: only adds transfers that Blockscout missed ───

const STABLECOINS = new Set(["USDC", "USDT", "DAI", "PYUSD", "BUSD", "TUSD", "FRAX", "LUSD", "GUSD", "EURC", "USDP", "cUSD", "USDbC"]);

function buildAlchemySupplementalTransfers(
  transfers: AlchemyTransfer[],
  address: string,
  startTs: number, endTs: number,
  existingHashes: Set<string>,
  ethPriceUsd: number,
  tokenPrices: Record<string, number>
): Transaction[] {
  const additional: Transaction[] = [];
  const addrLower = address.toLowerCase();

  for (const t of transfers) {
    // Skip transfers already covered by Blockscout
    if (existingHashes.has(t.hash.toLowerCase())) continue;

    const ts = t.metadata?.blockTimestamp ? Math.floor(new Date(t.metadata.blockTimestamp).getTime() / 1000) : 0;
    if (ts < startTs || ts > endTs) continue;

    const isReceive = t.to?.toLowerCase() === addrLower;
    const blockNumber = parseInt(t.blockNum, 16);
    const amount = t.value ?? 0;
    const asset = t.asset || "ETH";

    let price = 0;
    if (t.category === "external" || t.category === "internal") {
      price = ethPriceUsd;
    } else if (t.category === "erc20") {
      price = tokenPrices[asset] || (STABLECOINS.has(asset) ? 1 : 0);
    }
    const valueUsd = amount * price;

    // Spam filter
    if (t.category === "erc20" && valueUsd === 0 && (
      t.from?.toLowerCase() === "0x0000000000000000000000000000000000000000" ||
      asset.startsWith("$") || amount > 1_000_000
    )) continue;

    let type: Transaction["type"];
    let description: string;

    if (t.category === "erc721" || t.category === "erc1155" || t.category === "specialnft") {
      type = isReceive ? "receive" : "send";
      const tokenIdShort = t.tokenId ? `#${parseInt(t.tokenId, 16)}` : "";
      description = isReceive
        ? `Received NFT ${asset || "Unknown"} ${tokenIdShort}`.trim()
        : `Sent NFT ${asset || "Unknown"} ${tokenIdShort}`.trim();
    } else if (t.category === "erc20") {
      type = isReceive ? "receive" : "send";
      description = isReceive
        ? `Received ${fmtAmount(amount)} ${asset}`
        : `Sent ${fmtAmount(amount)} ${asset}`;
    } else if (t.category === "internal") {
      type = isReceive ? "receive" : "contract";
      description = isReceive
        ? `Received ${fmtAmount(amount)} ETH (internal)`
        : `Internal Transfer (${fmtAmount(amount)} ETH)`;
    } else {
      type = isReceive ? "receive" : "send";
      description = isReceive
        ? `Received ${fmtAmount(amount)} ETH`
        : `Sent ${fmtAmount(amount)} ETH`;
    }

    additional.push({
      hash: t.hash,
      from: t.from,
      to: t.to || "",
      value: t.rawContract?.value || "0",
      timestamp: ts,
      blockNumber,
      tokenSymbol: t.category === "erc20" ? asset : undefined,
      tokenName: t.category === "erc20" ? asset : undefined,
      gasUsed: "0",
      gasPrice: "0",
      type,
      valueUsd,
      description,
    });
  }

  return additional;
}

function fmtAmount(n: number): string {
  if (n === 0) return "0";
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(4);
  if (n >= 0.0001) return n.toFixed(4);
  return n.toExponential(2);
}

// ─── Blockscout fallback path (enhanced with calldata decoding) ───

async function buildFromBlockscout(
  address: string,
  startBlock: string, endBlock: string,
  startTs: number, endTs: number,
  chainId: number,
  ethPriceUsd: number,
  tokenPrices: Record<string, number>
): Promise<{ transactions: Transaction[]; totalCount: number }> {
  const [ethTxs, tokenTxs] = await Promise.all([
    fetchExplorerTxs("txlist", address, startBlock, endBlock, chainId),
    fetchExplorerTxs("tokentx", address, startBlock, endBlock, chainId),
  ]);

  // Dynamically resolve function selectors AND contract names in parallel
  const selectors = new Set<string>();
  const contractAddrs = new Set<string>();
  for (const tx of ethTxs) {
    if (tx.input && tx.input.length >= 10 && tx.input !== "0x") {
      selectors.add(tx.input.slice(0, 10).toLowerCase());
      if (tx.to) contractAddrs.add(tx.to);
    }
    if (tx.from) contractAddrs.add(tx.from); // for "Received from [name]"
  }

  const [selectorMap, contractNames] = await Promise.all([
    lookupSelectors([...selectors]),
    lookupContractNames([...contractAddrs], chainId),
  ]);

  const transactions: Transaction[] = [];
  const addrLower = address.toLowerCase();

  for (const tx of ethTxs) {
    const ts = parseInt(tx.timeStamp);
    if (ts < startTs || ts > endTs) continue;

    const ethValue = tx.value ? BigInt(tx.value) : BigInt(0);
    const ethAmount = parseFloat(formatEther(ethValue));
    const isReceive = tx.to?.toLowerCase() === addrLower;
    const hasValue = ethValue > BigInt(0);
    const hasCalldata = tx.input && tx.input !== "0x" && tx.input.length > 2;

    if (!hasValue && !hasCalldata) continue;

    let type: Transaction["type"];
    let description: string;

    if (isReceive) {
      type = "receive";
      const fromName = contractNames.get(tx.from?.toLowerCase());
      description = fromName
        ? `Received ${fmtAmount(ethAmount)} ETH from ${fromName}`
        : `Received ${fmtAmount(ethAmount)} ETH`;
    } else if (hasCalldata) {
      const selector = tx.input.slice(0, 10).toLowerCase();
      const sig = selectorMap.get(selector);
      const action = sig ? parseAction(sig) : null;
      const contractName = contractNames.get(tx.to?.toLowerCase()) || null;
      const labeled = labelTransaction(tx.to, tx.input, action, contractName);
      type = labeled.type;
      description = hasValue && labeled.label
        ? `${labeled.label} (${fmtAmount(ethAmount)} ETH)`
        : labeled.label || "Contract Call";
    } else {
      type = "send";
      description = `Sent ${fmtAmount(ethAmount)} ETH`;
    }

    transactions.push({
      hash: tx.hash, from: tx.from, to: tx.to || "", value: tx.value || "0",
      timestamp: ts, blockNumber: parseInt(tx.blockNumber),
      gasUsed: tx.gasUsed || "0", gasPrice: tx.gasPrice || "0",
      type, valueUsd: ethAmount * ethPriceUsd, description,
    });
  }

  // Fetch missing token prices
  const missingSymbols = new Set<string>();
  for (const tx of tokenTxs) {
    const sym = tx.tokenSymbol || "";
    if (sym && !tokenPrices[sym] && !STABLECOINS.has(sym)) missingSymbols.add(sym);
  }
  let mergedPrices = tokenPrices;
  if (missingSymbols.size > 0) {
    try {
      const { fetchPrices } = await import("./prices");
      mergedPrices = { ...tokenPrices, ...(await fetchPrices([...missingSymbols])) };
    } catch { /* continue */ }
  }

  // Process token transactions
  for (const tx of tokenTxs) {
    const ts = parseInt(tx.timeStamp);
    if (ts < startTs || ts > endTs) continue;
    const isReceive = tx.to?.toLowerCase() === addrLower;
    const decimals = parseInt(tx.tokenDecimal || "18");
    const amount = parseFloat(formatUnits(BigInt(tx.value), decimals));
    const symbol = tx.tokenSymbol || "";
    const tokenPrice = mergedPrices[symbol] || (STABLECOINS.has(symbol) ? 1 : 0);
    const usdValue = amount * tokenPrice;

    // Skip spam airdrops
    if (usdValue === 0 && (
      tx.from?.toLowerCase() === "0x0000000000000000000000000000000000000000" ||
      symbol.startsWith("$") || amount > 1_000_000
    )) continue;

    transactions.push({
      hash: tx.hash, from: tx.from, to: tx.to || "", value: tx.value,
      timestamp: ts, blockNumber: parseInt(tx.blockNumber),
      tokenSymbol: symbol, tokenName: tx.tokenName,
      gasUsed: tx.gasUsed || "0", gasPrice: tx.gasPrice || "0",
      type: isReceive ? "receive" : "send",
      valueUsd: usdValue,
      description: `${isReceive ? "Received" : "Sent"} ${fmtAmount(amount)} ${symbol}`,
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
    // Blockscout returns { status: "1", result: "21366284" } — validate it's numeric
    if (data.status === "1" && data.result && data.result !== "0" && !isNaN(Number(data.result))) {
      return data.result;
    }
  } catch { /* continue to fallback */ }
  // Fallback: use latest block for "before" or earliest reasonable for "after"
  if (closest === "before") {
    try { return String(await getClient(chainId).getBlockNumber()); } catch { /* */ }
  }
  return "1";
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

// ─── Display processing: turn raw transactions into clean statement entries ───

/**
 * Process raw transactions into clean, statement-ready entries.
 * This is display-only — raw transactions are preserved for signing.
 */
export function processForDisplay(raw: Transaction[]): Transaction[] {
  // Collect swap contract hashes — used to find their paired token transfers
  const swapContractHashes = new Set<string>();
  for (const tx of raw) {
    if (isSwapDescription(tx) && tx.valueUsd > 0) swapContractHashes.add(tx.hash.toLowerCase());
  }

  // 2. Group by tx hash
  const byHash = new Map<string, Transaction[]>();
  for (const tx of raw) {
    const key = tx.hash.toLowerCase();
    if (!byHash.has(key)) byHash.set(key, []);
    byHash.get(key)!.push(tx);
  }

  // 3. Process each group
  const result: Transaction[] = [];

  for (const [hash, group] of byHash) {
    // Swap pattern: same hash has outgoing + incoming transfers
    const outgoing = group.filter(t => t.type === "send" || t.type === "contract");
    const incoming = group.filter(t => t.type === "receive");

    if (outgoing.length > 0 && incoming.length > 0) {
      const out = outgoing[0];
      const recv = incoming[0];
      const outAsset = out.tokenSymbol || "ETH";
      const inAsset = recv.tokenSymbol || "ETH";
      const outAmt = extractAmount(out.description);
      const inAmt = extractAmount(recv.description);
      const label = outAmt && inAmt
        ? `Swapped ${outAmt} ${outAsset} → ${inAmt} ${inAsset}`
        : `Swapped ${outAsset} → ${inAsset}`;

      result.push({
        ...out,
        type: "contract",
        description: label,
        valueUsd: Math.max(out.valueUsd, recv.valueUsd),
      });
      // Additional receives from multi-output swaps
      for (let i = 1; i < incoming.length; i++) result.push(incoming[i]);
      continue;
    }

    // Known swap contract call with NO paired token transfer in same hash —
    // look for a token receive nearby (within ~2 blocks) as the swap output
    if (group.length === 1 && swapContractHashes.has(hash)) {
      const swapTx = group[0];
      const nearby = findNearbyReceive(raw, swapTx, byHash);
      if (nearby) {
        const inAsset = nearby.tokenSymbol || "ETH";
        const inAmt = extractAmount(nearby.description);
        const outAmt = extractAmount(swapTx.description);
        const outAsset = swapTx.tokenSymbol || "ETH";
        result.push({
          ...swapTx,
          type: "contract",
          description: inAmt
            ? `Swapped ${outAmt || ""} ${outAsset} → ${inAmt} ${inAsset}`.replace(/\s+/g, " ").trim()
            : `Swapped ${outAsset} → ${inAsset}`,
          valueUsd: Math.max(swapTx.valueUsd, nearby.valueUsd),
        });
        continue;
      }
    }

    // Single transactions — enrich and filter
    for (const tx of group) {
      const enriched = enrichSingle(tx);
      if (enriched) result.push(enriched);
    }
  }

  return result.sort((a, b) => b.timestamp - a.timestamp);
}

function isSwapDescription(tx: Transaction): boolean {
  const d = tx.description.toLowerCase();
  return tx.type === "contract" && (d.includes("swap") || d.includes("exchange"));
}

function findNearbyReceive(
  all: Transaction[],
  swapTx: Transaction,
  byHash: Map<string, Transaction[]>
): Transaction | null {
  for (const tx of all) {
    if (tx.type !== "receive") continue;
    if (tx.hash.toLowerCase() === swapTx.hash.toLowerCase()) continue;
    if (Math.abs(tx.blockNumber - swapTx.blockNumber) > 2) continue;
    if (!tx.tokenSymbol) continue;
    const group = byHash.get(tx.hash.toLowerCase());
    if (group && group.length > 1) continue;
    return tx;
  }
  return null;
}

function enrichSingle(tx: Transaction): Transaction | null {
  // A financial statement shows money movements, not blockchain mechanics.
  // Hide all zero-value contract interactions — commits, approvals, config
  // changes, governance votes, etc. are not financial events.
  if (tx.type === "contract" && tx.valueUsd === 0) return null;

  return tx;
}

function extractAmount(description: string): string {
  const parenMatch = description.match(/\(([0-9,.]+)\s+\w+\)/);
  if (parenMatch) return parenMatch[1];
  const directMatch = description.match(/(?:Sent|Received|Swapped)\s+([0-9,.]+)\s+/);
  if (directMatch) return directMatch[1];
  return "";
}
