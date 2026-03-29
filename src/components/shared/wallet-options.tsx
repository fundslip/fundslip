"use client";

import { useConnect } from "wagmi";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, Loader2, Copy, Check, Smartphone, HelpCircle } from "lucide-react";
import QRCode from "qrcode";
import { copyToClipboard } from "@/lib/clipboard";

interface WalletOptionsProps {
  layout?: "dropdown" | "page";
  onConnected?: () => void;
}

/* eslint-disable @next/next/no-img-element */

export function WalletOptions({ layout = "dropdown", onConnected }: WalletOptionsProps) {
  const { connect, connectors, isPending } = useConnect();
  const [wcQrDataUrl, setWcQrDataUrl] = useState<string | null>(null);
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const isCompact = layout === "dropdown";
  const isMobile = typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Deduplicate connectors — keep all unique ones, skip generic "Injected"
  // if a named injected wallet (MetaMask etc.) is already detected via EIP-6963
  const wallets = useMemo(() => {
    const seen = new Map<string, (typeof connectors)[number]>();
    const hasNamedInjected = connectors.some((c) => c.type === "injected" && c.id !== "injected");

    for (const c of connectors) {
      if (c.id === "injected" && hasNamedInjected) continue;
      if (!seen.has(c.uid)) seen.set(c.uid, c);
    }
    return [...seen.values()];
  }, [connectors]);

  const resetWc = useCallback(() => {
    setWcQrDataUrl(null);
    setWcUri(null);
    setPendingId(null);
    setCopied(false);
  }, []);

  const handleSelect = useCallback(async (connector: (typeof connectors)[number]) => {
    setPendingId(connector.uid);

    if (connector.id === "walletConnect") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const provider = await (connector as any).getProvider();
        const onUri = async (uri: string) => {
          setWcUri(uri);
          if (!isMobile) {
            const dataUrl = await QRCode.toDataURL(uri, {
              width: isCompact ? 200 : 260,
              margin: 2,
              color: { dark: "#1d1d1f", light: "#ffffff" },
            });
            setWcQrDataUrl(dataUrl);
          } else {
            window.location.href = uri;
          }
        };
        provider.on("display_uri", onUri);

        connect({ connector }, {
          onSuccess: () => { provider.removeListener("display_uri", onUri); onConnected?.(); },
          onError: () => { provider.removeListener("display_uri", onUri); resetWc(); },
        });
      } catch {
        resetWc();
      }
      return;
    }

    connect({ connector }, {
      onSuccess: () => { setPendingId(null); onConnected?.(); },
      onError: () => setPendingId(null),
    });
  }, [connect, isCompact, isMobile, onConnected, resetWc]);

  useEffect(() => { return () => resetWc(); }, [resetWc]);

  // ── WalletConnect QR View ──
  if (wcQrDataUrl) {
    return (
      <div className={isCompact ? "" : "flex flex-col items-center"}>
        <button onClick={resetWc}
          className="flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-brand-black transition-colors mb-3 self-start">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div className={`bg-white rounded-xl border border-outline-variant ${isCompact ? "p-2" : "p-4"}`}>
          <img src={wcQrDataUrl} alt="Scan to connect" className={isCompact ? "w-[200px] h-[200px]" : "w-[260px] h-[260px]"} />
        </div>

        <p className={`text-on-surface-variant mt-3 text-center ${isCompact ? "text-[12px]" : "text-[14px]"}`}>
          Scan with your mobile wallet
        </p>

        {wcUri && (
          <button onClick={async () => {
            const ok = await copyToClipboard(wcUri);
            if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
          }}
            className={`mt-2 flex items-center gap-1.5 text-on-surface-variant hover:text-brand-black transition-colors ${isCompact ? "text-[12px]" : "text-[13px]"}`}>
            {copied ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        )}
      </div>
    );
  }

  // ── Wallet List ──
  return (
    <div className={isCompact ? "" : "w-full max-w-sm"}>
      {/* Available / detected wallets */}
      <div className={isCompact ? "space-y-0.5" : "space-y-2"}>
        {wallets.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => handleSelect(connector)}
            disabled={isPending}
            className={`w-full flex items-center gap-3 rounded-lg transition-colors text-left disabled:opacity-50
              ${isCompact
                ? "px-3 py-2.5 hover:bg-surface text-[14px]"
                : "px-4 py-3.5 border border-outline-variant hover:bg-surface hover:border-outline text-[15px]"
              }`}
          >
            <WalletIcon connector={connector} />
            <div className="flex-1 min-w-0">
              <span className="text-brand-black font-medium">{connector.name}</span>
              {connector.id === "walletConnect" && (
                <span className={`block text-on-surface-variant ${isCompact ? "text-[11px]" : "text-[12px]"}`}>
                  {isMobile ? "Open in wallet app" : "Scan QR code"}
                </span>
              )}
            </div>
            {pendingId === connector.uid ? (
              <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin flex-shrink-0" />
            ) : connector.id === "walletConnect" ? (
              <Smartphone className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
            ) : null}
          </button>
        ))}
      </div>

      {/* Help for new users */}
      <div className={`border-t border-outline-variant ${isCompact ? "mt-2 pt-2" : "mt-4 pt-4"}`}>
        <button onClick={() => setShowHelp(!showHelp)}
          className={`flex items-center gap-2 text-on-surface-variant hover:text-brand-black transition-colors ${isCompact ? "text-[12px] px-3" : "text-[13px]"}`}>
          <HelpCircle className="w-3.5 h-3.5" />
          What is a wallet?
        </button>
        {showHelp && (
          <p className={`text-on-surface-variant leading-relaxed mt-2 ${isCompact ? "text-[11px] px-3 pb-1" : "text-[13px]"}`}>
            A wallet is a secure app that lets you interact with the Ethereum blockchain.
            It holds your private keys and signs transactions on your behalf.{" "}
            <a href="https://ethereum.org/wallets" target="_blank" rel="noopener noreferrer"
              className="text-brand-navy underline underline-offset-2">
              Learn more
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function WalletIcon({ connector }: { connector: { icon?: string; name: string } }) {
  if (connector.icon) {
    return <img src={connector.icon} alt="" className="w-7 h-7 rounded-lg" />;
  }
  // Fallback: styled initial
  return (
    <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
      <span className="text-[11px] font-semibold text-on-surface-variant">
        {connector.name.charAt(0)}
      </span>
    </div>
  );
}
