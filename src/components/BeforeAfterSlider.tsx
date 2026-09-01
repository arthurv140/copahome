"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface BeforeAfterSliderProps {
  originalSrc: string;
  afterSrc: string;
  altOriginal?: string;
  altAfter?: string;
}

export function BeforeAfterSlider({
  originalSrc,
  afterSrc,
  altOriginal = "Origineel",
  altAfter = "AI visualisatie",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPercent(Math.min(100, Math.max(0, ratio)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  };
  const stopDragging = () => setDragging(false);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-2xl border border-border bg-surface"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerLeave={stopDragging}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt={altAfter}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${percent}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={originalSrc}
          alt={altOriginal}
          className="h-full max-w-none object-cover"
          style={{ width: containerWidth || "100%" }}
          draggable={false}
        />
      </div>

      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
        Origineel
      </div>
      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
        AI visualisatie
      </div>

      <div className="absolute inset-y-0 flex w-0.5 -translate-x-1/2 bg-white/90" style={{ left: `${percent}%` }}>
        <div className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1b19" strokeWidth="2">
            <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
