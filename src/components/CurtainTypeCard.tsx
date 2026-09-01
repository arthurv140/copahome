import type { CurtainTypeId } from "@/types/product";
import type { CurtainTypeCopy } from "@/lib/curtains";

const SWATCH: Record<CurtainTypeId, { overlayOpacity: number; overlayColor: string; foldOpacity: number }> = {
  transparent: { overlayOpacity: 0.12, overlayColor: "#ffffff", foldOpacity: 0.06 },
  semi_transparent: { overlayOpacity: 0.55, overlayColor: "#cbb79a", foldOpacity: 0.12 },
  blackout: { overlayOpacity: 0.94, overlayColor: "#2a2724", foldOpacity: 0.22 },
};

interface CurtainTypeCardProps {
  copy: CurtainTypeCopy;
  selected: boolean;
  onSelect: (id: CurtainTypeId) => void;
}

export function CurtainTypeCard({ copy, selected, onSelect }: CurtainTypeCardProps) {
  const swatch = SWATCH[copy.id];

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
            backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,${swatch.foldOpacity}) 0 2px, transparent 2px 18px)`,
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
