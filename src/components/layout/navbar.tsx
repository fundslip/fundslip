"use client";

import Link from "next/link";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { injected } from "wagmi/connectors";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LogOut, Copy, Check, Wallet } from "lucide-react";
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
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuOpen(false); };
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
    <header className="fixed top-0 w-full z-50 px-3 sm:px-5 md:px-6 pt-2.5 md:pt-3.5">
      <div ref={navRef} className="glass-nav rounded-2xl container-page overflow-hidden">
        {/* Main bar */}
        <div className="flex justify-between items-center h-[52px] px-3 md:px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/fundslip.svg" alt="Fundslip" width={22} height={26} style={{ height: "auto" }} />
            <span className="font-headline font-extrabold text-on-background text-[16px] tracking-tight">Fundslip</span>
          </Link>

          {/* Desktop nav pills */}
          <div className="hidden md:flex items-center gap-0.5 rounded-full bg-on-background/[0.06] p-[3px]">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                className={`relative px-3.5 py-[5px] rounded-full text-[12.5px] font-medium transition-colors duration-150 ${isActive(l) ? "text-on-background font-semibold" : "text-on-surface-variant hover:text-on-background"}`}>
                {isActive(l) && <motion.span layoutId="nav-pill" className="absolute inset-0 bg-white rounded-full shadow-sm ring-1 ring-black/[0.04]" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 450, damping: 30 }} />}
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right — toggle button */}
          <div className="flex items-center">
            {/* Desktop: separate buttons */}
            {isConnected ? (
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="hidden md:flex items-center gap-1.5 bg-on-background/[0.06] hover:bg-on-background/[0.09] pl-1.5 pr-2.5 py-1 rounded-full transition-colors">
                <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                </div>
                <span className="text-[12.5px] font-medium text-on-background">{displayName}</span>
              </button>
            ) : (
              <button onClick={() => connect({ connector: injected() })}
                className="hidden md:flex items-center gap-1.5 bg-on-background text-white px-3.5 py-[6px] rounded-full text-[12.5px] font-semibold shadow-btn hover:-translate-y-px hover:shadow-btn-hover active:translate-y-0 transition-all duration-150">
                <Wallet className="w-3.5 h-3.5" /> Connect
              </button>
            )}
            {/* Mobile: single toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center gap-1.5 py-1 pl-1.5 pr-2 rounded-full bg-on-background/[0.06] hover:bg-on-background/[0.09] transition-colors">
              {isConnected ? (
                <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                </div>
              ) : (
                <Wallet className="w-4 h-4 text-on-background ml-0.5" />
              )}
              {/* Animated hamburger lines */}
              <div className="flex flex-col justify-center items-center w-4 h-4 gap-[4px]">
                <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 2.5 : 0 }} className="block w-3 h-[1.5px] bg-on-background rounded-full origin-center" transition={{ duration: 0.15 }} />
                <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -2.5 : 0 }} className="block w-3 h-[1.5px] bg-on-background rounded-full origin-center" transition={{ duration: 0.15 }} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile expanded menu — grows from the nav bar itself */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden md:hidden"
            >
              <div className="px-2 pb-3 pt-1 border-t border-black/[0.04]">
                {/* Nav links */}
                {NAV.map((l) => (
                  <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${isActive(l) ? "text-primary bg-primary/[0.06] font-semibold" : "text-on-surface-variant"}`}>
                    {l.label}
                  </Link>
                ))}
                <div className="h-px bg-black/[0.04] mx-2 my-1.5" />
                {/* Wallet */}
                {isConnected ? (
                  <div className="px-2 py-2 space-y-1.5">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                        <span className="text-[7px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-[13px] font-semibold text-on-background block">{displayName}</span>
                        <span className="text-[10px] font-mono text-on-surface-variant truncate block max-w-[180px]">{address}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => { if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-medium text-on-surface bg-on-background/[0.04] hover:bg-on-background/[0.07] transition-colors">
                        {copied ? <Check className="w-3 h-3 text-tertiary" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                      <button onClick={() => { disconnect(); setMenuOpen(false); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-medium text-error bg-error/[0.06] hover:bg-error/[0.1] transition-colors">
                        <LogOut className="w-3 h-3" /> Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { connect({ connector: injected() }); setMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-on-background text-white py-3 rounded-xl text-[14px] font-semibold shadow-btn mt-1">
                    <Wallet className="w-4 h-4" /> Connect Wallet
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop dropdown for wallet */}
        <AnimatePresence>
          {menuOpen && isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="hidden md:block absolute right-4 md:right-6 top-[58px] w-52 bg-white rounded-xl shadow-card-hover p-1.5 ring-1 ring-black/[0.04]"
            >
              <div className="px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold">Wallet</p>
                <p className="text-[10px] font-mono text-on-surface mt-1 truncate">{address}</p>
              </div>
              <div className="h-px bg-surface-container-low mx-1.5" />
              <button onClick={() => { if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-on-surface hover:bg-surface-container-low rounded-lg transition-colors mt-0.5">
                {copied ? <Check className="w-3 h-3 text-tertiary" /> : <Copy className="w-3 h-3 text-on-surface-variant" />}
                {copied ? "Copied" : "Copy address"}
              </button>
              <button onClick={() => { disconnect(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-error hover:bg-error-container/40 rounded-lg transition-colors">
                <LogOut className="w-3 h-3" /> Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
