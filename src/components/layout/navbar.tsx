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
    <>
      {/* Floating nav — sits below the top with margin */}
      <header className="fixed top-3 md:top-4 left-3 right-3 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-[1080px] z-50">
        <nav ref={menuRef} className="relative flex justify-between items-center h-12 md:h-[52px] px-3 md:px-4 rounded-2xl bg-white/80 backdrop-blur-2xl shadow-card border border-black/[0.06]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/fundslip.svg" alt="Fundslip" width={22} height={26} style={{ height: "auto" }} />
            <span className="font-headline font-extrabold text-on-background text-[15px] tracking-tight">Fundslip</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5 rounded-full bg-on-background/[0.04] p-[3px]">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                className={`relative px-3.5 py-[5px] rounded-full text-[13px] font-medium transition-colors duration-150 ${isActive(l) ? "text-on-background" : "text-on-surface-variant hover:text-on-background"}`}>
                {isActive(l) && <motion.span layoutId="nav-active" className="absolute inset-0 bg-white rounded-full shadow-sm" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 450, damping: 30 }} />}
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Desktop connect */}
            {!isConnected && (
              <button onClick={() => connect({ connector: injected() })}
                className="hidden md:flex items-center gap-1.5 bg-on-background text-white px-3.5 py-[6px] rounded-full text-[13px] font-medium hover:bg-on-background/90 active:scale-[0.97] transition-all">
                <Wallet className="w-3.5 h-3.5" /> Connect
              </button>
            )}
            {/* Desktop wallet */}
            {isConnected && (
              <button onClick={() => setMenuOpen(!menuOpen)} className="hidden md:flex items-center gap-1.5 bg-on-background/[0.04] hover:bg-on-background/[0.07] pl-2 pr-2.5 py-[5px] rounded-full transition-colors">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                </div>
                <span className="text-[13px] font-medium text-on-background">{displayName}</span>
                <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>
            )}

            {/* Mobile: single hamburger that contains everything */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[4px]" aria-label="Menu">
              <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 3 : 0 }} className="block w-4 h-[1.5px] bg-on-background rounded-full origin-center" transition={{ duration: 0.15 }} />
              <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} className="block w-4 h-[1.5px] bg-on-background rounded-full" transition={{ duration: 0.1 }} />
              <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -3 : 0 }} className="block w-4 h-[1.5px] bg-on-background rounded-full origin-center" transition={{ duration: 0.15 }} />
            </button>
          </div>

          {/* Single dropdown — nav + wallet on mobile, wallet-only on desktop */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-card-hover p-1.5 ring-1 ring-black/[0.04]"
              >
                {/* Nav links (mobile only) */}
                <div className="md:hidden">
                  {NAV.map((l) => (
                    <Link key={l.href} href={l.href} onClick={handleNav(l.href)}
                      className={`flex items-center px-3.5 py-2.5 rounded-xl text-[15px] font-medium ${isActive(l) ? "text-primary bg-primary/[0.05]" : "text-on-surface-variant"}`}>
                      {l.label}
                    </Link>
                  ))}
                  <div className="h-px bg-black/[0.04] mx-2 my-1" />
                </div>

                {/* Wallet section */}
                {isConnected ? (
                  <div className="space-y-0.5">
                    <div className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                          <span className="text-[7px] font-bold text-white">{displayName.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <span className="text-[13px] font-semibold">{displayName}</span>
                      </div>
                      <p className="text-[11px] font-mono text-on-surface-variant truncate">{address}</p>
                    </div>
                    <button onClick={() => { if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-on-surface hover:bg-surface-container-low rounded-xl transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                      {copied ? "Copied" : "Copy address"}
                    </button>
                    <button onClick={() => { disconnect(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-error hover:bg-error-container/30 rounded-xl transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Disconnect
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { connect({ connector: injected() }); setMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-on-background text-white py-2.5 rounded-xl text-[14px] font-semibold">
                    <Wallet className="w-4 h-4" /> Connect Wallet
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>
    </>
  );
}
