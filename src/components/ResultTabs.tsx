import {
  CURTAIN_FINISH_COPY,
  CURTAIN_FINISHES,
  CURTAIN_FULLNESS_OPTIONS,
  getProductsForType,
  hasCurtainConstruction,
  TREATMENT_COPY,
  TREATMENT_FAMILIES,
} from "@/lib/treatments";
import type { CurtainFinish, CurtainFullness, TreatmentState, TreatmentTypeId } from "@/types/product";
import type { ActiveTab, ResultsMap } from "@/types/visualizer";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

const TREATMENT_ORDER: TreatmentTypeId[] = TREATMENT_FAMILIES.flatMap((f) => f.types);
const GENERATE_MESSAGES = ["Analysing your interior", "Identifying your windows", "Creating your Copahome look"];
const STATE_LABEL: Record<TreatmentState, string> = { closed: "Closed", open: "Open" };

interface ResultTabsProps {
  originalDataUrl: string;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeState: TreatmentState;
  onStateChange: (state: TreatmentState) => void;
  selectedProductId: string;
  onProductChange: (productId: string) => void;
  /** Curtain-family only — undefined (and the picker hidden) for wooden blinds/the "original" tab. */
  selectedFinish?: CurtainFinish;
  onFinishChange: (finish: CurtainFinish) => void;
  selectedFullness?: CurtainFullness;
  onFullnessChange: (fullness: CurtainFullness) => void;
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
  selectedFinish,
  onFinishChange,
  selectedFullness,
  onFullnessChange,
  results,
  onGenerate,
  onDownload,
  onShare,
  canShare,
}: ResultTabsProps) {
  const productsForActiveTab = activeTab !== "original" ? getProductsForType(activeTab) : [];
  const showConstruction = activeTab !== "original" && hasCurtainConstruction(activeTab);

  return (
    <div className="w-full animate-fade-up space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Your Copahome look</h2>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <TabButton active={activeTab === "original"} onClick={() => onTabChange("original")} label="Original" />
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
      </div>

      {activeTab !== "original" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {productsForActiveTab.length > 1 ? (
              <ChipGroup
                label={TREATMENT_COPY[activeTab].family === "wooden_blind" ? "Color" : "Fabric"}
                options={productsForActiveTab.map((p) => ({ value: p.id, label: p.name }))}
                selected={selectedProductId}
                onChange={onProductChange}
              />
            ) : null}

            <ChipGroup
              label="Position"
              options={(["closed", "open"] as TreatmentState[]).map((s) => ({ value: s, label: STATE_LABEL[s] }))}
              selected={activeState}
              onChange={(value) => onStateChange(value as TreatmentState)}
            />
          </div>

          {showConstruction && selectedFinish && selectedFullness ? (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <ChipGroup
                label="Finish"
                options={CURTAIN_FINISHES.map((f) => ({ value: f, label: CURTAIN_FINISH_COPY[f].label }))}
                selected={selectedFinish}
                onChange={(value) => onFinishChange(value as CurtainFinish)}
              />
              <ChipGroup
                label="Fullness"
                options={CURTAIN_FULLNESS_OPTIONS.map((f) => ({ value: String(f), label: `${f.toFixed(1)}x` }))}
                selected={String(selectedFullness)}
                onChange={(value) => onFullnessChange(Number(value) as CurtainFullness)}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === "original" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={originalDataUrl}
          alt="Your uploaded interior photo"
          className="animate-scale-in aspect-[4/3] w-full rounded-[28px] object-cover shadow-[0_40px_80px_-40px_rgba(27,26,23,0.25)]"
        />
      ) : (
        <TreatmentResultPanel
          key={activeTab}
          treatmentType={activeTab}
          state={activeState}
          productName={productsForActiveTab.find((p) => p.id === selectedProductId)?.name}
          constructionLabel={
            showConstruction && selectedFinish && selectedFullness
              ? `${CURTAIN_FINISH_COPY[selectedFinish].label} ${selectedFullness.toFixed(1)}x`
              : undefined
          }
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

/** A labelled row of small pill buttons, one active at a time — shared by the fabric/colour, position, finish and fullness pickers. */
function ChipGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs uppercase tracking-[0.15em] text-muted">{label}</span>
      <div className="inline-flex gap-1 rounded-full bg-foreground/[0.04] p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selected === opt.value ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
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
      className={`relative flex items-center gap-1.5 pb-1.5 text-sm font-medium transition-colors ${
        active ? "text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      {label}
      {status === "loading" ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> : null}
      {status === "error" ? <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> : null}
      <span
        className={`absolute bottom-0 left-0 h-px w-full bg-foreground transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </button>
  );
}

function TreatmentResultPanel({
  treatmentType,
  state,
  productName,
  constructionLabel,
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
  constructionLabel?: string;
  entry: ResultsMap[TreatmentTypeId][TreatmentState] | undefined;
  originalDataUrl: string;
  onGenerate: (type: TreatmentTypeId, state: TreatmentState) => void;
  onDownload: (dataUrl: string, filename: string) => void;
  onShare?: (dataUrl: string, filename: string) => void;
  canShare?: boolean;
}) {
  const status = entry?.status ?? "idle";
  const copy = TREATMENT_COPY[treatmentType];
  const fileSlug = `${treatmentType}${productName ? `-${productName.toLowerCase()}` : ""}${
    constructionLabel ? `-${constructionLabel.toLowerCase().replace(/\s+/g, "-")}` : ""
  }-${state}`;

  if (status === "loading") {
    return <LoadingState messages={GENERATE_MESSAGES} />;
  }

  if (status === "error") {
    return (
      <ErrorState
        message={entry?.errorMessage ?? "Something went wrong while generating this visualisation."}
        onRetry={() => onGenerate(treatmentType, state)}
      />
    );
  }

  if (status === "done" && entry?.imageDataUrl) {
    return (
      <div className="animate-fade-up space-y-5">
        {entry.providerNotes ? (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="font-medium">Demo mode: </span>
            {entry.providerNotes}
          </div>
        ) : null}
        <BeforeAfterSlider originalSrc={originalDataUrl} afterSrc={entry.imageDataUrl} />
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <button
            type="button"
            onClick={() => onDownload(entry.imageDataUrl!, `copahome-${fileSlug}.png`)}
            className="text-sm font-medium text-foreground underline decoration-foreground/20 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Download visualisation
          </button>
          {canShare && onShare ? (
            <button
              type="button"
              onClick={() => onShare(entry.imageDataUrl!, `copahome-${fileSlug}.png`)}
              className="text-sm font-medium text-foreground underline decoration-foreground/20 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Share
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-5 rounded-[28px] bg-surface px-6 py-16 text-center shadow-[0_30px_60px_-40px_rgba(27,26,23,0.18)] sm:min-h-[520px]">
      <p className="text-2xl font-medium tracking-tight">
        {copy.label}
        {productName ? ` — ${productName}` : ""}
        {constructionLabel ? ` — ${constructionLabel}` : ""} · {STATE_LABEL[state]}
      </p>
      <p className="max-w-sm text-sm leading-relaxed text-muted">{copy.description}</p>
      <button
        type="button"
        onClick={() => onGenerate(treatmentType, state)}
        className="mt-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        Generate visualisation
      </button>
    </div>
  );
}
