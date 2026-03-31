/**
 * Lightweight Umami analytics wrapper.
 * No-ops gracefully when Umami isn't loaded (local dev, ad blockers).
 */

type EventData = Record<string, string | number | boolean>;

function track(event: string, data?: EventData) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const umami = (window as any).umami;
    if (typeof umami?.track === "function") {
      umami.track(event, data);
    }
  } catch { /* silent — analytics should never break the app */ }
}

// ─── Wallet ───

export function trackWalletConnected(connector: string) {
  track("wallet-connected", { connector });
}

export function trackWalletDisconnected() {
  track("wallet-disconnected");
}

// ─── Generate Flow ───

export function trackGenerateStart(chain: string, period: string, type: string) {
  track("generate-start", { chain, period, type });
}

export function trackGenerateComplete(chain: string, period: string, type: string, tokenCount: number) {
  track("generate-complete", { chain, period, type, token_count: tokenCount });
}

export function trackGenerateFail(chain: string, error: string) {
  track("generate-fail", { chain, error: error.slice(0, 100) });
}

export function trackSignRejected(chain: string) {
  track("sign-rejected", { chain });
}

// ─── PDF & Sharing ───

export function trackDownloadPdf() {
  track("download-pdf");
}

export function trackCopyVerifyLink() {
  track("copy-verify-link");
}

export function trackCopyFingerprint() {
  track("copy-fingerprint");
}

export function trackEmailSent() {
  track("email-sent");
}

export function trackEmailFailed(error: string) {
  track("email-failed", { error: error.slice(0, 100) });
}

// ─── Verification ───

export function trackVerifyStart(method: "code" | "pdf" | "url") {
  track("verify-start", { method });
}

export function trackVerifyResult(valid: boolean) {
  track("verify-result", { valid });
}

// ─── Chain ───

export function trackChainSwitch(from: number, to: number) {
  track("chain-switch", { from: String(from), to: String(to) });
}
