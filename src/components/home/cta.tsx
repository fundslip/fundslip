"use client";

import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export function CTA() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const router = useRouter();

  const handleGenerate = () => {
    if (isConnected) {
      router.push("/generate");
    } else {
      connect({ connector: injected() }, { onSuccess: () => router.push("/generate") });
    }
  };

  return (
    <section className="px-5 md:px-6 pb-24 md:pb-32">
      <div className="container-page">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-gradient-to-br from-brand-navy via-brand-navy to-[#001f5c] text-white px-6 py-16 md:px-20 md:py-24 text-center relative overflow-hidden">
          {/* Subtle radial light for depth */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.03] rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

          <div className="relative">
            <h2 className="font-headline text-3xl md:text-4xl font-semibold leading-tight tracking-tight max-w-lg mx-auto">
              Ready to prove your financial position?
            </h2>
            <p className="mt-5 text-white/45 text-base md:text-lg max-w-md mx-auto leading-relaxed">
              No sign-up. No backend. Connect your wallet, sign, and download your verifiable statement.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={handleGenerate}
                className="bg-white text-brand-navy px-7 py-3.5 rounded-xl text-[15px] font-medium hover:bg-white/90 transition-colors">
                Generate Statement
              </button>
              <Link href="/verify"
                className="px-7 py-3.5 rounded-xl text-[15px] font-medium text-white/50 hover:text-white border border-white/15 hover:border-white/25 transition-colors">
                Verify a Statement
              </Link>
            </div>
            <p className="mt-8 text-[13px] text-white/30">Completely free. No gas fees required.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
