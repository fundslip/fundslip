/**
 * Verification constants.
 */

// No chainId in domain — this is an off-chain signature, not bound to a specific chain.
// The chain-specific data is already embedded in the dataHash via serialization.
export function getEip712Domain() {
  return { name: "Fundslip" as const, version: "1" as const };
}

// Minimal EIP-712 schema. periodStart/periodEnd are baked into dataHash
// via the serialization function — no need to duplicate them here.
export const EIP712_TYPES = {
  Statement: [
    { name: "wallet", type: "address" },
    { name: "blockNumber", type: "uint256" },
    { name: "statementType", type: "uint8" },
    { name: "dataHash", type: "bytes32" },
  ],
} as const;

export const STATEMENT_TYPES = {
  "balance-snapshot": 0, "full-history": 1, "income-summary": 2,
} as const;

export type StatementTypeCode = keyof typeof STATEMENT_TYPES;

export function statementTypeToCode(type: string): number {
  return STATEMENT_TYPES[type as StatementTypeCode] ?? 0;
}

export function codeToStatementType(code: number): string {
  for (const [key, val] of Object.entries(STATEMENT_TYPES)) { if (val === code) return key; }
  return "balance-snapshot";
}

// 20 + 1 + 4 + 1 + 32 + 65 = 123 bytes
export const PAYLOAD_SIZE = 123;
