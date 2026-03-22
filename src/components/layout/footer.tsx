import Link from "next/link";
import { Github } from "lucide-react";

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
      <div className="border-t border-outline-variant/10">
        <div className="container-page px-5 md:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <FundslipIcon className="h-6 w-auto transition-transform duration-200 group-hover:scale-105" />
                <span className="font-headline font-bold text-on-background text-base tracking-tight">
                  Fundslip
                </span>
              </Link>
              <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                Verifiable financial statements from Ethereum wallets. Client-side, open-source, no backend.
              </p>
              {/* Social */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all duration-200"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all duration-200"
                  title="X (Twitter)"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-on-surface-variant">
              <Link href="/" className="hover:text-on-surface transition-colors duration-200">
                How it works
              </Link>
              <Link href="/generate" className="hover:text-on-surface transition-colors duration-200">
                Generate
              </Link>
              <Link href="/verify" className="hover:text-on-surface transition-colors duration-200">
                Verify
              </Link>
              <a href="#" className="hover:text-on-surface transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="hover:text-on-surface transition-colors duration-200">
                Terms
              </a>
            </div>
          </div>

          {/* Bottom line */}
          <div className="mt-8 pt-6 border-t border-outline-variant/8 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-on-surface-variant/60">
              &copy; {new Date().getFullYear()} Fundslip. All rights reserved.
            </p>
            <p className="text-xs text-on-surface-variant/40">
              Built with cryptographic precision.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
