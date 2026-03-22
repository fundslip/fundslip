import type { Metadata } from "next";

const image = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Fundslip — Your wallet. Your statement. Verifiable by anyone.",
};

export const metadata: Metadata = {
  title: "Verify Statement",
  description:
    "Verify any Fundslip statement instantly. Upload the PDF, scan the QR code, or paste the verification code. No account needed.",
  openGraph: {
    title: "Verify Statement | Fundslip",
    description:
      "Verify any Fundslip statement instantly. Upload the PDF, scan the QR code, or paste the verification code.",
    images: [image],
  },
  twitter: {
    title: "Verify Statement | Fundslip",
    description:
      "Verify any Fundslip statement instantly. Upload the PDF, scan the QR code, or paste the verification code.",
    images: [image],
  },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
