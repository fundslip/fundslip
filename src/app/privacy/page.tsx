"use client";

import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

function PrivacyContent() {
  return (
    <main className="pt-20 pb-20 px-5 md:px-6">
      <div className="container-page max-w-2xl">
        <h1 className="font-headline text-3xl md:text-4xl font-semibold text-brand-black mb-2 mt-8">Privacy</h1>
        <p className="text-on-surface-variant text-[15px] mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-[15px] text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="font-headline text-lg font-semibold text-brand-black mb-3">The short version</h2>
            <p>
              Fundslip doesn&apos;t collect, store, or transmit your data. Everything happens in your browser. There is no backend, no database, no analytics, and no tracking. Your wallet keys never leave your device.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-brand-black mb-3">What we don&apos;t collect</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Personal information (names, emails, addresses)</li>
              <li>Wallet addresses or private keys</li>
              <li>Financial data or transaction history</li>
              <li>Browser fingerprints or device identifiers</li>
              <li>Cookies, analytics, or tracking pixels</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-brand-black mb-3">How it works</h2>
            <p>
              When you generate a statement, your browser connects directly to public Ethereum nodes to fetch on-chain data. The PDF is generated entirely client-side using JavaScript. The EIP-712 signature is created by your wallet — we never see or handle your private keys.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-brand-black mb-3">Verification</h2>
            <p>
              When someone verifies a statement, the verification code is decoded in their browser. The on-chain data is re-fetched from public nodes and compared against the cryptographic signature. No data is sent to any server during this process.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-brand-black mb-3">Email delivery</h2>
            <p>
              If you choose to email a statement, the recipient email address and your optional name are sent to our email service (Resend) to deliver the message. We do not store this information after delivery.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-brand-black mb-3">Third-party services</h2>
            <p>
              Fundslip connects to public Ethereum RPC nodes (Cloudflare, DRPC, LlamaNodes) and the CoinGecko API for token prices. These services may log IP addresses per their own privacy policies. We have no control over their data practices.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-brand-black mb-3">Open source</h2>
            <p>
              Fundslip is fully open source. You can audit every line of code on{" "}
              <a href="https://github.com/fundslip/fundslip" target="_blank" rel="noopener noreferrer" className="text-brand-navy hover:underline">
                GitHub
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-brand-black mb-3">Contact</h2>
            <p>
              Questions? Reach out on{" "}
              <a href="https://x.com/fundslip" target="_blank" rel="noopener noreferrer" className="text-brand-navy hover:underline">
                X (@fundslip)
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function PrivacyPage() {
  return (
    <Providers>
      <Navbar />
      <PrivacyContent />
      <Footer />
    </Providers>
  );
}
