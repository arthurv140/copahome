import { TREATMENT_COPY, TREATMENT_FAMILIES } from "@/lib/treatments";
import type { TreatmentTypeId } from "@/types/product";
import { TreatmentTypeCard } from "./TreatmentTypeCard";

interface TreatmentSelectorProps {
  selected: TreatmentTypeId | null;
  onSelect: (id: TreatmentTypeId) => void;
}

export function TreatmentSelector({ selected, onSelect }: TreatmentSelectorProps) {
  return (
    <div className="w-full space-y-10">
      {TREATMENT_FAMILIES.map(({ family, label, types }) => (
        <div key={family}>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{label}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {types.map((id) => (
              <TreatmentTypeCard key={id} copy={TREATMENT_COPY[id]} selected={selected === id} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
