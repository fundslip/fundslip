"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";

interface CopyButtonProps { text: string; className?: string; }

export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [text]);

  return (
    <button onClick={handleCopy}
      className={`p-2 bg-surface text-on-surface-variant rounded-lg hover:text-brand-black transition-colors ${className}`}
      title={copied ? "Copied!" : "Copy"}>
      {copied ? <Check className="w-4 h-4 text-tertiary" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
