import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface PdfDropzoneProps {
  onPdfExtracted: (text: string, fileName: string) => void;
}

export const PdfDropzone: React.FC<PdfDropzoneProps> = ({ onPdfExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please select a valid PDF document.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds 15MB limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract text from PDF.');
      }

      onPdfExtracted(data.text, data.documentName);
    } catch (err: any) {
      setError(err.message || 'Error uploading and processing PDF.');
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-zinc-400 bg-zinc-900/60'
            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-xl bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : selectedFile ? (
              <FileText className="w-6 h-6 text-zinc-100" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-200">
              {uploading
                ? 'Extracting document text...'
                : selectedFile
                ? `Selected: ${selectedFile.name}`
                : 'Drop legal PDF here or click to browse'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Supports agreements, policies, and contracts up to 15MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
