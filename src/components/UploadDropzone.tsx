"use client";

import { useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFileSelected, disabled }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError("Please use a JPG, PNG or WebP file.");
      return;
    }
    setLocalError(null);
    onFileSelected(file);
  }

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`group relative flex min-h-[420px] w-full cursor-pointer flex-col items-center justify-center gap-6 rounded-[32px] border transition-all duration-500 ease-out sm:min-h-[520px] ${
          isDragging
            ? "border-accent/40 bg-accent/[0.04] shadow-[0_40px_80px_-40px_rgba(27,26,23,0.28)]"
            : "border-border bg-surface hover:border-foreground/15 hover:shadow-[0_40px_80px_-40px_rgba(27,26,23,0.18)]"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/[0.04] transition-transform duration-500 group-hover:scale-105">
          <UploadIcon />
        </div>
        <button
          type="button"
          tabIndex={-1}
          className="pointer-events-none rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-transform duration-300 group-hover:scale-[1.03]"
        >
          Upload your photo
        </button>
        <div className="space-y-1.5 text-center">
          <p className="text-sm text-muted">or drag and drop</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted/80">JPG · PNG · WebP</p>
        </div>
        {localError ? <p className="text-sm text-red-700">{localError}</p> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 16V4M12 4L7 9M12 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
