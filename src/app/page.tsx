import { CopahomeMark } from "@/components/CopahomeMark";
import { CTASection } from "@/components/CTASection";
import { Header } from "@/components/Header";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { Visualizer } from "@/components/Visualizer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-14 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-2xl space-y-5 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-accent">AI Curtain Visualizer</p>
          <h1 className="font-display text-4xl italic leading-tight sm:text-5xl">
            Zie hoe jouw interieur eruitziet met Copahome
          </h1>
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            Upload een foto van je ruimte en visualiseer transparante, semi-transparante of blackout
            gordijnen — in jouw eigen interieur, in enkele seconden.
          </p>
        </div>

        <Visualizer />

        <PrivacyNotice />
        <CTASection />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-10 sm:px-10">
          <CopahomeMark className="h-6 w-6 text-muted" />
          <div className="text-center text-[11px] uppercase tracking-[0.2em] text-muted">
            © {new Date().getFullYear()} Copahome — Raamdecoratie op maat
          </div>
        </div>
      </footer>
    </div>
  );
}
