import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://fundslip.xyz";

export const metadata: Metadata = {
  title: {
    default: "Fundslip — Verifiable Ethereum Statements",
    template: "%s | Fundslip",
  },
  description:
    "Generate professional, cryptographically signed financial statements from your Ethereum wallet.",
  keywords: [
    "ethereum", "financial statement", "crypto", "proof of funds",
    "wallet", "EIP-712", "verifiable", "blockchain", "defi",
    "mortgage", "rental", "bank statement", "fundslip",
  ],
  authors: [{ name: "Fundslip", url: siteUrl }],
  creator: "Fundslip",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Fundslip",
    title: "Fundslip — Verifiable Ethereum Statements",
    description:
      "Generate professional, cryptographically signed financial statements from your Ethereum wallet.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Fundslip — Your wallet. Your statement. Verifiable by anyone.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@fundslip",
    creator: "@fundslip",
    title: "Fundslip — Verifiable Ethereum Statements",
    description:
      "Generate professional, cryptographically signed financial statements from your Ethereum wallet.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/fundslip.svg",
    apple: "/fundslip.svg",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full`}>
      <head>
        <link rel="icon" href="/fundslip.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Fundslip",
              url: "https://fundslip.xyz",
              description: "Generate professional, cryptographically signed financial statements from your Ethereum wallet.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              creator: {
                "@type": "Organization",
                name: "Fundslip",
                url: "https://fundslip.xyz",
                sameAs: [
                  "https://github.com/fundslip/fundslip",
                  "https://x.com/fundslip",
                ],
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
