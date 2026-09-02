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
      setLocalError("Gebruik een JPG, PNG of WebP-bestand.");
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
        className={`flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-12 text-center text-surface-foreground transition-colors sm:min-h-[360px] ${
          isDragging ? "border-accent bg-accent/5" : "border-border bg-surface hover:border-accent/60"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-foreground/5">
          <UploadIcon />
        </div>
        <div className="space-y-1.5">
          <p className="font-display text-xl">Upload een foto van je interieur</p>
          <p className="text-sm text-muted">of sleep een foto hierheen</p>
        </div>
        <p className="text-xs uppercase tracking-[0.15em] text-muted">JPG · JPEG · PNG · WebP</p>
        {localError ? <p className="text-sm text-red-700">{localError}</p> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        capture="environment"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 16V4M12 4L7 9M12 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
