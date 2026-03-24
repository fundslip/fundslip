"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";

interface PdfUploadProps { onFileSelected: (file: File) => void; }

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
    <section className="rounded-xl border border-outline-variant p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-4 h-4 text-on-surface-variant" />
        <h2 className="font-headline text-base font-medium text-brand-black">Upload PDF</h2>
      </div>
      <label
        className={`flex-grow flex flex-col items-center justify-center min-h-[340px] border border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragOver ? "border-brand-navy bg-brand-navy/[0.02]" : "border-outline hover:border-outline/80"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        <input type="file" accept=".pdf,.html" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
        {isProcessing ? <Loader2 className="w-8 h-8 text-on-surface-variant animate-spin" />
          : fileName ? <><FileText className="w-8 h-8 text-brand-navy mb-2" /><p className="text-sm text-brand-navy">{fileName}</p></>
          : <><Upload className="w-8 h-8 text-outline mb-2" /><p className="text-sm text-brand-black">Drop file here</p><p className="text-xs text-on-surface-variant">or click to browse</p></>}
      </label>
      <p className="mt-4 text-[11px] text-on-surface-variant">We extract the verification code from the PDF. Your data stays local.</p>
    </section>
  );
}
