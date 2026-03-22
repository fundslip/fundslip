import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
}

export function Footer() {
  return (
    <footer className="w-full mt-auto py-6 px-5 md:px-8">
      <div className="container-page flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/fundslip.svg" alt="Fundslip" width={16} height={20} style={{ height: "auto" }} />
          <span className="font-headline font-bold text-on-surface-variant text-[13px] tracking-tight">Fundslip</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-2">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"><Github className="w-3.5 h-3.5" /></a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"><XIcon className="w-3 h-3" /></a>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-on-surface-variant/40">
            <Link href="/verify" className="hover:text-on-surface-variant transition-colors">Verify</Link>
            <a href="#" className="hover:text-on-surface-variant transition-colors">Privacy</a>
            <a href="#" className="hover:text-on-surface-variant transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
