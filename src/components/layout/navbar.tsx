"use client";

import Link from "next/link";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { injected } from "wagmi/connectors";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Copy, Check, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address, query: { enabled: !!address } });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileOpen]);

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
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "glass shadow-[0_1px_0_rgba(0,0,0,0.06)]" : ""}`}>
        <nav className="flex justify-between items-center h-14 px-5 md:px-8 container-page">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/fundslip.svg" alt="Fundslip" width={24} height={28} style={{ height: "auto" }} />
            <span className="font-headline font-extrabold text-on-background text-[16px] tracking-tight">Fundslip</span>
          </Link>

          {/* Desktop nav — pill container like Linear */}
          <div className="hidden md:flex items-center gap-0.5 rounded-full bg-on-background/[0.04] p-[3px]">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                className={`relative px-4 py-[6px] rounded-full text-[13px] font-medium transition-colors duration-150 ${isActive(l) ? "text-on-background" : "text-on-surface-variant hover:text-on-background"}`}>
                {isActive(l) && <motion.span layoutId="nav-active" className="absolute inset-0 bg-white rounded-full shadow-sm" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 450, damping: 30 }} />}
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2.5">
            {isConnected ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-on-background/[0.04] hover:bg-on-background/[0.07] pl-2 pr-2.5 py-1.5 rounded-full transition-colors">
                  <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                    <span className="text-[7px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="text-[13px] font-medium text-on-background hidden sm:inline">{displayName}</span>
                  <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.12 }} className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card-hover p-1.5 ring-1 ring-black/[0.04]">
                      <div className="px-3 py-2.5">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold">Wallet</p>
                        <p className="text-[11px] font-mono text-on-surface mt-1 truncate">{address}</p>
                      </div>
                      <div className="h-px bg-surface-container-low mx-1.5" />
                      <button onClick={() => { if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-low rounded-xl transition-colors mt-1">
                        {copied ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                        {copied ? "Copied" : "Copy address"}
                      </button>
                      <button onClick={() => { disconnect(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-error hover:bg-error-container/40 rounded-xl transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => connect({ connector: injected() })}
                className="hidden md:flex items-center gap-1.5 bg-on-background text-white px-4 py-[7px] rounded-full text-[13px] font-medium hover:bg-on-background/90 active:scale-[0.97] transition-all">
                <Wallet className="w-3.5 h-3.5" /> Connect
              </button>
            )}
            {/* Hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px]" aria-label="Menu">
              <motion.span animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 3.5 : 0 }} className="block w-[18px] h-[1.5px] bg-on-background rounded-full origin-center" transition={{ duration: 0.15 }} />
              <motion.span animate={{ opacity: mobileOpen ? 0 : 1 }} className="block w-[18px] h-[1.5px] bg-on-background rounded-full" transition={{ duration: 0.1 }} />
              <motion.span animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -3.5 : 0 }} className="block w-[18px] h-[1.5px] bg-on-background rounded-full origin-center" transition={{ duration: 0.15 }} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/5 md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="fixed top-[56px] left-4 right-4 z-50 bg-white rounded-2xl shadow-card-hover p-2 md:hidden ring-1 ring-black/[0.04]">
              {NAV.map((l) => (
                <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                  className={`flex items-center px-4 py-3 rounded-xl text-[15px] font-medium ${isActive(l) ? "text-primary bg-primary/[0.05]" : "text-on-surface-variant"}`}>
                  {l.label}
                </Link>
              ))}
              <div className="h-px bg-surface-container-low mx-2 my-1.5" />
              {isConnected ? (
                <div className="px-3 py-2.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                      <span className="text-[7px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="text-[14px] font-semibold">{displayName}</span>
                  </div>
                  <button onClick={() => { disconnect(); setMobileOpen(false); }} className="w-full py-2.5 rounded-xl text-[13px] font-medium text-error bg-error-container/20 flex items-center justify-center gap-2">
                    <LogOut className="w-3.5 h-3.5" /> Disconnect
                  </button>
                </div>
              ) : (
                <button onClick={() => { connect({ connector: injected() }); setMobileOpen(false); }} className="w-full py-3 rounded-xl text-[14px] font-semibold bg-on-background text-white flex items-center justify-center gap-2 mx-0">
                  <Wallet className="w-4 h-4" /> Connect Wallet
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
