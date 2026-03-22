"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

interface PdfViewerProps { pdfBlob: Blob; }

const RENDER_SCALE = 2;

export function PdfViewer({ pdfBlob }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderingRef = useRef(false);

  useEffect(() => {
    if (!pdfBlob || !containerRef.current || renderingRef.current) return;
    renderingRef.current = true;
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: RENDER_SCALE });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          // On mobile, make canvas fill the container width
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          if (i > 1) canvas.style.marginTop = "8px";
          const ctx = canvas.getContext("2d");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (ctx) await page.render({ canvasContext: ctx, viewport } as any).promise;
          containerRef.current?.appendChild(canvas);
        }
        setRendered(true);
      } catch (err) {
        console.error("PDF render error:", err);
        setError("Unable to render PDF preview.");
      } finally { renderingRef.current = false; }
    })();
  }, [pdfBlob]);

  const cssScale = zoom / 100;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="rounded-xl border border-outline-variant overflow-auto" style={{ maxHeight: "80vh" }}>
        {!rendered && !error && <div className="flex items-center justify-center py-16 text-on-surface-variant text-sm">Rendering…</div>}
        {error && <div className="flex items-center justify-center py-16 text-error text-sm">{error}</div>}
        <div
          ref={containerRef}
          className="transition-transform duration-150"
          style={{ transform: `scale(${cssScale})`, transformOrigin: "top left", width: cssScale !== 1 ? `${100 / cssScale}%` : "100%" }}
        />
      </div>
      {rendered && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-outline-variant rounded-lg px-2 py-1">
          <button type="button" onClick={() => setZoom(z => Math.max(100, z - 25))} className="p-1 hover:bg-surface rounded transition-colors">
            <ZoomOut className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
          <span className="text-[10px] text-on-surface-variant font-mono w-8 text-center">{zoom}%</span>
          <button type="button" onClick={() => setZoom(z => Math.min(200, z + 25))} className="p-1 hover:bg-surface rounded transition-colors">
            <ZoomIn className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
        </div>
      )}
    </div>
  );
}
