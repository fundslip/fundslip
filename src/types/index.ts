export type StatementPeriod = "7d" | "30d" | "90d" | "custom";

export type StatementType =
  | "balance-snapshot"
  | "full-history"
  | "income-summary";

export type Network = "ethereum" | "optimism" | "arbitrum" | "base";

export interface TokenBalance {
  name: string;
  symbol: string;
  balance: string;
  balanceFormatted: number;
  decimals: number;
  contractAddress: string;
  priceUsd: number;
  valueUsd: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  tokenSymbol?: string;
  tokenName?: string;
  gasUsed: string;
  gasPrice: string;
  type: "send" | "receive" | "contract";
  valueUsd: number;
  description: string;
}

export interface PersonalDetails {
  fullName: string;
  address: string;
}

export interface StatementData {
  walletAddress: string;
  ensName: string | null;
  network: Network;
  periodStart: Date;
  periodEnd: Date;
  statementType: StatementType;
  ethBalance: number;
  ethPriceUsd: number;
  ethValueUsd: number;
  tokens: TokenBalance[];
  transactions: Transaction[];
  totalValueUsd: number;
  generatedAt: Date;
  blockNumber: number;
  personalDetails?: PersonalDetails;
  networkName?: string;
  totalTransactionCount?: number;
  priceDate?: Date;          // When the prices are from (period end date or generation time)
  isHistoricalPricing?: boolean; // True if prices are from the period end date, not current
}

export interface VerificationResult {
  verified: boolean;
  statementId: string;
  walletAddress: string;
  ensName: string | null;
  totalValueUsd: number;
  tokens: { symbol: string; balance: string }[];
  ethBalance: string;
  statementType: string;
  periodStart: string;
  periodEnd: string;
  blockNumber: number;
  generatedAt: string;
  personalName?: string;
  verifiedAt: Date;
  error?: string;
  statementData?: StatementData;
}

export type GenerateStep =
  | "config"
  | "signing"
  | "generating"
  | "ready";
