import { CURTAIN_TYPE_COPY } from "@/lib/curtains";
import type { CurtainTypeId } from "@/types/product";
import type { ActiveTab, ResultsMap } from "@/types/visualizer";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

const CURTAIN_ORDER: CurtainTypeId[] = ["transparent", "semi_transparent", "blackout"];
const GENERATE_MESSAGES = ["We plaatsen jouw gordijnen...", "Bijna klaar..."];

interface ResultTabsProps {
  originalDataUrl: string;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  results: ResultsMap;
  onGenerate: (type: CurtainTypeId) => void;
  onDownload: (dataUrl: string, filename: string) => void;
  onShare?: (dataUrl: string, filename: string) => void;
  canShare?: boolean;
}

export function ResultTabs({
  originalDataUrl,
  activeTab,
  onTabChange,
  results,
  onGenerate,
  onDownload,
  onShare,
  canShare,
}: ResultTabsProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-2">
        <TabButton active={activeTab === "original"} onClick={() => onTabChange("original")} label="Origineel" />
        {CURTAIN_ORDER.map((id) => (
          <TabButton
            key={id}
            active={activeTab === id}
            onClick={() => onTabChange(id)}
            label={CURTAIN_TYPE_COPY[id].label}
            status={results[id]?.status}
          />
        ))}
      </div>

      {activeTab === "original" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={originalDataUrl}
          alt="Originele interieurfoto"
          className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
        />
      ) : (
        <CurtainResultPanel
          curtainType={activeTab}
          entry={results[activeTab]}
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
  status?: ResultsMap[CurtainTypeId]["status"];
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

function CurtainResultPanel({
  curtainType,
  entry,
  originalDataUrl,
  onGenerate,
  onDownload,
  onShare,
  canShare,
}: {
  curtainType: CurtainTypeId;
  entry: ResultsMap[CurtainTypeId] | undefined;
  originalDataUrl: string;
  onGenerate: (type: CurtainTypeId) => void;
  onDownload: (dataUrl: string, filename: string) => void;
  onShare?: (dataUrl: string, filename: string) => void;
  canShare?: boolean;
}) {
  const status = entry?.status ?? "idle";
  const copy = CURTAIN_TYPE_COPY[curtainType];

  if (status === "loading") {
    return <LoadingState messages={GENERATE_MESSAGES} />;
  }

  if (status === "error") {
    return (
      <ErrorState
        message={entry?.errorMessage ?? "Er ging iets mis bij het genereren van deze visualisatie."}
        onRetry={() => onGenerate(curtainType)}
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
            onClick={() => onDownload(entry.imageDataUrl!, `copahome-${curtainType}.png`)}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            Download visualisatie
          </button>
          {canShare && onShare ? (
            <button
              type="button"
              onClick={() => onShare(entry.imageDataUrl!, `copahome-${curtainType}.png`)}
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
      <p className="font-display text-lg">{copy.label}</p>
      <p className="max-w-sm text-sm text-muted">{copy.description}</p>
      <button
        type="button"
        onClick={() => onGenerate(curtainType)}
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent"
      >
        Genereer visualisatie
      </button>
    </div>
  );
}
