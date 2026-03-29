"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuOpen && headerRef.current && !headerRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const NAV = [
    { href: "/", label: "How it works", exact: true },
    { href: "/generate", label: "Generate" },
    { href: "/verify", label: "Verify" },
  ];
  const isActive = (l: typeof NAV[0]) => l.exact ? pathname === l.href : pathname.startsWith(l.href);

  return (
    <header ref={headerRef} className="fixed top-0 w-full z-[100] bg-white/95 backdrop-blur-md border-b border-outline-variant/60">
      <nav className="container-page flex justify-between items-center h-13 px-5 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/fundslip.svg" alt="Fundslip" width={20} height={24} style={{ height: "auto" }} />
          <span className="font-headline font-semibold text-brand-black text-[17px]">Fundslip</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href}
              className={`text-[14px] transition-colors ${isActive(l) ? "text-brand-black font-medium" : "text-on-surface-variant hover:text-brand-black"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop wallet — RainbowKit handles connect/disconnect/chain switching */}
          <div className="hidden md:block">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" label="Connect" />
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-9 h-9 flex items-center justify-center">
              {menuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} className="md:hidden border-t border-outline-variant/60">
            <div className="px-5 py-4 space-y-1">
              {NAV.map((l) => (
                <Link key={l.href} href={l.href}
                  className={`block px-3 py-3 rounded-lg text-[16px] ${isActive(l) ? "text-brand-black font-medium bg-surface" : "text-on-surface-variant"}`}>
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
