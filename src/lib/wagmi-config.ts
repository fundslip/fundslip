import { http, createConfig, fallback } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

// Alchemy as primary when available, public RPCs as fallback
const alchemyMainnet = alchemyKey ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}` : null;
const alchemySepolia = alchemyKey ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}` : null;

export const MAINNET_RPC = alchemyMainnet || "https://cloudflare-eth.com";
export const SEPOLIA_RPC = alchemySepolia || "https://ethereum-sepolia-rpc.publicnode.com";

const rpc = (url?: string) => http(url, { timeout: 4_000 });

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  // Only injected() here — instant reconnect on reload.
  // WalletConnect + Coinbase are created on-demand in WalletOptions.
  connectors: [injected()],
  transports: {
    [mainnet.id]: fallback([
      ...(alchemyMainnet ? [rpc(alchemyMainnet)] : []),
      rpc("https://cloudflare-eth.com"),
      rpc("https://eth.llamarpc.com"),
    ]),
    [sepolia.id]: fallback([
      ...(alchemySepolia ? [rpc(alchemySepolia)] : []),
      rpc("https://ethereum-sepolia-rpc.publicnode.com"),
      rpc("https://sepolia.drpc.org"),
    ]),
  },
  ssr: true,
});
