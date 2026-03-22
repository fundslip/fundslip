import { http, createConfig, fallback } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export const MAINNET_RPC = "https://eth.llamarpc.com";
export const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

export const wagmiConfig = createConfig({
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
