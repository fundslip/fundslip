"use client";

import { useState, useCallback } from "react";
import { FileText, Loader2 } from "lucide-react";

interface PdfUploadProps { onFileSelected: (file: File) => void; }

function DocumentIllustration() {
  return (
    <div className="relative mb-6 animate-[float_4s_ease-in-out_infinite]">
      {/* Shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-2 bg-brand-navy/5 rounded-full blur-sm" />
      {/* Document */}
      <div className="relative w-16 h-20 bg-white rounded-lg border border-outline-variant shadow-sm">
        {/* Corner fold */}
        <div className="absolute top-0 right-0 w-4 h-4">
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[16px] border-l-surface border-b-[16px] border-b-transparent" />
          <div className="absolute top-0 right-0 w-4 h-px bg-outline-variant" />
          <div className="absolute top-0 right-0 h-4 w-px bg-outline-variant" />
        </div>
        {/* Lines */}
        <div className="flex flex-col gap-1.5 p-3 pt-5">
          <div className="h-[3px] rounded-full bg-brand-navy/15 w-full" />
          <div className="h-[3px] rounded-full bg-brand-navy/10 w-3/4" />
          <div className="h-[3px] rounded-full bg-brand-navy/10 w-5/6" />
          <div className="h-[3px] rounded-full bg-brand-navy/[0.06] w-2/3" />
        </div>
        {/* Arrow overlay */}
        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-brand-navy flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
            <path d="M6 2v6M3.5 5.5L6 8l2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function PdfUpload({ onFileSelected }: PdfUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name); setIsProcessing(true);
    onFileSelected(file);
    setTimeout(() => setIsProcessing(false), 500);
  }, [onFileSelected]);

  return (
    <section className="rounded-xl border border-outline-variant overflow-hidden flex flex-col h-full">
      <label
        className={`flex-grow flex flex-col items-center justify-center min-h-[340px] p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "bg-brand-navy/[0.04] border-2 border-dashed border-brand-navy/20 -m-px"
            : "bg-gradient-to-b from-surface/80 to-white hover:from-surface hover:to-surface/40"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        <input type="file" accept=".pdf,.html" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
        {isProcessing ? <Loader2 className="w-8 h-8 text-on-surface-variant animate-spin" />
          : fileName ? (
            <>
              <FileText className="w-10 h-10 text-brand-navy mb-3" />
              <p className="text-sm text-brand-navy font-medium">{fileName}</p>
              <p className="text-[11px] text-on-surface-variant mt-1">Click to replace</p>
            </>
          ) : (
            <>
              <DocumentIllustration />
              <p className="text-[14px] text-brand-black font-medium mb-1">Drop your statement here</p>
              <p className="text-[12px] text-on-surface-variant">or click to browse files</p>
            </>
          )}
      </label>
    </section>
  );
}
