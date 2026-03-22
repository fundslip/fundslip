import type { Metadata } from "next";

const image = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Fundslip — Your wallet. Your statement. Verifiable by anyone.",
};

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Fundslip doesn't collect, store, or transmit your data. Everything happens in your browser. No backend, no database, no tracking.",
  openGraph: {
    title: "Privacy | Fundslip",
    description:
      "Fundslip doesn't collect, store, or transmit your data. Everything happens in your browser.",
    images: [image],
  },
  twitter: {
    title: "Privacy | Fundslip",
    description:
      "Fundslip doesn't collect, store, or transmit your data. Everything happens in your browser.",
    images: [image],
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
