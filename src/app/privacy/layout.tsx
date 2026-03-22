import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Fundslip doesn't collect, store, or transmit your data. Everything happens in your browser. No backend, no database, no tracking.",
  openGraph: {
    title: "Privacy | Fundslip",
    description:
      "Fundslip doesn't collect, store, or transmit your data. Everything happens in your browser.",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
