import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Statement",
  description:
    "Verify any Fundslip statement instantly. Upload the PDF, scan the QR code, or paste the verification code. No account needed.",
  openGraph: {
    title: "Verify Statement | Fundslip",
    description:
      "Verify any Fundslip statement instantly. Upload the PDF, scan the QR code, or paste the verification code.",
  },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
