"use client";

import Link from "next/link";
import Image from "next/image";
import { useAccount, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Copy, Check, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { copyToClipboard } from "@/lib/clipboard";
import { useCachedEnsName } from "@/hooks/use-cached-ens";
import { WalletOptions } from "@/components/shared/wallet-options";

function WalletAvatar({ address, size }: { address: string; size: number }) {
  return (
    <Image
      src={`https://api.dicebear.com/9.x/bottts-neutral/svg?scale=110&seed=${address}`}
      alt=""
      width={size}
      height={size}
      className="rounded-md"
      unoptimized
    />
  );
}

/* ─── Desktop Wallet Button ─── */

function DesktopWalletButton() {
  const { address, isConnected, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, chains } = useSwitchChain();
  const chainId = useChainId();
  const ensName = useCachedEnsName(address);

  const showWallet = isConnected || (isReconnecting && !!address);

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [networkExpanded, setNetworkExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setNetworkExpanded(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { if (!isConnected) { setOpen(false); setNetworkExpanded(false); } }, [isConnected]);

  const currentChain = chains.find((c) => c.id === chainId);
  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "");

  if (showWallet && address) {
    return (
      <div className="relative" ref={ref}>
        <button onClick={() => { setOpen(!open); setNetworkExpanded(false); }}
          className="flex items-center gap-2.5 text-[14px] text-brand-black hover:text-brand-black/80 transition-colors">
          <WalletAvatar address={address} size={24} />
          {displayName}
          <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-outline-variant shadow-sm p-1.5 z-[110]"
            >
              <div>
                <button onClick={() => setNetworkExpanded(!networkExpanded)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-brand-black hover:bg-surface rounded-lg transition-colors">
                  <Image src="/eth.svg" alt="" width={16} height={16} className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{currentChain?.name ?? "Unknown"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${networkExpanded ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {networkExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }} className="overflow-hidden">
                      <div className="px-1.5 pb-1">
                        {chains.map((chain) => (
                          <button key={chain.id}
                            onClick={() => { switchChain({ chainId: chain.id }); setNetworkExpanded(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-colors
                              ${chain.id === chainId ? "text-brand-navy bg-brand-navy/5 font-medium" : "text-on-surface-variant hover:bg-surface hover:text-brand-black"}`}>
                            <Image src="/eth.svg" alt="" width={14} height={14} className="w-3.5 h-3.5 flex-shrink-0" />
                            {chain.name}
                            {chain.id === chainId && <Check className="w-3.5 h-3.5 ml-auto text-brand-navy" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-px bg-outline-variant mx-1.5" />
              <button onClick={async () => {
                const ok = await copyToClipboard(address);
                if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
              }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-brand-black hover:bg-surface rounded-lg transition-colors">
                {copied ? <Check className="w-4 h-4 text-tertiary" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}
                {copied ? "Copied" : "Copy address"}
              </button>
              <div className="h-px bg-outline-variant mx-1.5" />
              <button onClick={() => { disconnect(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-error hover:bg-error-container/30 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" /> Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="text-[14px] font-medium text-white bg-brand-navy px-5 py-2 rounded-lg hover:bg-brand-navy/90 transition-colors">
        Connect Wallet
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-outline-variant shadow-sm p-2.5 z-[110]">
            <WalletOptions layout="dropdown" onConnected={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mobile: Unified pill + single dropdown ─── */

function MobileMenu({ pathname, NAV, isActive }: {
  pathname: string;
  NAV: { href: string; label: string; exact?: boolean }[];
  isActive: (l: { href: string; exact?: boolean }) => boolean;
}) {
  const { address, isConnected, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, chains } = useSwitchChain();
  const chainId = useChainId();
  const ensName = useCachedEnsName(address);

  const showWallet = isConnected || (isReconnecting && !!address);

  const [panel, setPanel] = useState<"closed" | "menu" | "connect">("closed");
  const [copied, setCopied] = useState(false);
  const [networkExpanded, setNetworkExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPanel("closed");
        setNetworkExpanded(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setPanel("closed"); setNetworkExpanded(false); }, [pathname]);

  const currentChain = chains.find((c) => c.id === chainId);
  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "");

  if (showWallet && address) {
    return (
      <div ref={ref}>
        {/* Unified pill: avatar + name + hamburger */}
        <button onClick={() => { setPanel(panel === "menu" ? "closed" : "menu"); setNetworkExpanded(false); }}
          className="flex items-center gap-2 p-1 pr-2 rounded-lg bg-surface max-w-[220px]">
          <WalletAvatar address={address} size={26} />
          <span className="text-[12px] text-brand-black truncate">{displayName}</span>
          {panel === "menu"
            ? <X className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
            : <Menu className="w-4 h-4 text-on-surface-variant flex-shrink-0" />}
        </button>

        {/* Single dropdown: navigation + wallet management */}
        <AnimatePresence>
          {panel === "menu" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full border-t border-outline-variant/60 bg-white/95 backdrop-blur-md z-[109]">
              <div className="px-5 py-4">
                {/* Nav links */}
                <div className="space-y-1 mb-3">
                  {NAV.map((l) => (
                    <Link key={l.href} href={l.href}
                      className={`block px-3 py-3 rounded-lg text-[16px] ${isActive(l) ? "text-brand-black font-medium bg-surface" : "text-on-surface-variant"}`}>
                      {l.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-outline-variant/60 pt-3 space-y-0.5">
                  {/* Network — collapsible */}
                  <button onClick={() => setNetworkExpanded(!networkExpanded)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-brand-black hover:bg-surface rounded-lg transition-colors">
                    <Image src="/eth.svg" alt="" width={16} height={16} className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{currentChain?.name ?? "Unknown"}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${networkExpanded ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {networkExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }} className="overflow-hidden">
                        <div className="pl-3 pb-1">
                          {chains.map((chain) => (
                            <button key={chain.id}
                              onClick={() => { switchChain({ chainId: chain.id }); setNetworkExpanded(false); }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-colors
                                ${chain.id === chainId ? "text-brand-navy bg-brand-navy/5 font-medium" : "text-on-surface-variant hover:bg-surface hover:text-brand-black"}`}>
                              <Image src="/eth.svg" alt="" width={14} height={14} className="w-3.5 h-3.5 flex-shrink-0" />
                              {chain.name}
                              {chain.id === chainId && <Check className="w-3.5 h-3.5 ml-auto text-brand-navy" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Copy address */}
                  <button onClick={async () => {
                    const ok = await copyToClipboard(address);
                    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
                  }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-brand-black hover:bg-surface rounded-lg transition-colors">
                    {copied ? <Check className="w-4 h-4 text-tertiary" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}
                    {copied ? "Copied" : "Copy address"}
                  </button>

                  {/* Disconnect */}
                  <button onClick={() => { disconnect(); setPanel("closed"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-error hover:bg-error-container/30 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" /> Disconnect
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Mobile Disconnected ──
  return (
    <div className="flex items-center gap-1.5" ref={ref}>
      <div className="relative">
        <button onClick={() => setPanel(panel === "connect" ? "closed" : "connect")}
          className="text-[13px] font-medium text-white bg-brand-navy px-4 py-2 rounded-lg">
          Connect
        </button>
        <AnimatePresence>
          {panel === "connect" && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-outline-variant shadow-sm p-2.5 z-[110]">
              <WalletOptions layout="dropdown" onConnected={() => setPanel("closed")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button onClick={() => setPanel(panel === "menu" ? "closed" : "menu")}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface transition-colors">
        {panel === "menu"
          ? <X className="w-[18px] h-[18px]" />
          : <Menu className="w-[18px] h-[18px]" />}
      </button>
      <AnimatePresence>
        {panel === "menu" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full border-t border-outline-variant/60 bg-white/95 backdrop-blur-md z-[109]">
            <div className="px-5 py-4 space-y-1">
              {NAV.map((l) => (
                <Link key={l.href} href={l.href}
                  className={`block px-3 py-3 rounded-lg text-[16px] ${isActive(l) ? "text-brand-black font-medium bg-surface" : "text-on-surface-variant"}`}>
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Navbar ─── */

export function Navbar() {
  const pathname = usePathname();

  const NAV = [
    { href: "/", label: "How it works", exact: true },
    { href: "/generate", label: "Generate" },
    { href: "/verify", label: "Verify" },
  ];
  const isActive = (l: { href: string; exact?: boolean }) => l.exact ? pathname === l.href : pathname.startsWith(l.href);

  return (
    <header className="fixed top-0 w-full z-[100] bg-white/95 backdrop-blur-md border-b border-outline-variant/60">
      <nav className="container-page flex justify-between items-center h-13 px-5 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/fundslip.svg" alt="Fundslip" width={20} height={24} style={{ height: "auto" }} />
          <span className="font-headline font-semibold text-brand-black text-[17px]">Fundslip</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href}
              className={`text-[14px] transition-colors ${isActive(l) ? "text-brand-black font-medium" : "text-on-surface-variant hover:text-brand-black"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop wallet */}
        <div className="hidden md:block">
          <DesktopWalletButton />
        </div>

        {/* Mobile — unified */}
        <div className="md:hidden">
          <MobileMenu pathname={pathname} NAV={NAV} isActive={isActive} />
        </div>
      </nav>
    </header>
  );
}
