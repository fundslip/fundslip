import Link from "next/link";
import { Github } from "lucide-react";

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

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-surface-container bg-surface-container-low/50">
      <div className="flex flex-col sm:flex-row justify-between items-center py-5 px-6 md:px-10 container-page gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <FundslipIcon className="h-5 w-auto" />
            <span className="font-headline font-bold text-on-background text-base tracking-tight">
              Fundslip
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors" title="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors" title="X (Twitter)">
              <XIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-5 text-xs text-on-surface-variant">
          <Link href="/" className="hover:text-primary transition-colors">How it works</Link>
          <Link href="/verify" className="hover:text-primary transition-colors">Verify</Link>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
