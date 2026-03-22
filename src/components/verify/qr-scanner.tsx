"use client";

import { useState, useCallback } from "react";
import { Camera, X } from "lucide-react";

interface QrScannerProps {
  onScan: (hash: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerInstance, setScannerInstance] = useState<{ stop: () => Promise<void> } | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsActive(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader-element");
      setScannerInstance(scanner);

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Check if it's a valid Fundslip URL
          try {
            const url = new URL(decodedText);
            const hash = url.searchParams.get("hash");
            if (hash) {
              onScan(hash);
              scanner.stop().then(() => setIsActive(false));
              return;
            }
          } catch {
            // Not a URL
          }

          // Check if it's a raw hash
          if (decodedText.startsWith("0x") && decodedText.length >= 10) {
            onScan(decodedText);
            scanner.stop().then(() => setIsActive(false));
            return;
          }

          setError("This doesn't appear to be a Fundslip statement QR code.");
        },
        () => {} // ignore scan frame errors
      );
    } catch {
      setError("Unable to access camera. Please check permissions.");
      setIsActive(false);
    }
  }, [onScan]);

  const stopCamera = useCallback(async () => {
    if (scannerInstance) {
      await scannerInstance.stop();
      setScannerInstance(null);
    }
    setIsActive(false);
    setError(null);
  }, [scannerInstance]);

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden h-full">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="w-7 h-7 text-primary" />
        <h2 className="font-headline text-xl font-bold">Scan QR Code</h2>
      </div>
      <p className="text-on-surface-variant mb-6 text-sm">
        Point your camera at the QR code located at the bottom of the printed
        or digital Fundslip statement.
      </p>

      <div className="aspect-video min-h-[200px] bg-surface-container-high rounded-lg flex items-center justify-center relative overflow-hidden border-2 border-dashed border-outline-variant/30">
        {isActive ? (
          <>
            <div id="qr-reader-element" className="w-full h-full" />
            <button
              onClick={stopCamera}
              className="absolute top-2 right-2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-6">
            <Camera className="w-10 h-10 text-outline mb-3" />
            <button
              onClick={startCamera}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition-all"
            >
              Enable Camera Access
            </button>
          </div>
        )}

        {/* Corner Accents */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary/40 pointer-events-none" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary/40 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary/40 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary/40 pointer-events-none" />
      </div>

      {error && (
        <p className="mt-3 text-xs text-error font-medium">{error}</p>
      )}
    </section>
  );
}
