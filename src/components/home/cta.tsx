"use client";

import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRef, useCallback } from "react";

export function CTA() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  const handleGenerate = () => {
    if (isConnected) {
      router.push("/generate");
    } else {
      openConnectModal?.();
    }
  };

  // 3D tilt tracking for the slip
  const slipRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });
  const glareX = useTransform(mouseX, [0, 1], [0, 100]);
  const glareY = useTransform(mouseY, [0, 1], [0, 100]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!slipRef.current) return;
    const rect = slipRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <section className="px-5 md:px-6 pb-24 md:pb-32">
      <div className="container-page">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-brand-navy relative overflow-hidden">

          <div className="relative grid md:grid-cols-2 gap-8 md:gap-10 items-center px-8 py-14 md:px-14 md:py-16">
            {/* Left — text */}
            <div>
              <h2 className="font-headline text-3xl md:text-[2.5rem] font-semibold leading-[1.15] tracking-tight text-white">
                Ready to prove your<br className="hidden md:block" /> financial position?
              </h2>
              <p className="mt-5 text-white/60 text-[15px] leading-relaxed max-w-md">
                No sign-up. No backend. Connect your wallet, sign, and download your verifiable statement.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={handleGenerate}
                  className="inline-flex items-center justify-center gap-2 bg-white text-brand-navy px-7 py-3.5 rounded-xl text-[15px] font-semibold hover:bg-white/90 transition-all">
                  Generate Statement <ArrowRight className="w-4 h-4" />
                </button>
                <Link href="/verify"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-[15px] font-medium text-white/70 hover:text-white border border-white/15 hover:border-white/30 transition-colors">
                  Verify a Statement
                </Link>
              </div>
            </div>

            {/* Right — interactive 3D slip */}
            <div className="hidden md:flex justify-end" style={{ perspective: 800 }}>
              <motion.div
                ref={slipRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-full max-w-[380px] cursor-default"
              >
                {/* Stacked paper layers behind */}
                <div className="absolute inset-0 rounded-xl bg-white/[0.05] translate-z-[-2px] rotate-[1.5deg] translate-x-1 translate-y-1" />

                {/* The slip */}
                <div className="relative bg-white rounded-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] overflow-hidden">
                  {/* Holographic glare that follows the mouse */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none z-10 opacity-[0.07]"
                    style={{
                      background: useTransform(
                        [glareX, glareY],
                        ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, white, transparent 60%)`
                      ),
                    }}
                  />

                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-3.5 border-b border-outline-variant/60">
                    <div className="flex items-center gap-2">
                      <Image src="/fundslip.svg" alt="" width={13} height={16} style={{ height: "auto" }} />
                      <span className="text-[12px] font-headline font-semibold text-brand-black">Fundslip</span>
                      <span className="text-[8px] text-on-surface-variant ml-0.5">Asset Verification Report</span>
                    </div>
                    <div className="flex items-center gap-1 text-tertiary">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="text-[8px] font-medium uppercase tracking-wide">Verified</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Account</p>
                        <p className="text-[11px] font-mono text-brand-black">sshdopey.eth</p>
                      </div>
                      <div>
                        <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Network</p>
                        <p className="text-[11px] text-brand-black">Ethereum</p>
                      </div>
                      <div>
                        <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Block</p>
                        <p className="text-[11px] text-brand-black">#19,452,102</p>
                      </div>
                    </div>

                    {/* Net worth */}
                    <div className="bg-surface rounded-lg px-4 py-3 mb-4">
                      <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-0.5">Total Net Worth</p>
                      <p className="text-[22px] font-headline font-semibold text-brand-black tracking-tight leading-none">
                        $142,502<span className="text-on-surface-variant/50">.88</span>
                      </p>
                    </div>

                    {/* Holdings */}
                    <p className="text-[7px] uppercase tracking-wider text-on-surface-variant mb-1.5">Holdings</p>
                    <div className="border-t border-outline-variant/60">
                      <div className="flex items-center justify-between py-2 border-b border-outline-variant/40">
                        <div className="flex items-center gap-2">
                          <Image src="/eth.svg" alt="ETH" width={16} height={16} className="w-4 h-4" />
                          <span className="text-[11px] font-medium text-brand-black">Ethereum</span>
                        </div>
                        <span className="text-[11px] text-brand-black tabular-nums">$84,120.00</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-outline-variant/40">
                        <div className="flex items-center gap-2">
                          <Image src="/usdc.svg" alt="USDC" width={16} height={16} className="w-4 h-4" />
                          <span className="text-[11px] font-medium text-brand-black">USD Coin</span>
                        </div>
                        <span className="text-[11px] text-brand-black tabular-nums">$58,382.88</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 border-t border-outline-variant/60 flex items-center justify-between bg-surface/50">
                    <span className="text-[9px] font-mono text-on-surface-variant">EIP-712 Signed</span>
                    <span className="text-[9px] text-on-surface-variant">fundslip.xyz/verify</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
