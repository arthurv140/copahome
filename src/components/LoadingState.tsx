"use client";

import { useEffect, useState } from "react";

interface LoadingStateProps {
  messages: string[];
}

/**
 * Rotates through status messages on a timer. Deliberately does not show a
 * percentage — we don't have real progress data from the AI provider calls,
 * and a fake progress bar would be misleading (brief section 19).
 */
export function LoadingState({ messages }: LoadingStateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 2400);
    return () => clearInterval(interval);
    // Only the message count matters for the interval; `messages` is often a
    // fresh array literal from the caller, which would otherwise re-run this
    // every render.
  }, [messages.length]);

  const message = messages[index % messages.length] ?? messages[0];

  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-5 rounded-2xl border border-border bg-surface px-6 py-12 text-center text-surface-foreground sm:min-h-[360px]">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-2 w-2 rounded-full bg-accent"
            style={{
              animation: "copahome-pulse 1.2s ease-in-out infinite",
              animationDelay: `${dot * 0.15}s`,
            }}
          />
        ))}
      </div>
      <p className="font-display text-lg">{message}</p>
      <style>{`
        @keyframes copahome-pulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
