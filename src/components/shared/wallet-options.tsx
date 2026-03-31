"use client";

import { useConnect } from "wagmi";
import { walletConnect, coinbaseWallet } from "wagmi/connectors";
import { useState, useEffect, useMemo, useCallback, useRef, useSyncExternalStore } from "react";
import { ArrowLeft, Loader2, Copy, Check, Smartphone, HelpCircle } from "lucide-react";
import QRCode from "qrcode";
import { copyToClipboard } from "@/lib/clipboard";
import { trackWalletConnected } from "@/lib/analytics";

interface WalletOptionsProps {
  layout?: "dropdown" | "page";
  onConnected?: () => void;
}

/* eslint-disable @next/next/no-img-element */

const KNOWN_ICONS: Record<string, string> = {
  walletConnect:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 480'%3E%3Crect width='480' height='480' rx='120' fill='%233B99FC'/%3E%3Cpath d='M141.1 196.3c54.7-53.5 143.3-53.5 198 0l6.6 6.4a6.8 6.8 0 0 1 0 9.7l-22.5 22a3.5 3.5 0 0 1-4.9 0l-9-8.9a99.7 99.7 0 0 0-138.2 0l-9.7 9.5a3.5 3.5 0 0 1-4.9 0l-22.5-22a6.8 6.8 0 0 1 0-9.7l7.1-7Zm244.7 45.5 20 19.7a6.8 6.8 0 0 1 0 9.7l-90.3 88.3a7 7 0 0 1-9.9 0l-64.1-62.7a1.7 1.7 0 0 0-2.4 0l-64.1 62.7a7 7 0 0 1-9.9 0L75 271.2a6.8 6.8 0 0 1 0-9.7l20-19.7a7 7 0 0 1 9.9 0l64.1 62.7a1.7 1.7 0 0 0 2.4 0l64.1-62.7a7 7 0 0 1 9.9 0l64.1 62.7a1.7 1.7 0 0 0 2.4 0l64.1-62.7a7 7 0 0 1 9.8 0Z' fill='%23fff'/%3E%3C/svg%3E",
  coinbaseWalletSDK:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 480'%3E%3Crect width='480' height='480' rx='120' fill='%230052FF'/%3E%3Cpath d='M240 80c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S328.4 80 240 80Zm-40 200a16 16 0 0 1-16-16v-48a16 16 0 0 1 16-16h80a16 16 0 0 1 16 16v48a16 16 0 0 1-16 16h-80Z' fill='%23fff'/%3E%3C/svg%3E",
};

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

// These are created lazily — their heavy SDKs only load when the user clicks them
function createWcConnector() {
  return walletConnect({ projectId, showQrModal: false });
}
function createCbConnector() {
  return coinbaseWallet({ appName: "Fundslip", preference: { options: "all", telemetry: false } });
}

// Static entries for WalletConnect + Coinbase so they always appear in the list
// without importing their SDKs
const EXTRA_WALLETS = [
  { id: "walletConnect", name: "WalletConnect", create: createWcConnector },
  { id: "coinbaseWalletSDK", name: "Coinbase Wallet", create: createCbConnector },
] as const;

export function WalletOptions({ layout = "dropdown", onConnected }: WalletOptionsProps) {
  const { connect, connectAsync, connectors } = useConnect();
  const [wcQrDataUrl, setWcQrDataUrl] = useState<string | null>(null);
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [wcLoading, setWcLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const wcCleanupRef = useRef<(() => void) | null>(null);

  // Defer connector list rendering until client to avoid hydration mismatch
  // (EIP-6963 discovers wallets on client only, changing the list)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const isCompact = layout === "dropdown";

  // Injected wallets from wagmi (MetaMask, Rabby, etc. via EIP-6963)
  const installed = useMemo(() => {
    const list: (typeof connectors)[number][] = [];
    const seenIds = new Set<string>();
    for (const c of connectors) {
      if (c.id === "injected") continue;
      if (seenIds.has(c.id)) continue;
      seenIds.add(c.id);
      if (c.type === "injected") list.push(c);
    }
    return list;
  }, [connectors]);

  const resetWc = useCallback(() => {
    wcCleanupRef.current?.();
    wcCleanupRef.current = null;
    setWcQrDataUrl(null);
    setWcUri(null);
    setWcLoading(false);
    setPendingId(null);
    setCopied(false);
  }, []);

  const handleSelectInjected = useCallback((connector: (typeof connectors)[number]) => {
    setPendingId(connector.uid);
    connect({ connector }, {
      onSuccess: () => { setPendingId(null); trackWalletConnected(connector.name); onConnected?.(); },
      onError: () => setPendingId(null),
    });
  }, [connect, onConnected]);

  const handleSelectWc = useCallback(async () => {
    setPendingId("walletConnect");
    setWcLoading(true);
    try {
      const connector = createWcConnector();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = await (connector as any).getProvider();

      const onUri = async (uri: string) => {
        setWcUri(uri);
        setWcLoading(false);
        const dataUrl = await QRCode.toDataURL(uri, {
          width: isCompact ? 220 : 280,
          margin: 2,
          color: { dark: "#1d1d1f", light: "#ffffff" },
        });
        setWcQrDataUrl(dataUrl);
      };

      provider.on("display_uri", onUri);
      wcCleanupRef.current = () => provider.removeListener("display_uri", onUri);

      connectAsync({ connector }).then(() => {
        resetWc();
        trackWalletConnected("WalletConnect");
        onConnected?.();
      }).catch(() => {
        resetWc();
      });
    } catch {
      resetWc();
    }
  }, [connectAsync, isCompact, onConnected, resetWc]);

  const handleSelectCoinbase = useCallback(() => {
    setPendingId("coinbaseWalletSDK");
    const connector = createCbConnector();
    connect({ connector }, {
      onSuccess: () => { setPendingId(null); trackWalletConnected("Coinbase Wallet"); onConnected?.(); },
      onError: () => setPendingId(null),
    });
  }, [connect, onConnected]);

  useEffect(() => { return () => resetWc(); }, [resetWc]);

  const isBusy = pendingId !== null;

  // ── WalletConnect Loading / QR View ──
  if (wcLoading || wcQrDataUrl) {
    return (
      <div className="flex flex-col items-center py-2">
        <button onClick={resetWc}
          className="flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-brand-black transition-colors mb-4 self-start px-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {wcQrDataUrl ? (
          <>
            <div className="rounded-2xl border border-outline-variant/80 p-4 bg-surface/50">
              <img src={wcQrDataUrl} alt="Scan to connect"
                className={isCompact ? "w-[220px] h-[220px]" : "w-[280px] h-[280px]"} />
            </div>
            <p className={`text-on-surface-variant mt-4 text-center ${isCompact ? "text-[12px]" : "text-[14px]"}`}>
              Scan with your mobile wallet
            </p>
            <div className="flex items-center gap-4 mt-3 mb-1">
              {wcUri && (
                <>
                  <button onClick={async () => {
                    const ok = await copyToClipboard(wcUri);
                    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
                  }}
                    className="flex items-center gap-1.5 text-[12px] text-on-surface-variant hover:text-brand-black transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  <a href={wcUri}
                    className="flex items-center gap-1.5 text-[12px] text-brand-navy hover:text-brand-navy/80 transition-colors">
                    <Smartphone className="w-3.5 h-3.5" /> Open in app
                  </a>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin mb-3" />
            <p className="text-on-surface-variant text-[13px]">Preparing connection...</p>
          </div>
        )}
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className={`flex justify-center ${isCompact ? "py-6" : "py-10"}`}>
        <Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" />
      </div>
    );
  }

  return (
    <div className={isCompact ? "" : "w-full max-w-sm"}>
      <div className={isCompact ? "space-y-0.5" : "space-y-2"}>
        {/* Injected wallets (MetaMask, Rabby, etc.) */}
        {installed.map((connector) => (
          <WalletRow key={connector.uid} id={connector.id} name={connector.name}
            icon={connector.icon} isCompact={isCompact}
            isBusy={isBusy} isPending={pendingId === connector.uid}
            onSelect={() => handleSelectInjected(connector)} />
        ))}

        {installed.length > 0 && (
          <div className={`border-t border-outline-variant ${isCompact ? "my-1.5" : "my-2"}`} />
        )}

        {/* WalletConnect + Coinbase — lazy, no SDK loaded until clicked */}
        {EXTRA_WALLETS.map((w) => (
          <WalletRow key={w.id} id={w.id} name={w.name}
            icon={KNOWN_ICONS[w.id]} isCompact={isCompact}
            isBusy={isBusy} isPending={pendingId === w.id}
            onSelect={w.id === "walletConnect" ? handleSelectWc : handleSelectCoinbase} />
        ))}
      </div>

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

function WalletRow({ id, name, icon, isCompact, isBusy, isPending, onSelect }: {
  id: string;
  name: string;
  icon?: string;
  isCompact: boolean;
  isBusy: boolean;
  isPending: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={isBusy}
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
            {name.charAt(0)}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-brand-black font-medium">{name}</span>
        {id === "walletConnect" && (
          <span className={`block text-on-surface-variant ${isCompact ? "text-[11px]" : "text-[12px]"}`}>
            Scan QR code
          </span>
        )}
      </div>
      {isPending ? (
        <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin flex-shrink-0" />
      ) : id === "walletConnect" ? (
        <Smartphone className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
      ) : null}
    </button>
  );
}
