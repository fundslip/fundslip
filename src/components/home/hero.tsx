"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";

const TRANSACTIONS = [
  { date: "Mar 15", desc: "Received ETH", from: "vitalik.eth", type: "Receive", val: "$4,280.00" },
  { date: "Mar 12", desc: "Sent USDC", from: "nick.eth", type: "Send", val: "$2,500.00" },
  { date: "Mar 10", desc: "Uniswap Swap", from: "uniswap.eth", type: "Contract", val: "$1,847.32" },
  { date: "Mar 8", desc: "Received USDC", from: "ens.eth", type: "Receive", val: "$12,000.00" },
  { date: "Mar 5", desc: "Lido Stake", from: "lido.eth", type: "Contract", val: "$8,120.00" },
  { date: "Mar 3", desc: "Sent ETH", from: "brantly.eth", type: "Send", val: "$950.00" },
  { date: "Mar 1", desc: "Received DAI", from: "aave.eth", type: "Receive", val: "$3,200.00" },
  { date: "Feb 28", desc: "Aave Deposit", from: "compound.eth", type: "Contract", val: "$5,000.00" },
];

export function Hero() {
  const router = useRouter();

  const handleGenerate = () => {
    router.push("/generate");
  };
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  const cardRotateX = useTransform(scrollYProgress, [0, 0.4], [12, 0]);
  const cardScale = useTransform(scrollYProgress, [0, 0.4], [0.92, 1]);
  const cardY = useTransform(scrollYProgress, [0, 0.6], [60, -40]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.15], [0.85, 1]);

  return (
    <section ref={sectionRef} className="pt-28 md:pt-36 pb-0 px-5 md:px-6 overflow-hidden">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="font-headline text-[clamp(2.5rem,6vw,4.25rem)] font-semibold text-brand-black leading-[1.1] tracking-tight">
            Your wallet.<br />
            Your statement.<br />
            <span
              className="inline-block bg-[length:200%_100%] animate-[textShine_4s_ease-in-out_infinite] bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #6e6e73 0%, #6e6e73 40%, #1d1d1f 50%, #6e6e73 60%, #6e6e73 100%)" }}
            >
              Verifiable by anyone.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-5 text-[15px] md:text-base text-on-surface-variant leading-relaxed max-w-md mx-auto">
            Generate professional, cryptographically signed financial statements from your Ethereum wallet.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={handleGenerate}
              className="inline-flex items-center justify-center bg-brand-navy text-white px-6 py-3 rounded-xl text-[14px] font-medium hover:bg-brand-navy/90 transition-colors">
              Generate Statement
            </button>
            <Link href="/verify"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-[14px] font-medium text-brand-black border border-outline-variant hover:bg-surface transition-colors">
              Verify a Statement
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-4 text-[12px] text-on-surface-variant">
            {["Open Source", "No Backend", "Client-Side Only"].map((label) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-brand-emerald" />
                {label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Full-width statement slip */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 md:mt-16 -mx-5 md:mx-0 relative"
          style={{ perspective: 1200 }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-t from-white via-white/90 to-transparent z-10 pointer-events-none" />

          <motion.div
            style={{ rotateX: cardRotateX, scale: cardScale, y: cardY, opacity: cardOpacity, transformOrigin: "center top" }}
            className="bg-white rounded-t-2xl border border-b-0 border-outline-variant"
          >
            <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-3.5 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <Image src="/fundslip.svg" alt="" width={14} height={18} style={{ height: "auto" }} />
                <span className="font-headline font-semibold text-[13px] md:text-[14px] text-brand-black">Fundslip</span>
                <span className="text-[9px] md:text-[10px] text-on-surface-variant hidden sm:inline">· Asset Verification Report</span>
              </div>
              <div className="flex items-center gap-1 text-tertiary">
                <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="text-[8px] md:text-[9px] font-medium uppercase tracking-wide">Verified</span>
              </div>
            </div>

            <div className="px-4 md:px-8 pt-5 md:pt-6 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { l: "Account", v: "sshdopey.eth", mono: true },
                  { l: "Network", v: "Ethereum" },
                  { l: "Block", v: "#19,452,102" },
                  { l: "Period", v: "Feb 15 – Mar 15, 2026" },
                ].map((d) => (
                  <div key={d.l}>
                    <p className="text-[8px] md:text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">{d.l}</p>
                    <p className={`text-[11px] md:text-[12px] text-brand-black ${d.mono ? "font-mono" : ""}`}>{d.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-4 md:mx-8 bg-surface rounded-lg px-4 md:px-5 py-3 md:py-4 mb-5">
              <p className="text-[8px] md:text-[9px] uppercase tracking-wide text-on-surface-variant mb-1">Total Net Worth</p>
              <p className="text-[1.5rem] md:text-[2.25rem] font-headline font-semibold text-brand-black tabular-nums tracking-tight leading-none">
                $142,502<span className="text-on-surface-variant/50">.88</span>
              </p>
            </div>

            <div className="px-4 md:px-8">
              <p className="text-[8px] md:text-[9px] uppercase tracking-wide text-on-surface-variant mb-2">Holdings</p>
              <div className="border-t border-outline-variant/60">
                {[
                  { sym: "ETH", name: "Ethereum", qty: "32.4500", val: "$84,120.00", icon: "/eth.svg" },
                  { sym: "USDC", name: "USD Coin", qty: "58,382.88", val: "$58,382.88", icon: "/usdc.svg" },
                ].map((a) => (
                  <div key={a.sym} className="flex items-center gap-2.5 md:gap-3 py-2.5 md:py-3 border-b border-outline-variant/40">
                    <Image src={a.icon} alt={a.sym} width={24} height={24} className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                    <div className="flex-1 min-w-0 flex justify-between items-baseline">
                      <span className="text-[11px] md:text-[12px] font-medium text-brand-black">{a.name}</span>
                      <span className="text-[11px] md:text-[12px] text-brand-black tabular-nums">{a.val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 md:px-8 mt-5 md:mt-6">
              <p className="text-[8px] md:text-[9px] uppercase tracking-wide text-on-surface-variant mb-2">Transaction History</p>
              <div className="overflow-hidden">
                <div className="grid grid-cols-12 gap-2 py-2 border-b border-outline-variant/60 text-[8px] md:text-[9px] uppercase tracking-wide text-on-surface-variant">
                  <span className="col-span-2">Date</span>
                  <span className="col-span-4">Description</span>
                  <span className="col-span-3 hidden md:block">Counterparty</span>
                  <span className="col-span-2 md:col-span-1">Type</span>
                  <span className="col-span-4 md:col-span-2 text-right">Value</span>
                </div>
                {TRANSACTIONS.map((tx, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 py-2 md:py-2.5 border-b border-outline-variant/30 text-[10px] md:text-[11px]">
                    <span className="col-span-2 text-on-surface-variant">{tx.date}</span>
                    <span className="col-span-4 text-brand-black truncate">{tx.desc}</span>
                    <span className="col-span-3 text-on-surface-variant font-mono hidden md:block">{tx.from}</span>
                    <span className="col-span-2 md:col-span-1 text-on-surface-variant">{tx.type}</span>
                    <span className="col-span-4 md:col-span-2 text-right text-brand-black tabular-nums">{tx.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
