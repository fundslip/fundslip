import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
}

export function Footer() {
  return (
    <footer className="w-full mt-auto px-5 md:px-8 pb-6 pt-8">
      <div className="container-page">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-5 px-5 rounded-2xl bg-white/50 backdrop-blur-sm border border-black/[0.04]">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/fundslip.svg" alt="Fundslip" width={18} height={22} style={{ height: "auto" }} />
              <span className="font-headline font-bold text-on-background text-[14px] tracking-tight">Fundslip</span>
            </Link>
            <span className="text-on-surface-variant/20">·</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"><Github className="w-4 h-4" /></a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"><XIcon className="w-3.5 h-3.5" /></a>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-on-surface-variant/60">
            <Link href="/" className="hover:text-on-surface transition-colors">How it works</Link>
            <Link href="/generate" className="hover:text-on-surface transition-colors">Generate</Link>
            <Link href="/verify" className="hover:text-on-surface transition-colors">Verify</Link>
            <a href="#" className="hover:text-on-surface transition-colors">Privacy</a>
            <a href="#" className="hover:text-on-surface transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
