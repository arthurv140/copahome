import { CopahomeMark } from "./CopahomeMark";

export function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7 sm:px-10">
        <div className="flex items-center gap-3">
          <CopahomeMark className="h-6 w-6 text-foreground" />
          <div className="flex items-baseline gap-2.5">
            <span className="text-[15px] font-medium tracking-[0.28em]">COPAHOME</span>
            <span className="hidden text-[11px] font-normal tracking-[0.12em] text-muted sm:inline">
              AI Visualizer
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-6 text-[13px] text-muted">
          <a href="#" className="hidden transition-colors hover:text-foreground sm:inline">
            Collections
          </a>
          <a href="#advies" className="transition-colors hover:text-foreground">
            Request advice
          </a>
        </nav>
      </div>
    </header>
  );
}
