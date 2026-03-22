import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
}

export function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-on-background/[0.05] bg-white/40">
      <div className="container-page px-5 md:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/fundslip.svg" alt="Fundslip" width={16} height={20} style={{ height: "auto" }} />
            <span className="font-headline font-bold text-on-background text-[13px] tracking-tight">Fundslip</span>
          </Link>
          <span className="text-on-surface-variant/30 text-[10px]">·</span>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-on-background transition-colors"><Github className="w-3.5 h-3.5" /></a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-on-background transition-colors"><XIcon className="w-3 h-3" /></a>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-on-surface-variant">
          <Link href="/verify" className="hover:text-on-background transition-colors">Verify</Link>
          <a href="#" className="hover:text-on-background transition-colors">Privacy</a>
          <a href="#" className="hover:text-on-background transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
