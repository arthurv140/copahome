import { CopahomeMark } from "@/components/CopahomeMark";
import { Header } from "@/components/Header";
import { Visualizer } from "@/components/Visualizer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-10 sm:py-16">
        <Visualizer />
      </main>

      <footer className="mt-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-12 sm:px-10">
          <CopahomeMark className="h-5 w-5 text-muted" />
          <div className="text-center text-[11px] uppercase tracking-[0.18em] text-muted">
            © {new Date().getFullYear()} Copahome — Decorate your sunlight
          </div>
        </div>
      </footer>
    </div>
  );
}
