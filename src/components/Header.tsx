import { CopahomeMark } from "./CopahomeMark";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-3">
          <CopahomeMark className="h-7 w-7 text-foreground" />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-light tracking-[0.32em]">COPAHOME</span>
            <span className="mt-1.5 hidden text-[10px] font-medium uppercase tracking-[0.25em] text-muted sm:inline">
              AI Curtain Visualizer
            </span>
          </div>
        </div>
        <a
          href="#advies"
          className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:text-accent"
        >
          Vraag advies
        </a>
      </div>
    </header>
  );
}
