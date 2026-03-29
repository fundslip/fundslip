import { http, createConfig, fallback } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

export const MAINNET_RPC = "https://eth.llamarpc.com";
export const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    walletConnect({ projectId, showQrModal: false }),
    coinbaseWallet({ appName: "Fundslip" }),
  ],
  transports: {
    [mainnet.id]: fallback([
      http(MAINNET_RPC),
      http("https://cloudflare-eth.com"),
      http(), // default
    ]),
    [sepolia.id]: fallback([
      http(SEPOLIA_RPC),
      http("https://sepolia.drpc.org"),
      http("https://1rpc.io/sepolia"),
    ]),
  },
  ssr: true,
});
