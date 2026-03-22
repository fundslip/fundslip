import { type Address } from "viem";
import { getEip712Domain, EIP712_TYPES } from "./constants";

export function buildSigningRequest(
  wallet: string,
  blockNumber: number,
  statementType: number,
  dataHash: `0x${string}`
) {
  return {
    domain: getEip712Domain(),
    types: EIP712_TYPES,
    primaryType: "Statement" as const,
    message: {
      wallet: wallet as Address,
      blockNumber: BigInt(blockNumber),
      statementType,
      dataHash,
    },
  };
}
