"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

interface PdfViewerProps { pdfBlob: Blob; }

const RENDER_SCALE = 2;

export function PdfViewer({ pdfBlob }: PdfViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderingRef = useRef(false);

  // Drag-to-pan
  const dragging = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0, sl: 0, st: 0 });

  // Render PDF pages as canvases
  useEffect(() => {
    if (!pdfBlob || !contentRef.current || renderingRef.current) return;
    renderingRef.current = true;
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const buf = await pdfBlob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
        if (!contentRef.current) return;
        contentRef.current.innerHTML = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale: RENDER_SCALE });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width;
          canvas.height = vp.height;
          // 100% = fill container width. Aspect ratio preserved via CSS.
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          if (i > 1) canvas.style.marginTop = "8px";
          const ctx = canvas.getContext("2d");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (ctx) await page.render({ canvasContext: ctx, viewport: vp } as any).promise;
          contentRef.current.appendChild(canvas);
        }
        setRendered(true);
      } catch (err) {
        console.error("PDF render error:", err);
        setError("Unable to render PDF preview.");
      } finally { renderingRef.current = false; }
    })();
  }, [pdfBlob]);

  // Zoom handler — just change the content div width as a percentage
  // 100% zoom = content width matches scroll container
  // 150% zoom = content is 1.5x the container width → scrollbars appear
  const zoomIn = useCallback(() => setZoom(z => Math.min(300, z + 25)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(100, z - 25)), []);

  // Drag-to-pan (only when zoomed in)
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (zoom <= 100) return;
    const el = scrollRef.current;
    if (!el) return;
    // Don't drag if clicking zoom controls
    if ((e.target as HTMLElement).closest("[data-zoom]")) return;
    dragging.current = true;
    dragOrigin.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
    el.style.cursor = "grabbing";
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [zoom]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = dragOrigin.current.sl - (e.clientX - dragOrigin.current.x);
    el.scrollTop = dragOrigin.current.st - (e.clientY - dragOrigin.current.y);
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = zoom > 100 ? "grab" : "";
  }, [zoom]);

  return (
    <div className="relative w-full">
      {/* Scrollable viewport */}
      <div
        ref={scrollRef}
        className="rounded-xl border border-outline-variant overflow-auto"
        style={{ maxHeight: "80vh", cursor: zoom > 100 ? "grab" : undefined }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {!rendered && !error && (
          <div className="flex items-center justify-center py-16 text-on-surface-variant text-sm">Rendering…</div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16 text-error text-sm">{error}</div>
        )}
        {/* Content wrapper — width as percentage of container controls zoom */}
        <div
          ref={contentRef}
          style={{ width: `${zoom}%`, userSelect: "none" }}
        />
      </div>

      {/* Zoom controls — always visible at bottom right */}
      {rendered && (
        <div data-zoom className="absolute bottom-3 right-3 z-10 flex items-center gap-0.5 bg-white/95 backdrop-blur-sm border border-outline-variant rounded-lg px-1.5 py-1 select-none">
          <button type="button" onClick={zoomOut} disabled={zoom <= 100}
            className="p-1 hover:bg-surface rounded transition-colors disabled:opacity-30">
            <ZoomOut className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
          <span className="text-[10px] text-on-surface-variant font-mono w-8 text-center">{zoom}%</span>
          <button type="button" onClick={zoomIn} disabled={zoom >= 300}
            className="p-1 hover:bg-surface rounded transition-colors disabled:opacity-30">
            <ZoomIn className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
        </div>
      )}
    </div>
  );
}
