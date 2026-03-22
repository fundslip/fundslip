"use client";

import Link from "next/link";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { injected } from "wagmi/connectors";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Copy, Check, Wallet, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (walletRef.current && !walletRef.current.contains(e.target as Node)) setWalletOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  useEffect(() => { setMenuOpen(false); setWalletOpen(false); }, [pathname]);

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
    <header className="fixed top-0 w-full z-[100] px-3 sm:px-5 md:px-6 pt-2.5 md:pt-3">
      <div className="bg-white rounded-2xl container-page overflow-visible shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.06),0_8px_32px_-8px_rgba(0,0,0,0.1)]">
        {/* Main bar */}
        <nav className="flex justify-between items-center h-14 md:h-[56px] px-4 md:px-5">
          {/* Logo — bigger */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/fundslip.svg" alt="Fundslip" width={24} height={30} style={{ height: "auto" }} />
            <span className="font-headline font-extrabold text-on-background text-[19px] tracking-tight">Fundslip</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5 rounded-full bg-on-background/[0.06] p-[3px]">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                className={`relative px-4 py-[6px] rounded-full text-[13px] font-medium transition-colors duration-150 ${isActive(l) ? "text-white font-semibold" : "text-on-surface-variant hover:text-on-background"}`}>
                {isActive(l) && <motion.span layoutId="nav-pill" className="absolute inset-0 bg-on-background text-white rounded-full" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 450, damping: 30 }} />}
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Desktop wallet */}
            {isConnected ? (
              <div className="relative hidden md:block" ref={walletRef}>
                <button onClick={() => setWalletOpen(!walletOpen)}
                  className="flex items-center gap-2 bg-on-background/[0.06] hover:bg-on-background/[0.09] pl-1.5 pr-3 py-1.5 rounded-full transition-colors">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="text-[13px] font-medium text-on-background">{displayName}</span>
                  <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform ${walletOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {walletOpen && (
                    <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card-hover p-1.5 ring-1 ring-black/[0.04]">
                      <div className="px-3 py-2.5">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold">Wallet</p>
                        <p className="text-[11px] font-mono text-on-surface mt-1 truncate">{address}</p>
                      </div>
                      <div className="h-px bg-surface-container-low mx-1.5" />
                      <button onClick={() => { if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-low rounded-xl transition-colors mt-1">
                        {copied ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                        {copied ? "Copied" : "Copy address"}
                      </button>
                      <button onClick={() => { disconnect(); setWalletOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-error hover:bg-error-container/40 rounded-xl transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => connect({ connector: injected() })}
                className="hidden md:flex items-center gap-1.5 bg-on-background text-white px-4 py-[7px] rounded-full text-[13px] font-semibold shadow-btn hover:-translate-y-px hover:shadow-btn-hover active:translate-y-0 transition-all duration-150">
                <Wallet className="w-3.5 h-3.5" /> Connect
              </button>
            )}

            {/* Mobile hamburger — opens full-width expansion */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-on-background/[0.05] transition-colors">
              <Menu className="w-[18px] h-[18px] text-on-background" />
            </button>
          </div>
        </nav>

        {/* Mobile expanded menu — stretches the header down */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden border-t border-black/[0.04]"
            >
              <div className="px-3 py-3 space-y-0.5">
                {NAV.map((l) => (
                  <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                    className={`flex items-center px-3 py-3 rounded-xl text-[15px] font-medium ${isActive(l) ? "text-primary bg-primary/[0.06] font-semibold" : "text-on-surface-variant"}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="px-3 pb-3 pt-1 border-t border-black/[0.04] mx-3">
                {isConnected ? (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2.5 px-1">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-[14px] font-semibold text-on-background block">{displayName}</span>
                        <span className="text-[10px] font-mono text-on-surface-variant">{address?.slice(0, 14)}...</span>
                      </div>
                    </div>
                    <button onClick={() => { disconnect(); setMenuOpen(false); }}
                      className="w-full py-2.5 rounded-xl text-[13px] font-medium text-error bg-error/[0.06] flex items-center justify-center gap-2">
                      <LogOut className="w-3.5 h-3.5" /> Disconnect
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { connect({ connector: injected() }); setMenuOpen(false); }}
                    className="w-full py-3 rounded-xl text-[14px] font-semibold bg-on-background text-white flex items-center justify-center gap-2 shadow-btn mt-2">
                    <Wallet className="w-4 h-4" /> Connect Wallet
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
