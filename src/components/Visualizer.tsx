"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { prepareImageForUpload, type PreparedImage } from "@/lib/image-client";
import type { RoomAnalysis } from "@/lib/ai/types";
import { DEFAULT_CURTAIN_FINISH, DEFAULT_CURTAIN_FULLNESS, getDefaultProduct, hasCurtainConstruction, TREATMENT_FAMILIES } from "@/lib/treatments";
import type { CurtainFinish, CurtainFullness, TreatmentState, TreatmentTypeId } from "@/types/product";
import type { ActiveTab, ResultsMap } from "@/types/visualizer";
import { CTASection } from "./CTASection";
import { ErrorState } from "./ErrorState";
import { InlineLoadingState } from "./LoadingState";
import { PrivacyNotice } from "./PrivacyNotice";
import { ResultTabs } from "./ResultTabs";
import { TreatmentSelector } from "./TreatmentSelector";
import { UploadDropzone } from "./UploadDropzone";

const ANALYZING_MESSAGES = ["Analysing your interior", "Identifying your windows"];

type FlowState = "upload" | "analyzing" | "analysis_error" | "select" | "result";

interface AnalysisError {
  message: string;
  tips?: string[];
  kind: "no_window" | "other";
}

function buildEmptyResults(): ResultsMap {
  const entries = TREATMENT_FAMILIES.flatMap((f) => f.types).map((type) => [
    type,
    { closed: { status: "idle" as const }, open: { status: "idle" as const } },
  ]);
  return Object.fromEntries(entries) as ResultsMap;
}

// Web Share API is a browser-only capability with no change events, so we
// read it via useSyncExternalStore (subscribe is a no-op) rather than an
// effect — this avoids a hydration mismatch between server and client.
function subscribeNoop() {
  return () => {};
}
function getShareSupportSnapshot() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}
function getShareSupportServerSnapshot() {
  return false;
}

/** What can be overridden for a single generation call, on top of the current selection state. */
interface GenerationOverrides {
  productId?: string;
  curtainFinish?: CurtainFinish;
  fullness?: CurtainFullness;
}

export function Visualizer() {
  const [flowState, setFlowState] = useState<FlowState>("upload");
  const [photo, setPhoto] = useState<PreparedImage | null>(null);
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<AnalysisError | null>(null);
  const [selectedType, setSelectedType] = useState<TreatmentTypeId | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("original");
  const [activeState, setActiveState] = useState<TreatmentState>("closed");
  const [results, setResults] = useState<ResultsMap>(buildEmptyResults);
  const [selectedProductByType, setSelectedProductByType] = useState<Partial<Record<TreatmentTypeId, string>>>({});
  const [selectedFinishByType, setSelectedFinishByType] = useState<Partial<Record<TreatmentTypeId, CurtainFinish>>>({});
  const [selectedFullnessByType, setSelectedFullnessByType] = useState<Partial<Record<TreatmentTypeId, CurtainFullness>>>(
    {},
  );
  const canShare = useSyncExternalStore(subscribeNoop, getShareSupportSnapshot, getShareSupportServerSnapshot);

  // Read inside async closures (background prefetch, in particular) so a check never
  // acts on a stale snapshot of `results` from whenever that closure was created.
  const resultsRef = useRef(results);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  function getActiveProductId(type: TreatmentTypeId): string {
    return selectedProductByType[type] ?? getDefaultProduct(type).id;
  }
  function getActiveFinish(type: TreatmentTypeId): CurtainFinish {
    return selectedFinishByType[type] ?? DEFAULT_CURTAIN_FINISH;
  }
  function getActiveFullness(type: TreatmentTypeId): CurtainFullness {
    return selectedFullnessByType[type] ?? DEFAULT_CURTAIN_FULLNESS;
  }

  /**
   * Starts generation for a type/state combo in the background if — and only
   * if — it hasn't been generated yet and isn't already in flight. Does not
   * touch which tab/state is on screen, so it's safe to call speculatively
   * (on hover, or right after a neighbouring combo finishes) without
   * yanking the customer's view around.
   */
  function ensureGenerated(type: TreatmentTypeId, state: TreatmentState, overrides?: GenerationOverrides) {
    const status = resultsRef.current[type]?.[state]?.status ?? "idle";
    if (status === "idle") {
      runGeneration(type, state, overrides);
    }
  }

  function handleTabChange(tab: ActiveTab) {
    setActiveTab(tab);
    if (tab !== "original") ensureGenerated(tab, activeState);
  }

  function handleStateChange(state: TreatmentState) {
    setActiveState(state);
    if (activeTab !== "original") ensureGenerated(activeTab, state);
  }

  /**
   * Shared by the fabric/colour, finish and fullness pickers: any one of
   * them changing invalidates the cached result(s) for that treatment type
   * (they no longer reflect what's selected) and, if the customer is
   * currently looking at that type, immediately regenerates the view they
   * have open — no extra "Generate" click, matching the fabric/colour
   * picker's existing behaviour.
   */
  function applySelectionChange(type: TreatmentTypeId, overrides: GenerationOverrides) {
    setResults((prev) => ({
      ...prev,
      [type]: { closed: { status: "idle" }, open: { status: "idle" } },
    }));
    if (type === activeTab) {
      runGeneration(type, activeState, overrides);
    }
  }

  function handleProductChange(type: TreatmentTypeId, productId: string) {
    setSelectedProductByType((prev) => ({ ...prev, [type]: productId }));
    applySelectionChange(type, { productId });
  }

  function handleFinishChange(type: TreatmentTypeId, curtainFinish: CurtainFinish) {
    setSelectedFinishByType((prev) => ({ ...prev, [type]: curtainFinish }));
    applySelectionChange(type, { curtainFinish });
  }

  function handleFullnessChange(type: TreatmentTypeId, fullness: CurtainFullness) {
    setSelectedFullnessByType((prev) => ({ ...prev, [type]: fullness }));
    applySelectionChange(type, { fullness });
  }

  async function runAnalysis(image: PreparedImage) {
    setFlowState("analyzing");
    setAnalysisError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mimeType: image.mimeType, imageBase64: image.base64 }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAnalysisError({
          message: data.error ?? "Something went wrong while analysing the photo.",
          tips: data.tips,
          kind: res.status === 422 ? "no_window" : "other",
        });
        setFlowState("analysis_error");
        return;
      }

      setAnalysis(data.analysis);
      setFlowState("select");
    } catch {
      setAnalysisError({
        message: "Something went wrong. Check your internet connection and try again.",
        kind: "other",
      });
      setFlowState("analysis_error");
    }
  }

  async function handleFileSelected(file: File) {
    try {
      const prepared = await prepareImageForUpload(file);
      setPhoto(prepared);
      setResults(buildEmptyResults());
      setSelectedType(null);
      setActiveTab("original");
      setActiveState("closed");
      setSelectedProductByType({});
      setSelectedFinishByType({});
      setSelectedFullnessByType({});
      await runAnalysis(prepared);
    } catch {
      setAnalysisError({
        message: "This photo could not be processed. Please try a different file.",
        kind: "other",
      });
      setFlowState("analysis_error");
    }
  }

  /** Pure background fetch + cache update — no navigation side effects, so it's safe for prefetching. */
  async function runGeneration(treatmentType: TreatmentTypeId, state: TreatmentState, overrides?: GenerationOverrides) {
    if (!photo || !analysis) return;
    const productId = overrides?.productId ?? getActiveProductId(treatmentType);
    const isCurtain = hasCurtainConstruction(treatmentType);
    const curtainFinish = isCurtain ? overrides?.curtainFinish ?? getActiveFinish(treatmentType) : undefined;
    const fullness = isCurtain ? overrides?.fullness ?? getActiveFullness(treatmentType) : undefined;

    setResults((prev) => ({
      ...prev,
      [treatmentType]: { ...prev[treatmentType], [state]: { status: "loading" } },
    }));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mimeType: photo.mimeType,
          imageBase64: photo.base64,
          treatmentType,
          state,
          productId,
          curtainFinish,
          fullness,
          analysis,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResults((prev) => ({
          ...prev,
          [treatmentType]: {
            ...prev[treatmentType],
            [state]: {
              status: "error",
              errorMessage: data.error ?? "Something went wrong while generating this visualisation.",
            },
          },
        }));
        return;
      }

      const dataUrl = `data:${data.image.mimeType};base64,${data.image.base64}`;
      setResults((prev) => ({
        ...prev,
        [treatmentType]: {
          ...prev[treatmentType],
          [state]: { status: "done", imageDataUrl: dataUrl, providerNotes: data.providerNotes },
        },
      }));

      // The open/closed position the customer didn't just look at is the single most likely
      // next click — start it quietly in the background so flipping the toggle after this
      // feels instant instead of waiting on a fresh AI generation.
      const otherState: TreatmentState = state === "closed" ? "open" : "closed";
      ensureGenerated(treatmentType, otherState, { productId, curtainFinish, fullness });
    } catch {
      setResults((prev) => ({
        ...prev,
        [treatmentType]: {
          ...prev[treatmentType],
          [state]: { status: "error", errorMessage: "Network error. Please try again." },
        },
      }));
    }
  }

  /**
   * User-facing trigger for an explicit click (the initial "Generate
   * visualisation" button, or a retry after an error): switches the view to
   * this combo and always (re)runs generation, regardless of any cached
   * status — unlike `ensureGenerated`, which is for passive/speculative
   * triggers and must never override an error or in-flight/cached result.
   */
  function generateFor(treatmentType: TreatmentTypeId, state: TreatmentState, overrides?: GenerationOverrides) {
    setFlowState("result");
    setActiveTab(treatmentType);
    setActiveState(state);
    runGeneration(treatmentType, state, overrides);
  }

  function handleReset() {
    setFlowState("upload");
    setPhoto(null);
    setAnalysis(null);
    setAnalysisError(null);
    setSelectedType(null);
    setActiveTab("original");
    setActiveState("closed");
    setResults(buildEmptyResults());
    setSelectedProductByType({});
    setSelectedFinishByType({});
    setSelectedFullnessByType({});
  }

  function handleDownload(dataUrl: string, filename: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleShare(dataUrl: string, filename: string) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: blob.type });
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        handleDownload(dataUrl, filename);
        return;
      }
      await navigator.share({ files: [file], title: "Copahome — AI Curtain Visualizer" });
    } catch {
      // User cancelled the share sheet, or sharing isn't supported — nothing to do.
    }
  }

  const hasDoneResult = Object.values(results).some((byState) =>
    Object.values(byState).some((entry) => entry.status === "done"),
  );

  if (flowState === "upload") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <div className="animate-fade-up space-y-5">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted">AI Curtain Visualizer</p>
          <h1 className="text-5xl font-medium leading-[1.05] tracking-tight sm:text-7xl">
            See your space differently.
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-muted sm:text-xl">
            Visualise Copahome curtains in your own interior with AI.
          </p>
        </div>
        <div className="w-full animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <UploadDropzone onFileSelected={handleFileSelected} />
        </div>
        <PrivacyNotice />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-medium text-muted underline decoration-muted/40 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
        >
          Upload another photo
        </button>
      </div>

      {photo && flowState !== "result" ? (
        <div className="animate-fade-up space-y-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.dataUrl}
            alt="Your uploaded interior photo"
            className="aspect-[4/3] w-full rounded-[28px] object-cover shadow-[0_40px_80px_-40px_rgba(27,26,23,0.25)]"
          />

          {flowState === "analyzing" ? <InlineLoadingState messages={ANALYZING_MESSAGES} /> : null}

          {flowState === "analysis_error" && analysisError ? (
            <ErrorState
              message={analysisError.message}
              tips={analysisError.tips}
              retryLabel={analysisError.kind === "no_window" ? "Upload another photo" : "Try again"}
              onRetry={() => (analysisError.kind === "no_window" ? handleReset() : photo && runAnalysis(photo))}
            />
          ) : null}

          {flowState === "select" ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">Choose your treatment</h2>
              <TreatmentSelector selected={selectedType} onSelect={setSelectedType} />
              <button
                type="button"
                disabled={!selectedType}
                onClick={() => selectedType && generateFor(selectedType, "closed")}
                className="w-full rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-transform duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30 sm:w-auto"
              >
                Generate visualisation
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {flowState === "result" && photo ? (
        <div className="space-y-16">
          <ResultTabs
            originalDataUrl={photo.dataUrl}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            activeState={activeState}
            onStateChange={handleStateChange}
            selectedProductId={activeTab !== "original" ? getActiveProductId(activeTab) : ""}
            onProductChange={(productId) => activeTab !== "original" && handleProductChange(activeTab, productId)}
            selectedFinish={activeTab !== "original" && hasCurtainConstruction(activeTab) ? getActiveFinish(activeTab) : undefined}
            onFinishChange={(finish) => activeTab !== "original" && handleFinishChange(activeTab, finish)}
            selectedFullness={
              activeTab !== "original" && hasCurtainConstruction(activeTab) ? getActiveFullness(activeTab) : undefined
            }
            onFullnessChange={(fullness) => activeTab !== "original" && handleFullnessChange(activeTab, fullness)}
            results={results}
            onGenerate={generateFor}
            onDownload={handleDownload}
            onShare={handleShare}
            canShare={canShare}
          />
          {hasDoneResult ? <CTASection /> : null}
        </div>
      ) : null}
    </div>
  );
}
