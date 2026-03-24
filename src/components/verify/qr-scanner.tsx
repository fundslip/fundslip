"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface QrScannerProps { onScan: (hash: string) => void; }

function Viewfinder() {
  return (
    <div className="relative w-40 h-40 mb-6">
      {[
        "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
        "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
        "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
        "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
      ].map((pos, i) => (
        <div key={i} className={`absolute w-8 h-8 border-brand-navy/25 ${pos}`} />
      ))}
      <div className="absolute inset-x-4 top-4 bottom-4 overflow-hidden">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-navy/30 to-transparent animate-[scanLine_2.5s_ease-in-out_infinite]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-brand-navy/20 animate-pulse" />
      </div>
    </div>
  );
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Use ref so stopCamera always has the current instance (no stale closure)
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);

  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* already stopped */ }
      scannerRef.current = null;
    }
    setIsActive(false);
    setError(null);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null); setIsActive(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader-element");
      scannerRef.current = scanner;
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          try { const url = new URL(decodedText); const p = url.searchParams.get("p"); if (p) { onScan(p); stopCamera(); return; } } catch { /* not a URL */ }
          if (decodedText.length > 80) { onScan(decodedText); stopCamera(); return; }
          setError("Not a Fundslip QR code.");
        }, () => {});
    } catch { setError("Camera access denied."); setIsActive(false); }
  }, [onScan, stopCamera]);

  // Stop camera on unmount (navigating away) or tab hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && scannerRef.current) stopCamera();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      // Unmount cleanup — stop camera if still running
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [stopCamera]);

  return (
    <section className="rounded-xl border border-outline-variant overflow-hidden flex flex-col h-full">
      <div
        onClick={!isActive ? startCamera : undefined}
        className={`w-full min-h-[340px] flex items-center justify-center relative overflow-hidden flex-1 bg-gradient-to-b from-surface/80 to-white ${!isActive ? "cursor-pointer hover:from-surface hover:to-surface/40 transition-all duration-200" : ""}`}
      >
        {isActive ? (
          <>
            <div id="qr-reader-element" className="absolute inset-0 w-full h-full [&_video]:!w-full [&_video]:!h-full [&_video]:object-cover" />
            <button onClick={(e) => { e.stopPropagation(); stopCamera(); }} className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm"><X className="w-4 h-4" /></button>
            {error && <p className="absolute bottom-3 left-3 right-3 z-20 text-[11px] text-white bg-error/80 backdrop-blur-sm rounded-lg px-3 py-2">{error}</p>}
          </>
        ) : (
          <div className="flex flex-col items-center pointer-events-none">
            <Viewfinder />
            <p className="text-[14px] text-brand-black font-medium mb-1">Tap to scan QR code</p>
            <p className="text-[12px] text-on-surface-variant">Opens your camera to read the statement</p>
          </div>
        )}
      </div>
    </section>
  );
}
