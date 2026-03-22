"use client";

import Link from "next/link";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { injected } from "wagmi/connectors";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Copy, Check, Menu, X, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function FundslipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 62" fill="none" className={className}>
      <rect x="6" y="0" width="46" height="56" rx="5" fill="#1d4ed8" opacity="0.25"/>
      <rect x="0" y="6" width="46" height="56" rx="5" fill="#0a2f7e"/>
      <rect x="9" y="16" width="28" height="2.2" rx="1.1" fill="#fff" opacity="0.85"/>
      <rect x="9" y="22.5" width="19" height="2.2" rx="1.1" fill="#fff" opacity="0.35"/>
      <rect x="9" y="29" width="23" height="2.2" rx="1.1" fill="#fff" opacity="0.35"/>
      <line x1="9" y1="40" x2="27" y2="40" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="45" x2="20" y2="45" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
      <circle cx="36" cy="49" r="7" fill="#6ee7b7"/>
      <path d="M32.5,49 L34.8,51.3 L39.5,46.5" stroke="#0a2f7e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/", label: "How it works", exact: true },
  { href: "/generate", label: "Generate", exact: false },
  { href: "/verify", label: "Verify", exact: false },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address, query: { enabled: !!address } });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track scroll for nav shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleConnect = () => { connect({ connector: injected() }); };

  const handleCopyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    if (href === "/generate" && pathname === "/generate") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("fundslip:reset"));
    }
  };

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "");
  const isActive = (link: typeof NAV_LINKS[0]) => link.exact ? pathname === link.href : pathname.startsWith(link.href);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "glass-heavy shadow-float"
            : "bg-white/60 backdrop-blur-md"
        }`}
      >
        <nav className="flex justify-between items-center h-16 md:h-[68px] px-5 md:px-8 container-page">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <FundslipIcon className="h-7 w-auto transition-transform duration-200 group-hover:scale-105" />
            <span className="hidden sm:inline font-headline font-extrabold text-on-background text-lg tracking-tight">
              Fundslip
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick(link.href)}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link)
                    ? "text-primary bg-primary/[0.06]"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                {link.label}
                {isActive(link) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container pl-3 pr-2.5 py-1.5 rounded-xl transition-all duration-200 group"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
                  </span>
                  <span className="font-headline font-bold text-primary text-sm hidden sm:inline">{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-64 glass-heavy rounded-2xl shadow-elevated py-2 z-50 ring-1 ring-black/[0.04]"
                    >
                      <div className="px-4 py-3 border-b border-outline-variant/10">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold">Connected Wallet</p>
                        <p className="text-xs font-mono text-on-surface mt-1 truncate">{address}</p>
                      </div>
                      <div className="p-1">
                        <button onClick={handleCopyAddress} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-on-surface hover:bg-surface-container-low rounded-xl transition-colors">
                          {copied ? <Check className="w-4 h-4 text-tertiary" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}
                          {copied ? "Copied!" : "Copy Address"}
                        </button>
                        <button onClick={() => { disconnect(); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-error hover:bg-error-container/40 rounded-xl transition-colors">
                          <LogOut className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={handleConnect}
                className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-semibold shadow-glow-primary transition-all duration-200 hover:shadow-lg hover:-translate-y-px active:translate-y-0"
                whileTap={{ scale: 0.97 }}
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </motion.button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-surface-container-low transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 glass-heavy shadow-elevated flex flex-col md:hidden"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-outline-variant/10">
                <span className="font-headline font-bold text-on-background">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-surface-container-low transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 px-3 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleNavClick(link.href)}
                    className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive(link)
                        ? "text-primary bg-primary/[0.07] font-semibold"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Wallet action at bottom */}
              <div className="px-4 py-5 border-t border-outline-variant/10">
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="px-1">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-semibold">Connected</p>
                      <p className="text-sm font-headline font-bold text-primary mt-0.5">{displayName}</p>
                    </div>
                    <button
                      onClick={() => { disconnect(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-error bg-error-container/30 hover:bg-error-container/50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { handleConnect(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-3.5 rounded-xl text-sm font-semibold shadow-glow-primary"
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
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
