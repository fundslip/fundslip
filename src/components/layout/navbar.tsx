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
      <rect x="6" y="0" width="46" height="56" rx="5" fill="#1a2d5a" opacity="0.35"/>
      <rect x="0" y="6" width="46" height="56" rx="5" fill="#0f1d42"/>
      <rect x="9" y="16" width="28" height="2.2" rx="1.1" fill="#fff" opacity="0.85"/>
      <rect x="9" y="22.5" width="19" height="2.2" rx="1.1" fill="#fff" opacity="0.4"/>
      <rect x="9" y="29" width="23" height="2.2" rx="1.1" fill="#fff" opacity="0.4"/>
      <line x1="9" y1="40" x2="27" y2="40" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="45" x2="20" y2="45" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
      <circle cx="36" cy="49" r="7" fill="#10b981"/>
      <path d="M32.5,49 L34.8,51.3 L39.5,46.5" stroke="#0f1d42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "");

  const navLinks = [
    { href: "/", label: "How it works" },
    { href: "/generate", label: "Generate", onClick: true },
    { href: "/verify", label: "Verify" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[rgba(255,255,255,0.85)] backdrop-blur-[20px] border-b border-[rgba(0,0,0,0.04)]">
      <nav className="flex justify-between items-center h-16 px-6 lg:px-8 container-page">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <FundslipIcon className="h-6 w-auto" />
            <span className="hidden sm:inline font-headline font-bold text-gray-900 text-[17px]">Fundslip</span>
          </Link>
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const handleClick = link.onClick ? (e: React.MouseEvent) => {
                e.preventDefault();
                if (pathname === "/generate") window.dispatchEvent(new CustomEvent("fundslip:reset"));
                else router.push("/generate");
              } : undefined;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={handleClick}
                  className={`text-sm font-medium transition-colors duration-150 relative py-1 ${
                    isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-[1px] h-[1.5px] bg-gray-900 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {isConnected ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200/80 pl-3 pr-2.5 py-1.5 rounded-full transition-colors text-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
              <span className="font-medium text-gray-700 text-[13px]">{displayName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-md ring-1 ring-black/[0.04] py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="section-label mb-1">Connected</p>
                  <p className="text-xs font-mono text-gray-600 truncate">{address}</p>
                </div>
                <button
                  onClick={async () => { if (address) { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  {copied ? "Copied!" : "Copy Address"}
                </button>
                <button
                  onClick={() => { disconnect(); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => connect({ connector: injected() })}
            className="bg-navy text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-navy-light transition-colors duration-150"
          >
            Connect Wallet
          </button>
        )}
      </nav>
    </header>
  );
}
