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
  altOriginal = "Original",
  altAfter = "Copahome",
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
      className="animate-scale-in relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-[28px] bg-surface shadow-[0_40px_80px_-40px_rgba(27,26,23,0.28)]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerLeave={stopDragging}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterSrc} alt={altAfter} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
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

      <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-foreground backdrop-blur-md">
        {altOriginal}
      </div>
      <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-foreground backdrop-blur-md">
        {altAfter}
      </div>

      <div className="absolute inset-y-0 flex w-px -translate-x-1/2 bg-white" style={{ left: `${percent}%` }}>
        <div className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_-8px_rgba(27,26,23,0.4)]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1b1a17" strokeWidth="2">
            <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
