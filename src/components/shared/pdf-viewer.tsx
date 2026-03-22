"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

interface PdfViewerProps {
  pdfBlob: Blob;
}

const RENDER_SCALE = 2;

export function PdfViewer({ pdfBlob }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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
          canvas.style.width = `${viewport.width / RENDER_SCALE}px`;
          canvas.style.height = `${viewport.height / RENDER_SCALE}px`;
          canvas.style.display = "block";
          if (i > 1) canvas.style.marginTop = "16px";

          const ctx = canvas.getContext("2d");
          if (ctx) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await page.render({ canvasContext: ctx, viewport } as any).promise;
          }
          containerRef.current?.appendChild(canvas);
        }
        setRendered(true);
      } catch (err) {
        console.error("PDF render error:", err);
        setError("Unable to render PDF preview.");
      } finally {
        renderingRef.current = false;
      }
    })();
  }, [pdfBlob]);

  const cssScale = zoom / 100;

  return (
    <div className="flex justify-center">
      {/* Relative wrapper — zoom controls position relative to this */}
      <div className="relative inline-block">
        {/* Scrollable PDF */}
        <div
          className="rounded-xl ring-1 ring-outline-variant/15 overflow-auto"
          style={{ maxHeight: "82vh" }}
        >
          {!rendered && !error && (
            <div className="flex items-center justify-center py-20 px-20 text-on-surface-variant text-sm">
              Rendering...
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center py-20 px-20 text-error text-sm">{error}</div>
          )}
          <div
            ref={containerRef}
            className="transition-transform duration-150"
            style={{ transform: `scale(${cssScale})`, transformOrigin: "top left" }}
          />
        </div>

        {/* Zoom — absolute to the preview card, bottom-right, stays put when scrolling */}
        {rendered && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-sm rounded-lg shadow-lg ring-1 ring-outline-variant/15 px-2.5 py-1.5">
            <button type="button" onClick={() => setZoom(z => Math.max(100, z - 25))} className="p-1 hover:bg-surface-container rounded transition-colors">
              <ZoomOut className="w-4 h-4 text-on-surface-variant" />
            </button>
            <span className="text-xs text-on-surface-variant font-mono w-9 text-center">{zoom}%</span>
            <button type="button" onClick={() => setZoom(z => Math.min(200, z + 25))} className="p-1 hover:bg-surface-container rounded transition-colors">
              <ZoomIn className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
