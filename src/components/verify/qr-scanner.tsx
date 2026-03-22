"use client";

import { useState, useCallback } from "react";
import { Camera, X } from "lucide-react";

interface QrScannerProps { onScan: (hash: string) => void; }

export function QrScanner({ onScan }: QrScannerProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerInstance, setScannerInstance] = useState<{ stop: () => Promise<void> } | null>(null);

  const startCamera = useCallback(async () => {
    setError(null); setIsActive(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader-element");
      setScannerInstance(scanner);
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          try { const url = new URL(decodedText); const hash = url.searchParams.get("hash"); if (hash) { onScan(hash); scanner.stop().then(() => setIsActive(false)); return; } } catch { /* */ }
          if (decodedText.startsWith("0x") && decodedText.length >= 10) { onScan(decodedText); scanner.stop().then(() => setIsActive(false)); return; }
          setError("Not a Fundslip QR code.");
        }, () => {});
    } catch { setError("Camera access denied."); setIsActive(false); }
  }, [onScan]);

  const stopCamera = useCallback(async () => {
    if (scannerInstance) { await scannerInstance.stop(); setScannerInstance(null); }
    setIsActive(false); setError(null);
  }, [scannerInstance]);

  return (
    <section className="rounded-xl border border-outline-variant p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-4 h-4 text-on-surface-variant" />
        <h2 className="font-headline text-base font-medium text-brand-black">Scan QR Code</h2>
      </div>
      <p className="text-on-surface-variant mb-4 text-sm">Point your camera at the QR code on the statement.</p>
      <div className="aspect-video min-h-[180px] bg-surface rounded-lg flex items-center justify-center relative overflow-hidden">
        {isActive ? (
          <>
            <div id="qr-reader-element" className="w-full h-full" />
            <button onClick={stopCamera} className="absolute top-2 right-2 z-20 bg-white rounded-full p-1.5"><X className="w-4 h-4" /></button>
          </>
        ) : (
          <div className="text-center">
            <Camera className="w-8 h-8 text-outline mx-auto mb-3" />
            <button onClick={startCamera} className="bg-brand-navy text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-navy/90 transition-colors">
              Enable Camera
            </button>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </section>
  );
}
