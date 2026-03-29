"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Copy, Check, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { copyToClipboard } from "@/lib/clipboard";

function WalletButton() {
  const { disconnect } = useDisconnect();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openChainModal, mounted }) => {
        const connected = mounted && account && chain;

        if (!mounted) return null;

        if (!connected) {
          return (
            <button onClick={openConnectModal}
              className="text-[14px] font-medium text-white bg-brand-navy px-5 py-2 rounded-lg hover:bg-brand-navy/90 transition-colors">
              Connect Wallet
            </button>
          );
        }

        const displayName = account.ensName || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;

        return (
          <div className="relative" ref={ref}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 text-[14px] text-brand-black hover:text-brand-black/80 transition-colors">
              {account.ensAvatar ? (
                <img src={account.ensAvatar} alt="" className="w-6 h-6 rounded-md" />
              ) : (
                <div className="w-6 h-6 rounded-md bg-brand-navy/10 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-brand-navy">
                    {account.address.slice(2, 4).toUpperCase()}
                  </span>
                </div>
              )}
              {displayName}
              <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-outline-variant shadow-sm p-1.5 z-[110]"
                >
                  {/* Address */}
                  <div className="px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">Wallet</p>
                    <p className="text-[12px] font-mono text-brand-black mt-1 truncate">{account.address}</p>
                  </div>

                  <div className="h-px bg-outline-variant mx-1.5" />

                  {/* Network */}
                  <button onClick={() => { openChainModal(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-brand-black hover:bg-surface rounded-lg transition-colors mt-0.5">
                    {chain.iconUrl && (
                      <img src={chain.iconUrl} alt={chain.name ?? ""} className="w-4 h-4 rounded-full" />
                    )}
                    {chain.name}
                    <ChevronDown className="w-3 h-3 text-on-surface-variant ml-auto" />
                  </button>

                  {/* Copy address */}
                  <button onClick={async () => {
                    const ok = await copyToClipboard(account.address);
                    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
                  }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-brand-black hover:bg-surface rounded-lg transition-colors">
                    {copied ? <Check className="w-4 h-4 text-tertiary" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}
                    {copied ? "Copied" : "Copy address"}
                  </button>

                  <div className="h-px bg-outline-variant mx-1.5" />

                  {/* Disconnect */}
                  <button onClick={() => { disconnect(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[14px] text-error hover:bg-error-container/30 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" /> Disconnect
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuOpen && headerRef.current && !headerRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const NAV = [
    { href: "/", label: "How it works", exact: true },
    { href: "/generate", label: "Generate" },
    { href: "/verify", label: "Verify" },
  ];
  const isActive = (l: typeof NAV[0]) => l.exact ? pathname === l.href : pathname.startsWith(l.href);

  return (
    <header ref={headerRef} className="fixed top-0 w-full z-[100] bg-white/95 backdrop-blur-md border-b border-outline-variant/60">
      <nav className="container-page flex justify-between items-center h-13 px-5 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/fundslip.svg" alt="Fundslip" width={20} height={24} style={{ height: "auto" }} />
          <span className="font-headline font-semibold text-brand-black text-[17px]">Fundslip</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href}
              className={`text-[14px] transition-colors ${isActive(l) ? "text-brand-black font-medium" : "text-on-surface-variant hover:text-brand-black"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop */}
          <div className="hidden md:block">
            <WalletButton />
          </div>

          {/* Mobile — wallet + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <WalletButton />
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-9 h-9 flex items-center justify-center">
              {menuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} className="md:hidden border-t border-outline-variant/60">
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
    </header>
  );
}
