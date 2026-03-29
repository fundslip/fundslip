import { http, createConfig, fallback } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

// Alchemy as primary when available, public RPCs as fallback
const alchemyMainnet = alchemyKey ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}` : null;
const alchemySepolia = alchemyKey ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}` : null;

export const MAINNET_RPC = alchemyMainnet || "https://cloudflare-eth.com";
export const SEPOLIA_RPC = alchemySepolia || "https://ethereum-sepolia-rpc.publicnode.com";

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    walletConnect({ projectId, showQrModal: false }),
    coinbaseWallet({ appName: "Fundslip" }),
  ],
  transports: {
    [mainnet.id]: fallback([
      ...(alchemyMainnet ? [http(alchemyMainnet)] : []),
      http("https://cloudflare-eth.com"),
      http("https://eth.llamarpc.com"),
      http(), // default
    ]),
    [sepolia.id]: fallback([
      ...(alchemySepolia ? [http(alchemySepolia)] : []),
      http("https://ethereum-sepolia-rpc.publicnode.com"),
      http("https://sepolia.drpc.org"),
      http("https://1rpc.io/sepolia"),
    ]),
  },
  ssr: true,
});
