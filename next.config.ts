import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  // Tree-shake barrel files in dev — prevents Turbopack from compiling
  // the entire package when only a few exports are used
  experimental: {
    optimizePackageImports: [
      "wagmi",
      "wagmi/connectors",
      "wagmi/chains",
      "viem",
      "viem/chains",
      "@wagmi/core",
      "@wagmi/connectors",
      "framer-motion",
      "lucide-react",
      "@tanstack/react-query",
      "@coinbase/wallet-sdk",
      "@walletconnect/ethereum-provider",
    ],
  },
};

export default nextConfig;
