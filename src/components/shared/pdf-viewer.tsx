"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

interface PdfViewerProps { pdfBlob: Blob; }

/**
 * PDF viewer using the browser's native PDF renderer via iframe.
 * Instant rendering, selectable text, native zoom/search/print.
 */
export function PdfViewer({ pdfBlob }: PdfViewerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const blobUrl = URL.createObjectURL(pdfBlob);
    setUrl(blobUrl);
    return () => URL.revokeObjectURL(blobUrl);
  }, [pdfBlob]);

  if (!url) {
    return (
      <div className="rounded-xl border border-outline-variant flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Native PDF viewer — instant rendering, text selection, zoom, search, print */}
      <div className="rounded-xl border border-outline-variant overflow-hidden bg-surface">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white rounded-xl">
            <Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" />
          </div>
        )}
        <iframe
          src={`${url}#toolbar=1&view=FitH`}
          title="Statement PDF"
          className="w-full border-0"
          style={{ height: "80vh", minHeight: 500 }}
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Fallback for mobile browsers that don't support inline PDF */}
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 text-[13px] text-on-surface-variant hover:text-brand-black transition-colors md:hidden">
        <ExternalLink className="w-3.5 h-3.5" /> Open PDF in new tab
      </a>
    </div>
  );
}
