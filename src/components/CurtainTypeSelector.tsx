import { CURTAIN_TYPE_COPY } from "@/lib/curtains";
import type { CurtainTypeId } from "@/types/product";
import { CurtainTypeCard } from "./CurtainTypeCard";

const ORDER: CurtainTypeId[] = ["transparent", "semi_transparent", "blackout"];

interface CurtainTypeSelectorProps {
  selected: CurtainTypeId | null;
  onSelect: (id: CurtainTypeId) => void;
}

export function CurtainTypeSelector({ selected, onSelect }: CurtainTypeSelectorProps) {
  return (
    <div className="w-full">
      <h2 className="mb-4 font-display text-2xl">Kies jouw gordijn</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ORDER.map((id) => (
          <CurtainTypeCard key={id} copy={CURTAIN_TYPE_COPY[id]} selected={selected === id} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
