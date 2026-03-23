/**
 * Compact binary verification payload — 123 bytes, Base58 encoded (~168 chars).
 *
 * Layout:
 *   Bytes 0-19:    wallet address (20 bytes)
 *   Byte  20:      chainId (uint8)
 *   Bytes 21-24:   blockNumber (uint32 BE)
 *   Byte  25:      statementType (uint8)
 *   Bytes 26-57:   dataHash (32 bytes)
 *   Bytes 58-122:  signature (65 bytes)
 *
 * periodStart/periodEnd are NOT in the payload — they're embedded in the dataHash
 * via the serialization function. This avoids precision loss from date compression.
 *
 * Total: 123 bytes → ~168 chars Base58. Fits in a QR code.
 */

import bs58 from "bs58";
import { PAYLOAD_SIZE } from "./constants";

export interface DecodedPayload {
  wallet: string;
  chainId: number;
  blockNumber: number;
  statementType: number;
  dataHash: `0x${string}`;
  signature: `0x${string}`;
}

const CHAIN_ID_MAP: Record<number, number> = {
  1: 1, 11155111: 11, 10: 10, 42161: 42, 8453: 84,
};
const CHAIN_ID_REVERSE: Record<number, number> = {
  1: 1, 11: 11155111, 10: 10, 42: 42161, 84: 8453,
};

function hexToBytes(hex: string): Uint8Array {
  const h = hex.replace("0x", "");
  const bytes = new Uint8Array(h.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function buildPayload(
  wallet: string,
  chainId: number,
  blockNumber: number,
  statementType: number,
  dataHash: string,
  signature: string
): string {
  const buf = new Uint8Array(PAYLOAD_SIZE);
  const view = new DataView(buf.buffer);

  buf.set(hexToBytes(wallet), 0);          // 20 bytes
  const compactChain = CHAIN_ID_MAP[chainId];
  if (compactChain === undefined) throw new Error(`Unsupported chain ID: ${chainId}`);
  buf[20] = compactChain;                   // 1 byte
  view.setUint32(21, blockNumber, false);    // 4 bytes, big-endian
  buf[25] = statementType;                  // 1 byte
  buf.set(hexToBytes(dataHash), 26);        // 32 bytes
  buf.set(hexToBytes(signature), 58);       // 65 bytes

  return bs58.encode(buf);
}

export function decodePayload(encoded: string): DecodedPayload {
  const buf = bs58.decode(encoded);
  if (buf.length !== PAYLOAD_SIZE) {
    throw new Error(`Invalid payload: expected ${PAYLOAD_SIZE} bytes, got ${buf.length}`);
  }

  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  return {
    wallet: "0x" + bytesToHex(buf.slice(0, 20)),
    chainId: CHAIN_ID_REVERSE[buf[20]] ?? 1,
    blockNumber: view.getUint32(21, false),   // big-endian
    statementType: buf[25],
    dataHash: ("0x" + bytesToHex(buf.slice(26, 58))) as `0x${string}`,
    signature: ("0x" + bytesToHex(buf.slice(58, 123))) as `0x${string}`,
  };
}

export function isValidPayload(str: string): boolean {
  try { return bs58.decode(str).length === PAYLOAD_SIZE; } catch { return false; }
}
