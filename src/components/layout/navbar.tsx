"use client";

import Link from "next/link";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { injected } from "wagmi/connectors";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Copy, Check } from "lucide-react";

function FundslipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 62" fill="none" className={className}>
      <rect x="6" y="0" width="46" height="56" rx="5" fill="#0048cc" opacity="0.35"/>
      <rect x="0" y="6" width="46" height="56" rx="5" fill="#003499"/>
      <rect x="9" y="16" width="28" height="2.2" rx="1.1" fill="#fff" opacity="0.85"/>
      <rect x="9" y="22.5" width="19" height="2.2" rx="1.1" fill="#fff" opacity="0.4"/>
      <rect x="9" y="29" width="23" height="2.2" rx="1.1" fill="#fff" opacity="0.4"/>
      <line x1="9" y1="40" x2="27" y2="40" stroke="#85f8c4" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="45" x2="20" y2="45" stroke="#85f8c4" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
      <circle cx="36" cy="49" r="7" fill="#85f8c4"/>
      <path d="M32.5,49 L34.8,51.3 L39.5,46.5" stroke="#003499" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address, query: { enabled: !!address } });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleConnect = () => { connect({ connector: injected() }); };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "");

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/generate") {
      // Dispatch a custom event — the generate page listens for this to reset state
      window.dispatchEvent(new CustomEvent("fundslip:reset"));
    } else {
      router.push("/generate");
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
      <nav className="flex justify-between items-center h-[72px] px-6 md:px-10 container-page">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <FundslipIcon className="h-7 w-auto" />
            <span className="hidden md:inline font-headline font-extrabold text-on-background text-xl tracking-tight">
              Fundslip
            </span>
          </Link>
          <div className="hidden md:flex gap-6 font-headline text-sm tracking-tight">
            <Link href="/" className={`relative py-1 transition-colors duration-150 ${pathname === "/" ? "text-primary font-semibold" : "text-slate-600 hover:text-slate-900"}`}>
              How it works
              {pathname === "/" && <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-primary rounded-full" />}
            </Link>
            <a
              href="/generate"
              onClick={handleGenerateClick}
              className={`relative py-1 transition-colors duration-150 cursor-pointer ${pathname === "/generate" ? "text-primary font-semibold" : "text-slate-600 hover:text-slate-900"}`}
            >
              Generate
              {pathname === "/generate" && <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-primary rounded-full" />}
            </a>
            <Link href="/verify" className={`relative py-1 transition-colors duration-150 ${pathname === "/verify" ? "text-primary font-semibold" : "text-slate-600 hover:text-slate-900"}`}>
              Verify
              {pathname === "/verify" && <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-primary rounded-full" />}
            </Link>
          </div>
        </div>

        {isConnected ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container px-4 py-2 rounded-xl transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-tertiary-fixed" />
              <span className="font-headline font-bold text-primary text-sm">{displayName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-lg ring-1 ring-outline-variant/15 py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-surface-container">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Connected</p>
                  <p className="text-xs font-mono text-on-surface mt-0.5 truncate">{address}</p>
                </div>
                <button onClick={handleCopyAddress} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                  {copied ? <Check className="w-4 h-4 text-tertiary" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}
                  {copied ? "Copied!" : "Copy Address"}
                </button>
                <button onClick={() => { disconnect(); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={handleConnect} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] duration-100 hover:opacity-90 transition-opacity">
            Connect Wallet
          </button>
        )}
      </nav>
    </header>
  );
}
