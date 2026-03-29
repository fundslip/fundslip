"use client";

import { useConnect } from "wagmi";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { copyToClipboard } from "@/lib/clipboard";

interface WalletOptionsProps {
  layout?: "dropdown" | "page";
  onConnected?: () => void;
}

const WALLET_ORDER = ["injected", "metaMask", "walletConnect", "coinbaseWallet"];

export function WalletOptions({ layout = "dropdown", onConnected }: WalletOptionsProps) {
  const { connect, connectors, isPending } = useConnect();
  const [wcQrDataUrl, setWcQrDataUrl] = useState<string | null>(null);
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isCompact = layout === "dropdown";
  const isMobile = typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Deduplicate connectors, prefer named over generic "Injected"
  const wallets = useMemo(() => {
    const seen = new Map<string, (typeof connectors)[number]>();
    for (const c of connectors) {
      // Skip generic injected if we already have a named browser wallet
      if (c.id === "injected" && seen.size > 0 && [...seen.values()].some(v => v.type === "injected")) continue;
      if (!seen.has(c.id)) seen.set(c.id, c);
    }
    return [...seen.values()].sort((a, b) => {
      const ai = WALLET_ORDER.indexOf(a.id);
      const bi = WALLET_ORDER.indexOf(b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
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
          }
        };
        provider.on("display_uri", onUri);

        connect({ connector }, {
          onSuccess: () => { provider.removeListener("display_uri", onUri); onConnected?.(); },
          onError: () => { provider.removeListener("display_uri", onUri); resetWc(); },
        });

        // On mobile, open deep link once URI is available
        if (isMobile) {
          provider.on("display_uri", (uri: string) => {
            window.location.href = uri;
          });
        }
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

  // Reset when connectors change (e.g. page nav)
  useEffect(() => { return () => resetWc(); }, [resetWc]);

  // ── WalletConnect QR View ──
  if (wcQrDataUrl || (wcUri && isMobile)) {
    return (
      <div className={isCompact ? "" : "flex flex-col items-center"}>
        <button onClick={resetWc}
          className="flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-brand-black transition-colors mb-3 self-start">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to wallets
        </button>

        {wcQrDataUrl && (
          <div className={`bg-white rounded-xl border border-outline-variant p-3 ${isCompact ? "" : "p-5"}`}>
            <img src={wcQrDataUrl} alt="Scan to connect" className={isCompact ? "w-[200px] h-[200px]" : "w-[260px] h-[260px]"} />
          </div>
        )}

        <p className={`text-on-surface-variant mt-3 ${isCompact ? "text-[12px]" : "text-[14px]"}`}>
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
    <div className={isCompact ? "space-y-1" : "space-y-2 w-full max-w-sm"}>
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
          {connector.icon ? (
            <img src={connector.icon} alt="" className="w-6 h-6 rounded-md" />
          ) : (
            <div className="w-6 h-6 rounded-md bg-brand-navy/10 flex items-center justify-center">
              <span className="text-[9px] font-semibold text-brand-navy">
                {connector.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-brand-black font-medium flex-1">{connector.name}</span>
          {pendingId === connector.uid && (
            <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin" />
          )}
          {connector.id === "walletConnect" && pendingId !== connector.uid && (
            <span className="text-[11px] text-on-surface-variant">QR</span>
          )}
        </button>
      ))}
    </div>
  );
}
