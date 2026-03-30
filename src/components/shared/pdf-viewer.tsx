"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, Loader2, ChevronUp, ChevronDown } from "lucide-react";

interface PdfViewerProps { pdfBlob: Blob; }

const RENDER_SCALE = 2; // 2x for crisp rendering on retina

export function PdfViewer({ pdfBlob }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderingRef = useRef(false);
  const pageRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!pdfBlob || !containerRef.current || renderingRef.current) return;
    renderingRef.current = true;

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const buf = await pdfBlob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
        setPageCount(pdf.numPages);

        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";
        pageRefs.current = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: RENDER_SCALE });

          // Page wrapper — positions canvas and text layer
          const pageDiv = document.createElement("div");
          pageDiv.className = "pdf-page";
          pageDiv.style.position = "relative";
          pageDiv.style.width = "100%";
          pageDiv.style.aspectRatio = `${viewport.width} / ${viewport.height}`;
          if (i > 1) pageDiv.style.marginTop = "8px";
          pageDiv.dataset.page = String(i);

          // Canvas layer — the visual rendering
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          canvas.style.display = "block";
          const ctx = canvas.getContext("2d");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (ctx) await page.render({ canvasContext: ctx, viewport } as any).promise;
          pageDiv.appendChild(canvas);

          // Text layer — transparent, selectable text on top of canvas
          const textDiv = document.createElement("div");
          textDiv.className = "pdf-text-layer";
          try {
            const textContent = await page.getTextContent();
            const { TextLayer } = await import("pdfjs-dist");
            const textLayer = new TextLayer({
              textContentSource: textContent,
              container: textDiv,
              viewport,
            });
            await textLayer.render();
          } catch {
            // Text layer is best-effort — viewer still works without it
          }
          pageDiv.appendChild(textDiv);

          containerRef.current.appendChild(pageDiv);
          pageRefs.current.push(pageDiv);
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

  // Track current page on scroll
  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el || !rendered) return;
    const onScroll = () => {
      const scrollTop = el.scrollTop;
      for (let i = pageRefs.current.length - 1; i >= 0; i--) {
        if (pageRefs.current[i].offsetTop <= scrollTop + 100) {
          setCurrentPage(i + 1);
          break;
        }
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [rendered]);

  const zoomIn = useCallback(() => setZoom(z => Math.min(250, z + 25)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(75, z - 25)), []);

  const scrollToPage = useCallback((page: number) => {
    const target = pageRefs.current[page - 1];
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="relative w-full">
      <div
        className="rounded-xl border border-outline-variant overflow-auto bg-surface/50"
        style={{ maxHeight: "80vh" }}
      >
        {!rendered && !error && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" />
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-20 text-error text-sm">{error}</div>
        )}

        <div
          ref={containerRef}
          className="pdf-container mx-auto"
          style={{ width: `${zoom}%`, transition: "width 0.15s ease" }}
        />
      </div>

      {/* Controls — minimal, themed */}
      {rendered && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-outline-variant rounded-xl px-2 py-1.5 shadow-sm select-none">
          {pageCount > 1 && (
            <>
              <button type="button" onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="p-1 hover:bg-surface rounded-lg transition-colors disabled:opacity-30">
                <ChevronUp className="w-3.5 h-3.5 text-on-surface-variant" />
              </button>
              <span className="text-[10px] text-on-surface-variant font-mono px-1">
                {currentPage}/{pageCount}
              </span>
              <button type="button" onClick={() => scrollToPage(Math.min(pageCount, currentPage + 1))}
                disabled={currentPage >= pageCount}
                className="p-1 hover:bg-surface rounded-lg transition-colors disabled:opacity-30">
                <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
              </button>
              <div className="w-px h-4 bg-outline-variant mx-0.5" />
            </>
          )}
          <button type="button" onClick={zoomOut} disabled={zoom <= 75}
            className="p-1 hover:bg-surface rounded-lg transition-colors disabled:opacity-30">
            <ZoomOut className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
          <span className="text-[10px] text-on-surface-variant font-mono w-8 text-center">{zoom}%</span>
          <button type="button" onClick={zoomIn} disabled={zoom >= 250}
            className="p-1 hover:bg-surface rounded-lg transition-colors disabled:opacity-30">
            <ZoomIn className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
        </div>
      )}
    </div>
  );
}
