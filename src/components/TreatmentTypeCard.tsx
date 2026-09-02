import type { TreatmentTypeId } from "@/types/product";
import type { TreatmentCopy } from "@/lib/treatments";

const SWATCH: Record<
  TreatmentTypeId,
  { overlayOpacity: number; overlayColor: string; lineOpacity: number; pattern: "vertical" | "horizontal"; spacingPx: number }
> = {
  transparent: { overlayOpacity: 0.12, overlayColor: "#ffffff", lineOpacity: 0.06, pattern: "vertical", spacingPx: 18 },
  semi_transparent: { overlayOpacity: 0.55, overlayColor: "#cbb79a", lineOpacity: 0.12, pattern: "vertical", spacingPx: 18 },
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
      className={`flex flex-col items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
        selected ? "border-accent bg-accent/[0.04] shadow-sm" : "border-border bg-surface hover:border-foreground/25"
      }`}
    >
      <div className="relative h-28 w-full overflow-hidden rounded-lg bg-gradient-to-b from-amber-100 to-amber-50">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: swatch.overlayColor, opacity: swatch.overlayOpacity }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(${stripeDirection}, rgba(0,0,0,${swatch.lineOpacity}) 0 2px, transparent 2px ${swatch.spacingPx}px)`,
          }}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg">{copy.label}</span>
          {selected ? (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
              Geselecteerd
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted">{copy.tagline}</p>
      </div>

      <ul className="space-y-1 text-xs text-muted">
        {copy.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-1.5">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
            {bullet}
          </li>
        ))}
      </ul>
    </button>
  );
}
