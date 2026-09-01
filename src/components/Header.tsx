export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-xl tracking-wide">COPAHOME</span>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted sm:inline">
            AI Curtain Visualizer
          </span>
        </div>
        <a
          href="#advies"
          className="text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
        >
          Vraag advies
        </a>
      </div>
    </header>
  );
}
