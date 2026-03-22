"use client";

import Link from "next/link";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { injected } from "wagmi/connectors";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Copy, Check, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address, query: { enabled: !!address } });

  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) setWalletOpen(false);
      if (menuOpen && headerRef.current && !headerRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);
  useEffect(() => { setMenuOpen(false); setWalletOpen(false); }, [pathname]);

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "");
  const NAV = [
    { href: "/", label: "How it works", exact: true },
    { href: "/generate", label: "Generate" },
    { href: "/verify", label: "Verify" },
  ];
  const isActive = (l: typeof NAV[0]) => l.exact ? pathname === l.href : pathname.startsWith(l.href);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNav = (_href: string) => () => {
    // No-op — navigating to the same page just uses normal Next.js routing
  };

  return (
    <header ref={headerRef} className="fixed top-0 w-full z-[100] bg-white/95 backdrop-blur-md border-b border-outline-variant/60">
      <nav className="container-page flex justify-between items-center h-13 px-5 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/fundslip.svg" alt="Fundslip" width={18} height={22} style={{ height: "auto" }} />
          <span className="font-headline font-semibold text-brand-black text-[14px] hidden sm:block">Fundslip</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
              className={`text-[13px] transition-colors ${isActive(l) ? "text-brand-black font-medium" : "text-on-surface-variant hover:text-brand-black"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop wallet / connect */}
          {isConnected ? (
            <div className="relative hidden md:block" ref={walletRef}>
              <button onClick={() => setWalletOpen(!walletOpen)}
                className="flex items-center gap-2 text-[13px] text-brand-black">
                <div className="w-5 h-5 rounded-full bg-brand-navy flex items-center justify-center">
                  <span className="text-[7px] font-medium text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                </div>
                {displayName}
                <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform ${walletOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {walletOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-outline-variant shadow-sm p-1.5 z-[110]">
                    <div className="px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Wallet</p>
                      <p className="text-[11px] font-mono text-brand-black mt-0.5 truncate">{address}</p>
                    </div>
                    <div className="h-px bg-outline-variant mx-1.5" />
                    <button onClick={() => { if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-brand-black hover:bg-surface rounded-lg transition-colors mt-0.5">
                      {copied ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                      {copied ? "Copied" : "Copy address"}
                    </button>
                    <button onClick={() => { disconnect(); setWalletOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-error hover:bg-error-container/30 rounded-lg transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Disconnect
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => connect({ connector: injected() })}
              className="hidden md:block text-[13px] font-medium text-white bg-brand-navy px-4 py-1.5 rounded-lg hover:bg-brand-navy/90 transition-colors">
              Connect Wallet
            </button>
          )}

          {/* Mobile: connect button + hamburger when disconnected, wallet pill + hamburger when connected */}
          {isConnected ? (
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center gap-1.5 py-1 pl-1 pr-2 rounded-full bg-surface">
              <div className="w-6 h-6 rounded-full bg-brand-navy flex items-center justify-center">
                <span className="text-[7px] font-medium text-white">{displayName.slice(0, 2).toUpperCase()}</span>
              </div>
              {menuOpen ? <X className="w-3.5 h-3.5 text-on-surface-variant" /> : <Menu className="w-3.5 h-3.5 text-on-surface-variant" />}
            </button>
          ) : (
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => connect({ connector: injected() })}
                className="text-[12px] font-medium text-white bg-brand-navy px-3 py-1.5 rounded-lg">
                Connect
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="w-8 h-8 flex items-center justify-center">
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} className="md:hidden border-t border-outline-variant/60">
            <div className="px-5 py-3 space-y-1">
              {NAV.map((l) => (
                <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                  className={`block px-3 py-2.5 rounded-lg text-[15px] ${isActive(l) ? "text-brand-black font-medium bg-surface" : "text-on-surface-variant"}`}>
                  {l.label}
                </Link>
              ))}
              {isConnected && (
                <div className="pt-2 border-t border-outline-variant/60 mt-2 space-y-2">
                  <div className="flex items-center gap-2 px-3">
                    <span className="text-[13px] text-brand-black font-mono">{displayName}</span>
                  </div>
                  <button onClick={() => { disconnect(); setMenuOpen(false); }}
                    className="w-full py-2 text-[13px] text-error flex items-center justify-center gap-2">
                    <LogOut className="w-3.5 h-3.5" /> Disconnect
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
