"use client";

import Link from "next/link";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { injected } from "wagmi/connectors";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Copy, Check, Wallet, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address, query: { enabled: !!address } });

  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "");
  const NAV = [
    { href: "/", label: "How it works", exact: true },
    { href: "/generate", label: "Generate" },
    { href: "/verify", label: "Verify" },
  ];
  const isActive = (l: typeof NAV[0]) => l.exact ? pathname === l.href : pathname.startsWith(l.href);
  const handleNav = (href: string) => (e: React.MouseEvent) => {
    if (href === "/generate" && pathname === "/generate") { e.preventDefault(); window.dispatchEvent(new CustomEvent("fundslip:reset")); }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 md:px-6 md:pt-4">
      <header className="glass rounded-2xl shadow-card border border-white/60 container-page">
        <nav className="flex justify-between items-center h-12 md:h-14 px-4 md:px-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/fundslip.svg" alt="Fundslip" width={22} height={26} style={{ height: "auto" }} />
            <span className="font-headline font-extrabold text-on-background text-[15px] tracking-tight">Fundslip</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                className={`relative px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${isActive(l) ? "text-on-background" : "text-on-surface-variant hover:text-on-background"}`}>
                {isActive(l) && <motion.span layoutId="nav-pill" className="absolute inset-0 bg-on-background/[0.05] rounded-lg" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 450, damping: 30 }} />}
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right — single dropdown for everything on mobile */}
          <div className="relative" ref={menuRef}>
            {/* Desktop: separate connect button + wallet dropdown */}
            {isConnected ? (
              <>
                {/* Desktop wallet */}
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="hidden md:flex items-center gap-1.5 bg-on-background/[0.05] hover:bg-on-background/[0.08] pl-1.5 pr-2.5 py-1 rounded-full transition-colors">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="text-[13px] font-medium text-on-background">{displayName}</span>
                  <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>
                {/* Mobile: single button that opens everything */}
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden flex items-center gap-1.5 bg-on-background/[0.05] hover:bg-on-background/[0.08] pl-1.5 pr-2 py-1 rounded-full transition-colors">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <Menu className="w-4 h-4 text-on-surface-variant" />
                </button>
              </>
            ) : (
              <>
                {/* Desktop connect */}
                <button onClick={() => connect({ connector: injected() })}
                  className="hidden md:flex items-center gap-1.5 bg-on-background text-white px-4 py-2 rounded-full text-[13px] font-semibold shadow-btn hover:shadow-btn-hover hover:-translate-y-px active:translate-y-0 transition-all duration-150">
                  <Wallet className="w-3.5 h-3.5" /> Connect
                </button>
                {/* Mobile: hamburger */}
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-on-background/[0.05] transition-colors">
                  <Menu className="w-[18px] h-[18px] text-on-background" />
                </button>
              </>
            )}

            {/* Unified dropdown — nav + wallet on mobile, wallet only on desktop */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card-hover p-1.5 ring-1 ring-black/[0.04]">

                  {/* Mobile nav links */}
                  <div className="md:hidden">
                    {NAV.map((l) => (
                      <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                        className={`flex items-center px-3 py-2.5 rounded-xl text-[14px] font-medium ${isActive(l) ? "text-primary bg-primary/[0.05]" : "text-on-surface-variant hover:bg-surface-container-low"}`}>
                        {l.label}
                      </Link>
                    ))}
                    <div className="h-px bg-black/[0.04] mx-2 my-1" />
                  </div>

                  {/* Wallet section */}
                  {isConnected ? (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold">Wallet</p>
                        <p className="text-[11px] font-mono text-on-surface mt-1 truncate">{address}</p>
                      </div>
                      <button onClick={() => { if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-low rounded-xl transition-colors">
                        {copied ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                        {copied ? "Copied" : "Copy address"}
                      </button>
                      <button onClick={() => { disconnect(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-error hover:bg-error-container/30 rounded-xl transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Disconnect
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { connect({ connector: injected() }); setMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 bg-on-background text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold shadow-btn">
                      <Wallet className="w-4 h-4" /> Connect Wallet
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </header>
    </div>
  );
}
