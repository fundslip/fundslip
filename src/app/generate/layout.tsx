import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generate Statement",
  description:
    "Connect your Ethereum wallet and generate a professional, cryptographically signed financial statement in seconds. No sign-up required.",
};

export default function GenerateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
