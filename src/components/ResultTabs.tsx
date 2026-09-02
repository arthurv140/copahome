import { getProductsForType, TREATMENT_COPY, TREATMENT_FAMILIES } from "@/lib/treatments";
import type { TreatmentState, TreatmentTypeId } from "@/types/product";
import type { ActiveTab, ResultsMap } from "@/types/visualizer";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

const TREATMENT_ORDER: TreatmentTypeId[] = TREATMENT_FAMILIES.flatMap((f) => f.types);
const GENERATE_MESSAGES = ["We plaatsen jouw raamdecoratie...", "Bijna klaar..."];
const STATE_LABEL: Record<TreatmentState, string> = { closed: "Toe", open: "Open" };

interface ResultTabsProps {
  originalDataUrl: string;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeState: TreatmentState;
  onStateChange: (state: TreatmentState) => void;
  selectedProductId: string;
  onProductChange: (productId: string) => void;
  results: ResultsMap;
  onGenerate: (type: TreatmentTypeId, state: TreatmentState) => void;
  onDownload: (dataUrl: string, filename: string) => void;
  onShare?: (dataUrl: string, filename: string) => void;
  canShare?: boolean;
}

export function ResultTabs({
  originalDataUrl,
  activeTab,
  onTabChange,
  activeState,
  onStateChange,
  selectedProductId,
  onProductChange,
  results,
  onGenerate,
  onDownload,
  onShare,
  canShare,
}: ResultTabsProps) {
  const productsForActiveTab = activeTab !== "original" ? getProductsForType(activeTab) : [];

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-2">
        <TabButton active={activeTab === "original"} onClick={() => onTabChange("original")} label="Origineel" />
        {TREATMENT_ORDER.map((id) => (
          <TabButton
            key={id}
            active={activeTab === id}
            onClick={() => onTabChange(id)}
            label={TREATMENT_COPY[id].label}
            status={results[id]?.[activeState]?.status}
          />
        ))}
      </div>

      {productsForActiveTab.length > 1 ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted">Stof:</span>
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-border p-1">
            {productsForActiveTab.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onProductChange(p.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedProductId === p.id ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab !== "original" ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">Stand:</span>
          <div className="inline-flex rounded-full border border-border p-1">
            {(["closed", "open"] as TreatmentState[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStateChange(s)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeState === s ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {STATE_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "original" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={originalDataUrl}
          alt="Originele interieurfoto"
          className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
        />
      ) : (
        <TreatmentResultPanel
          treatmentType={activeTab}
          state={activeState}
          productName={productsForActiveTab.find((p) => p.id === selectedProductId)?.name}
          entry={results[activeTab]?.[activeState]}
          originalDataUrl={originalDataUrl}
          onGenerate={onGenerate}
          onDownload={onDownload}
          onShare={onShare}
          canShare={canShare}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  status,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  status?: ResultsMap[TreatmentTypeId][TreatmentState]["status"];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active ? "border-foreground bg-foreground text-background" : "border-border text-foreground/80 hover:border-foreground/40"
      }`}
    >
      {label}
      {status === "loading" ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> : null}
      {status === "error" ? <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> : null}
    </button>
  );
}

function TreatmentResultPanel({
  treatmentType,
  state,
  productName,
  entry,
  originalDataUrl,
  onGenerate,
  onDownload,
  onShare,
  canShare,
}: {
  treatmentType: TreatmentTypeId;
  state: TreatmentState;
  productName?: string;
  entry: ResultsMap[TreatmentTypeId][TreatmentState] | undefined;
  originalDataUrl: string;
  onGenerate: (type: TreatmentTypeId, state: TreatmentState) => void;
  onDownload: (dataUrl: string, filename: string) => void;
  onShare?: (dataUrl: string, filename: string) => void;
  canShare?: boolean;
}) {
  const status = entry?.status ?? "idle";
  const copy = TREATMENT_COPY[treatmentType];
  const fileSlug = `${treatmentType}${productName ? `-${productName.toLowerCase()}` : ""}-${state}`;

  if (status === "loading") {
    return <LoadingState messages={GENERATE_MESSAGES} />;
  }

  if (status === "error") {
    return (
      <ErrorState
        message={entry?.errorMessage ?? "Er ging iets mis bij het genereren van deze visualisatie."}
        onRetry={() => onGenerate(treatmentType, state)}
      />
    );
  }

  if (status === "done" && entry?.imageDataUrl) {
    return (
      <div className="space-y-3">
        {entry.providerNotes ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="font-medium">Demo-modus actief: </span>
            {entry.providerNotes}
          </div>
        ) : null}
        <BeforeAfterSlider originalSrc={originalDataUrl} afterSrc={entry.imageDataUrl} />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onDownload(entry.imageDataUrl!, `copahome-${fileSlug}.png`)}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            Download visualisatie
          </button>
          {canShare && onShare ? (
            <button
              type="button"
              onClick={() => onShare(entry.imageDataUrl!, `copahome-${fileSlug}.png`)}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Delen
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center sm:min-h-[360px]">
      <p className="font-display text-lg">
        {copy.label}
        {productName ? ` — ${productName}` : ""} — {STATE_LABEL[state]}
      </p>
      <p className="max-w-sm text-sm text-muted">{copy.description}</p>
      <button
        type="button"
        onClick={() => onGenerate(treatmentType, state)}
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent"
      >
        Genereer visualisatie
      </button>
    </div>
  );
}
