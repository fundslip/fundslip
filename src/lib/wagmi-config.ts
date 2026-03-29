import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, fallback } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export const MAINNET_RPC = "https://eth.llamarpc.com";
export const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

export const wagmiConfig = getDefaultConfig({
  appName: "Fundslip",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [mainnet, sepolia],
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
