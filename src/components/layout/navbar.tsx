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
    <header className="fixed top-0 w-full z-50 px-4 md:px-6 pt-3 md:pt-4">
      <nav className="glass-nav rounded-2xl h-12 md:h-[52px] flex justify-between items-center px-3 md:px-4 container-page">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/fundslip.svg" alt="Fundslip" width={22} height={26} style={{ height: "auto" }} />
          <span className="font-headline font-extrabold text-on-background text-[15px] tracking-tight">Fundslip</span>
        </Link>

        {/* Desktop nav pills */}
        <div className="hidden md:flex items-center gap-0.5 rounded-full bg-on-background/[0.05] p-[3px]">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
              className={`relative px-3.5 py-[5px] rounded-full text-[12.5px] font-medium transition-colors duration-150 ${isActive(l) ? "text-on-background" : "text-on-surface-variant hover:text-on-background"}`}>
              {isActive(l) && <motion.span layoutId="nav-pill" className="absolute inset-0 bg-white rounded-full shadow-sm" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 450, damping: 30 }} />}
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side — single dropdown on mobile */}
        <div className="relative" ref={menuRef}>
          {/* Desktop: separate connect/wallet */}
          {isConnected ? (
            <>
              {/* Desktop wallet button */}
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="hidden md:flex items-center gap-1.5 bg-on-background/[0.05] hover:bg-on-background/[0.08] pl-1.5 pr-2.5 py-1 rounded-full transition-colors">
                <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                </div>
                <span className="text-[12.5px] font-medium text-on-background">{displayName}</span>
                <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>
              {/* Mobile: single button opens everything */}
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden flex items-center gap-1.5 bg-on-background/[0.05] hover:bg-on-background/[0.08] pl-1.5 pr-2 py-1 rounded-full transition-colors">
                <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                </div>
                <Menu className="w-3.5 h-3.5 text-on-surface-variant" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => connect({ connector: injected() })}
                className="hidden md:flex items-center gap-1.5 bg-on-background text-white px-3.5 py-[6px] rounded-full text-[12.5px] font-semibold shadow-btn hover:-translate-y-px hover:shadow-btn-hover active:translate-y-0 transition-all duration-150">
                <Wallet className="w-3.5 h-3.5" /> Connect
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-on-background/[0.05] hover:bg-on-background/[0.08] transition-colors">
                <Menu className="w-4 h-4 text-on-background" />
              </button>
            </>
          )}

          {/* Single unified dropdown — nav + wallet on mobile, wallet only on desktop */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card-hover p-1.5 ring-1 ring-black/[0.04]"
              >
                {/* Mobile nav links — hidden on desktop */}
                <div className="md:hidden">
                  {NAV.map((l) => (
                    <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                      className={`flex items-center px-3 py-2.5 rounded-xl text-[14px] font-medium ${isActive(l) ? "text-primary bg-primary/[0.05]" : "text-on-surface-variant hover:bg-surface-container-low"}`}>
                      {l.label}
                    </Link>
                  ))}
                  <div className="h-px bg-surface-container-low mx-1.5 my-1" />
                </div>

                {/* Wallet section */}
                {isConnected ? (
                  <>
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                          <span className="text-[6px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <span className="text-[12px] font-semibold text-on-background">{displayName}</span>
                      </div>
                      <p className="text-[10px] font-mono text-on-surface-variant mt-1 truncate pl-7">{address}</p>
                    </div>
                    <button onClick={() => { if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-low rounded-xl transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                      {copied ? "Copied" : "Copy address"}
                    </button>
                    <button onClick={() => { disconnect(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-error hover:bg-error-container/40 rounded-xl transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Disconnect
                    </button>
                  </>
                ) : (
                  <button onClick={() => { connect({ connector: injected() }); setMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-on-background text-white py-2.5 rounded-xl text-[13px] font-semibold shadow-btn">
                    <Wallet className="w-3.5 h-3.5" /> Connect Wallet
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
}
