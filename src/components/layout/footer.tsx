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
    <footer className="w-full mt-auto">
      <div className="container-page px-5 md:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-5 border-t border-on-background/[0.04]">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/fundslip.svg" alt="Fundslip" width={18} height={22} style={{ height: "auto" }} />
            <span className="font-headline font-bold text-on-background/80 text-[14px] tracking-tight">Fundslip</span>
          </Link>
          <span className="text-[12px] text-on-surface-variant/40">·</span>
          <div className="flex items-center gap-2.5">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"><Github className="w-[14px] h-[14px]" /></a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"><XIcon className="w-[12px] h-[12px]" /></a>
          </div>
        </div>
        <div className="flex items-center gap-5 text-[12px] text-on-surface-variant/50">
          <Link href="/verify" className="hover:text-on-surface-variant transition-colors">Verify</Link>
          <a href="#" className="hover:text-on-surface-variant transition-colors">Privacy</a>
          <a href="#" className="hover:text-on-surface-variant transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
