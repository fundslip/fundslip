import Link from "next/link";
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
    <footer className="w-full mt-auto border-t border-outline-variant/8">
      <div className="container-page px-5 md:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs text-on-surface-variant/50">&copy; {new Date().getFullYear()} Fundslip</span>
          <div className="flex items-center gap-2">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors">
              <Github className="w-3.5 h-3.5" />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors">
              <XIcon className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-5 text-xs text-on-surface-variant/50">
          <Link href="/verify" className="hover:text-on-surface-variant transition-colors">Verify</Link>
          <a href="#" className="hover:text-on-surface-variant transition-colors">Privacy</a>
          <a href="#" className="hover:text-on-surface-variant transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
