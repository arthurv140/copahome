import { TREATMENT_COPY, TREATMENT_FAMILIES } from "@/lib/treatments";
import type { TreatmentTypeId } from "@/types/product";
import { TreatmentTypeCard } from "./TreatmentTypeCard";

interface TreatmentSelectorProps {
  selected: TreatmentTypeId | null;
  onSelect: (id: TreatmentTypeId) => void;
}

export function TreatmentSelector({ selected, onSelect }: TreatmentSelectorProps) {
  return (
    <div className="w-full space-y-8">
      {TREATMENT_FAMILIES.map(({ family, label, types }) => (
        <div key={family}>
          <h2 className="mb-4 font-display text-2xl">{label}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {types.map((id) => (
              <TreatmentTypeCard key={id} copy={TREATMENT_COPY[id]} selected={selected === id} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
