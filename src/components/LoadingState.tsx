"use client";

import { useEffect, useState } from "react";

function useRotatingMessage(messages: string[], intervalMs = 2200): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => setIndex((i) => (i + 1) % messages.length), intervalMs);
    return () => clearInterval(interval);
    // Only the message count matters for the interval; `messages` is often a
    // fresh array literal from the caller, which would otherwise re-run this
    // every render.
  }, [messages.length, intervalMs]);

  return messages[index % messages.length] ?? messages[0];
}

interface LoadingStateProps {
  messages: string[];
}

/** Full-size loading block, shown in place of the result panel while a visualisation is generating. */
export function LoadingState({ messages }: LoadingStateProps) {
  const message = useRotatingMessage(messages);
  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-7 sm:min-h-[520px]">
      <Spinner className="h-11 w-11" />
      <p key={message} className="animate-fade-in text-lg font-medium tracking-tight sm:text-xl">
        {message}
      </p>
    </div>
  );
}

/** Compact inline variant shown underneath the uploaded photo while it's being analysed. */
export function InlineLoadingState({ messages }: LoadingStateProps) {
  const message = useRotatingMessage(messages);
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <Spinner className="h-4 w-4" />
      <p key={message} className="animate-fade-in text-sm font-medium text-muted">
        {message}
      </p>
    </div>
  );
}

function Spinner({ className }: { className: string }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute inset-0 rounded-full border border-foreground/15" />
      <span className="absolute inset-0 animate-spin rounded-full border-t border-foreground/70 [animation-duration:1.2s]" />
    </div>
  );
}
