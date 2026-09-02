import type { TreatmentTypeId } from "@/types/product";
import type { TreatmentCopy } from "@/lib/treatments";

const SWATCH: Record<
  TreatmentTypeId,
  { overlayOpacity: number; overlayColor: string; lineOpacity: number; pattern: "vertical" | "horizontal"; spacingPx: number }
> = {
  transparent: { overlayOpacity: 0.12, overlayColor: "#ffffff", lineOpacity: 0.06, pattern: "vertical", spacingPx: 18 },
  semi_transparent: { overlayOpacity: 0.55, overlayColor: "#cbb79a", lineOpacity: 0.12, pattern: "vertical", spacingPx: 18 },
  dim_out: { overlayOpacity: 0.78, overlayColor: "#5c5d4a", lineOpacity: 0.18, pattern: "vertical", spacingPx: 18 },
  blackout: { overlayOpacity: 0.94, overlayColor: "#2a2724", lineOpacity: 0.22, pattern: "vertical", spacingPx: 18 },
  wooden_blind_35mm: { overlayOpacity: 0.88, overlayColor: "#ab7a4c", lineOpacity: 0.4, pattern: "horizontal", spacingPx: 8 },
  wooden_blind_50mm: { overlayOpacity: 0.88, overlayColor: "#9c6a3f", lineOpacity: 0.4, pattern: "horizontal", spacingPx: 12 },
  wooden_blind_63mm: { overlayOpacity: 0.88, overlayColor: "#8a5a34", lineOpacity: 0.4, pattern: "horizontal", spacingPx: 16 },
};

interface TreatmentTypeCardProps {
  copy: TreatmentCopy;
  selected: boolean;
  onSelect: (id: TreatmentTypeId) => void;
}

export function TreatmentTypeCard({ copy, selected, onSelect }: TreatmentTypeCardProps) {
  const swatch = SWATCH[copy.id];
  const stripeDirection = swatch.pattern === "vertical" ? "90deg" : "0deg";

  return (
    <button
      type="button"
      onClick={() => onSelect(copy.id)}
      aria-pressed={selected}
      className={`group flex flex-col items-start gap-3 rounded-3xl p-3 text-left transition-all duration-300 ease-out ${
        selected
          ? "bg-surface shadow-[0_30px_60px_-32px_rgba(27,26,23,0.32)] ring-1 ring-foreground/80"
          : "bg-surface/70 hover:-translate-y-0.5 hover:bg-surface hover:shadow-[0_24px_48px_-30px_rgba(27,26,23,0.22)]"
      }`}
    >
      <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#efe7d8] to-[#e6dcc8] sm:h-36">
        <div className="absolute inset-0" style={{ backgroundColor: swatch.overlayColor, opacity: swatch.overlayOpacity }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(${stripeDirection}, rgba(0,0,0,${swatch.lineOpacity}) 0 2px, transparent 2px ${swatch.spacingPx}px)`,
          }}
        />
        {selected ? (
          <div className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
            <CheckIcon />
          </div>
        ) : null}
      </div>

      <div className="space-y-0.5 px-1 pb-1">
        <p className="text-[15px] font-medium tracking-tight">{copy.label}</p>
        <p className="text-[13px] text-muted">{copy.tagline}</p>
      </div>
    </button>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
