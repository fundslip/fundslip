import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full mt-auto bg-on-background text-white">
      <div className="container-page px-5 md:px-8 py-10 md:py-14">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-3">
            <Image src="/fundslip-logo.svg" alt="Fundslip" width={110} height={28} style={{ height: "auto" }} className="brightness-0 invert" />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/40">
            <Link href="/" className="hover:text-white transition-colors">How it works</Link>
            <Link href="/generate" className="hover:text-white transition-colors">Generate</Link>
            <Link href="/verify" className="hover:text-white transition-colors">Verify</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-white/25">&copy; {new Date().getFullYear()} Fundslip. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/25 hover:text-white/60 transition-colors"><Github className="w-4 h-4" /></a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-white/25 hover:text-white/60 transition-colors"><XIcon className="w-3.5 h-3.5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
