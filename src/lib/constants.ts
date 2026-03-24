import type { Network } from "@/types";

// Major ERC-20 tokens on Ethereum Mainnet
export const TRACKED_TOKENS = [
  { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const, decimals: 6 },
  { symbol: "USDT", name: "Tether", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" as const, decimals: 6 },
  { symbol: "DAI", name: "Dai", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" as const, decimals: 18 },
  { symbol: "WETH", name: "Wrapped Ether", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as const, decimals: 18 },
  { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" as const, decimals: 8 },
  { symbol: "LINK", name: "Chainlink", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA" as const, decimals: 18 },
  { symbol: "UNI", name: "Uniswap", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" as const, decimals: 18 },
  { symbol: "AAVE", name: "Aave", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" as const, decimals: 18 },
  { symbol: "MKR", name: "Maker", address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2" as const, decimals: 18 },
  { symbol: "SNX", name: "Synthetix", address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F" as const, decimals: 18 },
  { symbol: "COMP", name: "Compound", address: "0xc00e94Cb662C3520282E6f5717214004A7f26888" as const, decimals: 18 },
  { symbol: "CRV", name: "Curve DAO", address: "0xD533a949740bb3306d119CC777fa900bA034cd52" as const, decimals: 18 },
  { symbol: "LDO", name: "Lido DAO", address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32" as const, decimals: 18 },
  { symbol: "APE", name: "ApeCoin", address: "0x4d224452801ACEd8B2F0aebE155379bb5D594381" as const, decimals: 18 },
  { symbol: "SHIB", name: "Shiba Inu", address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE" as const, decimals: 18 },
  { symbol: "MATIC", name: "Polygon", address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0" as const, decimals: 18 },
  { symbol: "ARB", name: "Arbitrum", address: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1" as const, decimals: 18 },
  { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042" as const, decimals: 18 },
  { symbol: "stETH", name: "Lido Staked Ether", address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84" as const, decimals: 18 },
  { symbol: "rETH", name: "Rocket Pool ETH", address: "0xae78736Cd615f374D3085123A210448E74Fc6393" as const, decimals: 18 },
  { symbol: "cbETH", name: "Coinbase Wrapped Staked ETH", address: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49BBe" as const, decimals: 18 },
  { symbol: "PEPE", name: "Pepe", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933" as const, decimals: 18 },
  { symbol: "ENS", name: "Ethereum Name Service", address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72" as const, decimals: 18 },
  { symbol: "RPL", name: "Rocket Pool", address: "0xD33526068D116cE69F19A9ee46F0bd304F21A51f" as const, decimals: 18 },
  { symbol: "GRT", name: "The Graph", address: "0xc944E90C64B2c07662A292be6244BDf05Cda44a7" as const, decimals: 18 },
] as const;

export const NETWORKS: Record<Network, { name: string; chainId: number; enabled: boolean; icon: string }> = {
  ethereum: { name: "Ethereum Mainnet", chainId: 1, enabled: true, icon: "hub" },
  optimism: { name: "Optimism", chainId: 10, enabled: false, icon: "layers" },
  arbitrum: { name: "Arbitrum", chainId: 42161, enabled: false, icon: "schema" },
  base: { name: "Base", chainId: 8453, enabled: false, icon: "token" },
};

export const PERIOD_OPTIONS = [
  { value: "7d" as const, label: "7 Days", sublabel: "Last week" },
  { value: "30d" as const, label: "30 Days", sublabel: "Monthly" },
  { value: "90d" as const, label: "90 Days", sublabel: "Quarterly" },
  { value: "custom" as const, label: "Custom", sublabel: "", icon: "calendar_month" },
];

export const TYPE_OPTIONS = [
  {
    value: "balance-snapshot" as const,
    label: "Balance Snapshot",
    description: "Verify holdings at a specific block height",
  },
  {
    value: "full-history" as const,
    label: "Full Transaction History",
    description: "Complete audit of all incoming and outgoing txs",
    recommended: true,
  },
  {
    value: "income-summary" as const,
    label: "Income Summary",
    description: "Focused view on yield, rewards, and transfers-in",
  },
];

export const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

// ERC-20 ABI for balanceOf
export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
