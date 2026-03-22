import type { Metadata } from "next";

const image = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Fundslip — Your wallet. Your statement. Verifiable by anyone.",
};

export const metadata: Metadata = {
  title: "Generate Statement",
  description:
    "Connect your Ethereum wallet and generate a professional, cryptographically signed financial statement in seconds. No sign-up required.",
  openGraph: {
    title: "Generate Statement | Fundslip",
    description:
      "Connect your Ethereum wallet and generate a cryptographically signed financial statement in seconds.",
    images: [image],
  },
  twitter: {
    title: "Generate Statement | Fundslip",
    description:
      "Connect your Ethereum wallet and generate a cryptographically signed financial statement in seconds.",
    images: [image],
  },
};

export default function GenerateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
