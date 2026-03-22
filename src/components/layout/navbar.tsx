"use client";

import Link from "next/link";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { injected } from "wagmi/connectors";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Copy, Check, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 62" fill="none" className={className}>
      <rect x="6" y="0" width="46" height="56" rx="5" fill="#1d4ed8" opacity="0.2"/>
      <rect x="0" y="6" width="46" height="56" rx="5" fill="#0a2f7e"/>
      <rect x="9" y="16" width="28" height="2.2" rx="1.1" fill="#fff" opacity="0.8"/>
      <rect x="9" y="22.5" width="19" height="2.2" rx="1.1" fill="#fff" opacity="0.3"/>
      <rect x="9" y="29" width="23" height="2.2" rx="1.1" fill="#fff" opacity="0.3"/>
      <line x1="9" y1="40" x2="27" y2="40" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="45" x2="20" y2="45" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
      <circle cx="36" cy="49" r="7" fill="#6ee7b7"/>
      <path d="M32.5,49 L34.8,51.3 L39.5,46.5" stroke="#0a2f7e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/", label: "How it works", exact: true },
  { href: "/generate", label: "Generate" },
  { href: "/verify", label: "Verify" },
];

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
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "");
  const isActive = (link: typeof NAV_LINKS[0]) => link.exact ? pathname === link.href : pathname.startsWith(link.href);

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    if (href === "/generate" && pathname === "/generate") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("fundslip:reset"));
    }
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)]" : "bg-transparent"
      }`}>
        <nav className="flex justify-between items-center h-14 md:h-16 px-5 md:px-8 container-page">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-6 w-auto" />
            <span className="font-headline font-extrabold text-on-background text-[17px] tracking-tight">
              Fundslip
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5 bg-surface-container-low/60 backdrop-blur-sm rounded-full px-1 py-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick(link.href)}
                className={`relative px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  isActive(link) ? "text-on-background" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {isActive(link) && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">{displayName.slice(0, 2)}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-on-background hidden sm:inline">{displayName}</span>
                  <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-elevated py-1.5 ring-1 ring-black/[0.04]"
                    >
                      <div className="px-4 py-3 border-b border-surface-container-low">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold">Wallet</p>
                        <p className="text-xs font-mono text-on-surface mt-1 truncate">{address}</p>
                      </div>
                      <div className="p-1">
                        <button onClick={() => { if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-low rounded-xl transition-colors">
                          {copied ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                          {copied ? "Copied!" : "Copy Address"}
                        </button>
                        <button onClick={() => { disconnect(); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-error hover:bg-error-container/40 rounded-xl transition-colors">
                          <LogOut className="w-3.5 h-3.5" /> Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => connect({ connector: injected() })}
                className="hidden md:flex items-center gap-2 bg-on-background text-white px-4 py-2 rounded-full text-[13px] font-semibold hover:bg-on-background/90 active:scale-[0.97] transition-all"
              >
                <Wallet className="w-3.5 h-3.5" />
                Connect
              </button>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col items-center justify-center w-9 h-9 rounded-full hover:bg-surface-container-low transition-colors gap-[5px]"
              aria-label="Menu"
            >
              <motion.span animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 3.5 : 0 }} className="block w-4 h-[1.5px] bg-on-background rounded-full origin-center" />
              <motion.span animate={{ opacity: mobileOpen ? 0 : 1 }} className="block w-4 h-[1.5px] bg-on-background rounded-full" />
              <motion.span animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -3.5 : 0 }} className="block w-4 h-[1.5px] bg-on-background rounded-full origin-center" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu — drops from top */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed top-14 left-3 right-3 z-50 bg-white rounded-2xl shadow-elevated p-2 md:hidden"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick(link.href)}
                  className={`flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                    isActive(link) ? "text-primary bg-primary/[0.05] font-semibold" : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-1 pt-2 border-t border-surface-container-low mx-2">
                {isConnected ? (
                  <div className="px-2 py-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">{displayName.slice(0, 2)}</span>
                      </div>
                      <span className="text-sm font-semibold text-on-background">{displayName}</span>
                    </div>
                    <button onClick={() => { disconnect(); setMobileOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium text-error bg-error-container/20">
                      <LogOut className="w-3.5 h-3.5" /> Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { connect({ connector: injected() }); setMobileOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-on-background text-white px-4 py-3 rounded-xl text-[14px] font-semibold mx-2 mb-2"
                    style={{ width: "calc(100% - 16px)" }}
                  >
                    <Wallet className="w-4 h-4" /> Connect Wallet
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
