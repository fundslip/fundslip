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
    <footer className="mt-auto bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-center py-10 px-6 lg:px-8 container-page gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-gray-400">
            © 2025 Fundslip. Verifiable Ethereum Statements.
          </span>
          <div className="flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
              <XIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-[13px] text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">How it works</Link>
          <Link href="/verify" className="hover:text-gray-900 transition-colors">Verify</Link>
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
