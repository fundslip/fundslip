"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";

interface PdfUploadProps {
  onFileSelected: (file: File) => void;
}

export function PdfUpload({ onFileSelected }: PdfUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setIsProcessing(true);
    onFileSelected(file);
    setTimeout(() => setIsProcessing(false), 500);
  }, [onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <section className="bg-surface-container-low rounded-xl p-8 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <Upload className="w-7 h-7 text-primary" />
        <h2 className="font-headline text-xl font-bold">Upload PDF</h2>
      </div>

      <label
        className={`flex-grow flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed rounded-lg p-6 text-center cursor-pointer group transition-colors duration-150 ${
          isDragOver ? "border-primary bg-primary/5" : "border-outline-variant hover:bg-surface-container"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input type="file" accept=".pdf,.html" onChange={handleChange} className="hidden" />
        {isProcessing ? (
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
        ) : fileName ? (
          <>
            <FileText className="w-10 h-10 text-primary mb-3" />
            <p className="text-sm font-medium text-primary">{fileName}</p>
          </>
        ) : (
          <>
            <Upload className={`w-10 h-10 mb-3 transition-colors ${isDragOver ? "text-primary" : "text-outline group-hover:text-primary"}`} />
            <p className="text-sm font-medium text-on-surface mb-1">Drag and drop file here</p>
            <p className="text-xs text-on-surface-variant">or click to browse documents</p>
          </>
        )}
      </label>

      <p className="mt-6 text-xs text-on-surface-variant leading-tight">
        We extract the embedded verification code from the PDF to confirm authenticity. Your data stays in your browser.
      </p>
    </section>
  );
}
