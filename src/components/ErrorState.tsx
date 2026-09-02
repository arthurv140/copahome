interface ErrorStateProps {
  message: string;
  tips?: string[];
  onRetry: () => void;
  retryLabel?: string;
}

export function ErrorState({ message, tips, onRetry, retryLabel = "Probeer opnieuw" }: ErrorStateProps) {
  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface px-6 py-12 text-center text-surface-foreground sm:min-h-[360px]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 9v4M12 16.5h.01" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <p className="max-w-md text-base leading-relaxed">{message}</p>
      {tips && tips.length > 0 ? (
        <ul className="space-y-1 text-left text-sm text-muted">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-1.5">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
              {tip}
            </li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-full bg-surface-foreground px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-surface transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {retryLabel}
      </button>
    </div>
  );
}
