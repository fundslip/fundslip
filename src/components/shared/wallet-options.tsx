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

// Known icons for connectors that don't provide their own via EIP-6963
const KNOWN_ICONS: Record<string, string> = {
  walletConnect:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 480'%3E%3Crect width='480' height='480' rx='120' fill='%233B99FC'/%3E%3Cpath d='M141.1 196.3c54.7-53.5 143.3-53.5 198 0l6.6 6.4a6.8 6.8 0 0 1 0 9.7l-22.5 22a3.5 3.5 0 0 1-4.9 0l-9-8.9a99.7 99.7 0 0 0-138.2 0l-9.7 9.5a3.5 3.5 0 0 1-4.9 0l-22.5-22a6.8 6.8 0 0 1 0-9.7l7.1-7Zm244.7 45.5 20 19.7a6.8 6.8 0 0 1 0 9.7l-90.3 88.3a7 7 0 0 1-9.9 0l-64.1-62.7a1.7 1.7 0 0 0-2.4 0l-64.1 62.7a7 7 0 0 1-9.9 0L75 271.2a6.8 6.8 0 0 1 0-9.7l20-19.7a7 7 0 0 1 9.9 0l64.1 62.7a1.7 1.7 0 0 0 2.4 0l64.1-62.7a7 7 0 0 1 9.9 0l64.1 62.7a1.7 1.7 0 0 0 2.4 0l64.1-62.7a7 7 0 0 1 9.8 0Z' fill='%23fff'/%3E%3C/svg%3E",
  coinbaseWalletSDK:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 480'%3E%3Crect width='480' height='480' rx='120' fill='%230052FF'/%3E%3Cpath d='M240 80c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S328.4 80 240 80Zm-40 200a16 16 0 0 1-16-16v-48a16 16 0 0 1 16-16h80a16 16 0 0 1 16 16v48a16 16 0 0 1-16 16h-80Z' fill='%23fff'/%3E%3C/svg%3E",
};

export function WalletOptions({ layout = "dropdown", onConnected }: WalletOptionsProps) {
  const { connect, connectors, isPending } = useConnect();
  const [wcQrDataUrl, setWcQrDataUrl] = useState<string | null>(null);
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const isCompact = layout === "dropdown";
  const isMobile = typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Split connectors into installed (EIP-6963 detected) vs other connection methods
  const { installed, others } = useMemo(() => {
    const installed: (typeof connectors)[number][] = [];
    const others: (typeof connectors)[number][] = [];
    const seenIds = new Set<string>();

    for (const c of connectors) {
      // Skip the generic "Injected" connector entirely — useless without a real wallet
      if (c.id === "injected") continue;
      if (seenIds.has(c.id)) continue;
      seenIds.add(c.id);

      // EIP-6963 discovered wallets have type "injected" and a real id (not "injected")
      if (c.type === "injected") {
        installed.push(c);
      } else {
        others.push(c);
      }
    }
    return { installed, others };
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
      {/* Installed wallets — shown first */}
      {installed.length > 0 && (
        <>
          <p className={`text-on-surface-variant uppercase tracking-wide ${isCompact ? "text-[10px] px-3 mb-1" : "text-[11px] mb-2"}`}>
            Installed
          </p>
          <div className={isCompact ? "space-y-0.5" : "space-y-2"}>
            {installed.map((connector) => (
              <WalletRow key={connector.uid} connector={connector} isCompact={isCompact}
                isPending={isPending} pendingId={pendingId} onSelect={handleSelect} />
            ))}
          </div>
          <div className={`border-t border-outline-variant ${isCompact ? "my-2" : "my-3"}`} />
        </>
      )}

      {/* Other connection methods */}
      {others.length > 0 && (
        <>
          <p className={`text-on-surface-variant uppercase tracking-wide ${isCompact ? "text-[10px] px-3 mb-1" : "text-[11px] mb-2"}`}>
            {installed.length > 0 ? "More options" : "Connect with"}
          </p>
          <div className={isCompact ? "space-y-0.5" : "space-y-2"}>
            {others.map((connector) => (
              <WalletRow key={connector.uid} connector={connector} isCompact={isCompact} isMobile={isMobile}
                isPending={isPending} pendingId={pendingId} onSelect={handleSelect} />
            ))}
          </div>
        </>
      )}

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

type AnyConnector = ReturnType<typeof useConnect>["connectors"][number];

function WalletRow({ connector, isCompact, isMobile, isPending, pendingId, onSelect }: {
  connector: AnyConnector;
  isCompact: boolean;
  isMobile?: boolean;
  isPending: boolean;
  pendingId: string | null;
  onSelect: (c: AnyConnector) => void;
}) {
  const icon = connector.icon || KNOWN_ICONS[connector.id];

  return (
    <button
      onClick={() => onSelect(connector)}
      disabled={isPending}
      className={`w-full flex items-center gap-3 rounded-lg transition-colors text-left disabled:opacity-50
        ${isCompact
          ? "px-3 py-2.5 hover:bg-surface text-[14px]"
          : "px-4 py-3.5 border border-outline-variant hover:bg-surface hover:border-outline text-[15px]"
        }`}
    >
      {icon ? (
        <img src={icon} alt="" className="w-7 h-7 rounded-lg flex-shrink-0" />
      ) : (
        <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-semibold text-on-surface-variant">
            {connector.name.charAt(0)}
          </span>
        </div>
      )}
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
  );
}
