"use client";

import { useState, useSyncExternalStore } from "react";
import { prepareImageForUpload, type PreparedImage } from "@/lib/image-client";
import type { RoomAnalysis } from "@/lib/ai/types";
import { getDefaultProduct, TREATMENT_FAMILIES } from "@/lib/treatments";
import type { TreatmentState, TreatmentTypeId } from "@/types/product";
import type { ActiveTab, ResultsMap } from "@/types/visualizer";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { ResultTabs } from "./ResultTabs";
import { TreatmentSelector } from "./TreatmentSelector";
import { UploadDropzone } from "./UploadDropzone";

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
  const canShare = useSyncExternalStore(subscribeNoop, getShareSupportSnapshot, getShareSupportServerSnapshot);

  function getActiveProductId(type: TreatmentTypeId): string {
    return selectedProductByType[type] ?? getDefaultProduct(type).id;
  }

  function handleProductChange(type: TreatmentTypeId, productId: string) {
    setSelectedProductByType((prev) => ({ ...prev, [type]: productId }));
    // The cached result(s) for this type no longer match the newly chosen fabric.
    setResults((prev) => ({
      ...prev,
      [type]: { closed: { status: "idle" }, open: { status: "idle" } },
    }));
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
          message: data.error ?? "Er ging iets mis bij het analyseren van de foto.",
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
        message: "Er ging iets mis. Controleer je internetverbinding en probeer opnieuw.",
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
      await runAnalysis(prepared);
    } catch {
      setAnalysisError({
        message: "Deze foto kon niet worden verwerkt. Probeer een ander bestand.",
        kind: "other",
      });
      setFlowState("analysis_error");
    }
  }

  async function generateFor(treatmentType: TreatmentTypeId, state: TreatmentState) {
    if (!photo || !analysis) return;

    setResults((prev) => ({
      ...prev,
      [treatmentType]: { ...prev[treatmentType], [state]: { status: "loading" } },
    }));
    setFlowState("result");
    setActiveTab(treatmentType);
    setActiveState(state);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mimeType: photo.mimeType,
          imageBase64: photo.base64,
          treatmentType,
          state,
          productId: getActiveProductId(treatmentType),
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
              errorMessage: data.error ?? "Er ging iets mis bij het genereren van deze visualisatie.",
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
    } catch {
      setResults((prev) => ({
        ...prev,
        [treatmentType]: {
          ...prev[treatmentType],
          [state]: { status: "error", errorMessage: "Netwerkfout. Probeer opnieuw." },
        },
      }));
    }
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

  if (flowState === "upload") {
    return <UploadDropzone onFileSelected={handleFileSelected} />;
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Interieurfoto geladen</p>
        <button type="button" onClick={handleReset} className="text-sm font-medium underline decoration-border underline-offset-4 hover:text-accent">
          Andere foto uploaden
        </button>
      </div>

      {flowState === "analyzing" ? <LoadingState messages={["We analyseren jouw interieur..."]} /> : null}

      {flowState === "analysis_error" && analysisError ? (
        <ErrorState
          message={analysisError.message}
          tips={analysisError.tips}
          retryLabel={analysisError.kind === "no_window" ? "Andere foto uploaden" : "Probeer opnieuw"}
          onRetry={() => (analysisError.kind === "no_window" ? handleReset() : photo && runAnalysis(photo))}
        />
      ) : null}

      {flowState === "select" && photo ? (
        <div className="space-y-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.dataUrl}
            alt="Geüploade interieurfoto"
            className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
          />
          <h2 className="font-display text-2xl">Kies jouw raamdecoratie</h2>
          <TreatmentSelector selected={selectedType} onSelect={setSelectedType} />
          <button
            type="button"
            disabled={!selectedType}
            onClick={() => selectedType && generateFor(selectedType, "closed")}
            className="w-full rounded-full bg-foreground px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            Genereer visualisatie
          </button>
        </div>
      ) : null}

      {flowState === "result" && photo ? (
        <ResultTabs
          originalDataUrl={photo.dataUrl}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeState={activeState}
          onStateChange={setActiveState}
          selectedProductId={activeTab !== "original" ? getActiveProductId(activeTab) : ""}
          onProductChange={(productId) => activeTab !== "original" && handleProductChange(activeTab, productId)}
          results={results}
          onGenerate={generateFor}
          onDownload={handleDownload}
          onShare={handleShare}
          canShare={canShare}
        />
      ) : null}
    </div>
  );
}
