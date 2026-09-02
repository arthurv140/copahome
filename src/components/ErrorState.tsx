interface ErrorStateProps {
  message: string;
  tips?: string[];
  onRetry: () => void;
  retryLabel?: string;
}

export function ErrorState({ message, tips, onRetry, retryLabel = "Try again" }: ErrorStateProps) {
  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-5 rounded-[28px] bg-surface px-6 py-16 text-center shadow-[0_30px_60px_-40px_rgba(27,26,23,0.18)] sm:min-h-[520px]">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        className="mt-2 rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        {retryLabel}
      </button>
    </div>
  );
}
