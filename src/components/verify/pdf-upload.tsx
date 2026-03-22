"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";

interface PdfUploadProps { onFileSelected: (file: File) => void; }

export function PdfUpload({ onFileSelected }: PdfUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name); setProcessing(true);
    onFileSelected(file);
    setTimeout(() => setProcessing(false), 500);
  }, [onFileSelected]);

  return (
    <section className="bg-gray-50 rounded-xl p-7 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-5">
        <Upload className="w-5 h-5 text-navy" strokeWidth={1.5} />
        <h2 className="font-headline text-lg font-bold text-gray-900">Upload PDF</h2>
      </div>
      <label
        className={`flex-grow flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-150 ${
          isDragOver ? "border-navy bg-[#f8faff]" : "border-gray-300 hover:border-gray-400 hover:bg-gray-100/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        <input type="file" accept=".pdf,.html" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
        {processing ? <Loader2 className="w-8 h-8 text-navy animate-spin" />
        : fileName ? <><FileText className="w-8 h-8 text-navy mb-2" strokeWidth={1.5} /><p className="text-sm font-medium text-navy">{fileName}</p></>
        : <><Upload className={`w-8 h-8 mb-2 ${isDragOver ? "text-navy" : "text-gray-300"}`} strokeWidth={1.5} />
          <p className="text-sm font-medium text-gray-700">Drag and drop file here</p>
          <p className="text-xs text-gray-400 mt-1">or click to browse</p></>}
      </label>
      <p className="mt-4 text-xs text-gray-400 leading-relaxed">
        We extract the verification data embedded in the PDF. Your file stays in your browser.
      </p>
    </section>
  );
}
