"use client";

import { useState, useCallback } from "react";
import { Camera, X } from "lucide-react";

interface QrScannerProps { onScan: (hash: string) => void; }

export function QrScanner({ onScan }: QrScannerProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanner, setScanner] = useState<{ stop: () => Promise<void> } | null>(null);

  const startCamera = useCallback(async () => {
    setError(null); setIsActive(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const s = new Html5Qrcode("qr-reader-el");
      setScanner(s);
      await s.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          try { const url = new URL(text); const h = url.searchParams.get("p"); if (h) { onScan(h); s.stop().then(() => setIsActive(false)); return; } } catch { /* */ }
          if (text.length > 80) { onScan(text); s.stop().then(() => setIsActive(false)); return; }
          setError("Not a Fundslip QR code.");
        }, () => {});
    } catch { setError("Unable to access camera."); setIsActive(false); }
  }, [onScan]);

  return (
    <section className="bg-white rounded-xl p-7 h-full">
      <div className="flex items-center gap-3 mb-5">
        <Camera className="w-5 h-5 text-navy" strokeWidth={1.5} />
        <h2 className="font-headline text-lg font-bold text-gray-900">Scan QR Code</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">Point your camera at the QR code on the Fundslip statement.</p>
      <div className="aspect-video min-h-[200px] bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden">
        {isActive ? (
          <>
            <div id="qr-reader-el" className="w-full h-full" />
            <button type="button" onClick={async () => { await scanner?.stop(); setIsActive(false); }}
              className="absolute top-2 right-2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Camera className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
            <button type="button" onClick={startCamera} className="bg-navy text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-navy-light transition-colors">
              Enable Camera
            </button>
          </div>
        )}
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-gray-300 pointer-events-none rounded-tl" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-gray-300 pointer-events-none rounded-tr" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-gray-300 pointer-events-none rounded-bl" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-gray-300 pointer-events-none rounded-br" />
      </div>
      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
    </section>
  );
}
