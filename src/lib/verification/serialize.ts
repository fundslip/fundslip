/**
 * Deterministic serialization of statement data.
 *
 * THIS IS THE MOST CRITICAL FUNCTION IN THE APP.
 * Generation and verification MUST produce identical bytes for identical data.
 * Uses ABI encoding for determinism — NOT JSON.
 *
 * Used in: generation (to compute dataHash before signing)
 *          verification (to recompute dataHash from re-fetched on-chain data)
 */

import { encodeAbiParameters, parseAbiParameters, keccak256, type Address } from "viem";

/**
 * Serialize statement data into a deterministic byte array using ABI encoding.
 * The output of this function is hashed with keccak256 to produce the dataHash.
 *
 * RULES FOR DETERMINISM:
 * - Token balances are sorted by contract address (lowercase)
 * - Transaction hashes are sorted lexicographically
 * - All values are their raw on-chain representations (bigint, not formatted)
 * - No floating point — everything is integer (wei, raw token units)
 */
export function serializeStatementData(
  wallet: string,
  chainId: number,
  blockNumber: number,
  periodStart: number,
  periodEnd: number,
  ethBalance: bigint,
  tokenBalances: Array<{ address: string; balance: string }>,
  txHashes: string[],
  statementType: number
): Uint8Array {
  // Sort token balances by contract address for determinism
  const sortedTokens = [...tokenBalances].sort((a, b) =>
    a.address.toLowerCase().localeCompare(b.address.toLowerCase())
  );

  // Sort tx hashes for determinism, validate hex format
  const sortedTxHashes = [...txHashes]
    .filter(h => /^0x[0-9a-fA-F]{64}$/.test(h))
    .sort();

  // ABI encode in fixed order
  const encoded = encodeAbiParameters(
    parseAbiParameters([
      "address",    // wallet
      "uint256",    // chainId
      "uint256",    // blockNumber
      "uint256",    // periodStart
      "uint256",    // periodEnd
      "uint256",    // ethBalance (in wei)
      "uint8",      // statementType
      "address[]",  // token addresses (sorted)
      "uint256[]",  // token balances (sorted, matching order)
      "bytes32[]",  // tx hashes (sorted)
    ].join(",")),
    [
      wallet as Address,
      BigInt(chainId),
      BigInt(blockNumber),
      BigInt(periodStart),
      BigInt(periodEnd),
      ethBalance,
      statementType,
      sortedTokens.map((t) => t.address as Address),
      sortedTokens.map((t) => BigInt(t.balance)),
      sortedTxHashes.map((h) => h as `0x${string}`),
    ]
  );

  // Convert hex string to Uint8Array
  const bytes = new Uint8Array(Math.floor((encoded.length - 2) / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(encoded.slice(2 + i * 2, 4 + i * 2), 16);
  }
  return bytes;
}

/**
 * Compute the dataHash from serialized statement data.
 * This is the value that gets signed and verified.
 */
export function computeDataHash(
  wallet: string,
  chainId: number,
  blockNumber: number,
  periodStart: number,
  periodEnd: number,
  ethBalance: bigint,
  tokenBalances: Array<{ address: string; balance: string }>,
  txHashes: string[],
  statementType: number
): `0x${string}` {
  const serialized = serializeStatementData(
    wallet, chainId, blockNumber, periodStart, periodEnd,
    ethBalance, tokenBalances, txHashes, statementType
  );
  return keccak256(serialized);
}
