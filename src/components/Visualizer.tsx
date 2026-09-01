"use client";

import { useState, useSyncExternalStore } from "react";
import { prepareImageForUpload, type PreparedImage } from "@/lib/image-client";
import type { RoomAnalysis } from "@/lib/ai/types";
import type { CurtainTypeId } from "@/types/product";
import type { ActiveTab, ResultsMap } from "@/types/visualizer";
import { CurtainTypeSelector } from "./CurtainTypeSelector";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { ResultTabs } from "./ResultTabs";
import { UploadDropzone } from "./UploadDropzone";

type FlowState = "upload" | "analyzing" | "analysis_error" | "select" | "result";

interface AnalysisError {
  message: string;
  tips?: string[];
  kind: "no_window" | "other";
}

const EMPTY_RESULTS: ResultsMap = {
  transparent: { status: "idle" },
  semi_transparent: { status: "idle" },
  blackout: { status: "idle" },
};

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
  const [selectedType, setSelectedType] = useState<CurtainTypeId | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("original");
  const [results, setResults] = useState<ResultsMap>(EMPTY_RESULTS);
  const canShare = useSyncExternalStore(subscribeNoop, getShareSupportSnapshot, getShareSupportServerSnapshot);

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
      setResults(EMPTY_RESULTS);
      setSelectedType(null);
      setActiveTab("original");
      await runAnalysis(prepared);
    } catch {
      setAnalysisError({
        message: "Deze foto kon niet worden verwerkt. Probeer een ander bestand.",
        kind: "other",
      });
      setFlowState("analysis_error");
    }
  }

  async function generateFor(curtainType: CurtainTypeId) {
    if (!photo || !analysis) return;

    setResults((prev) => ({ ...prev, [curtainType]: { status: "loading" } }));
    setFlowState("result");
    setActiveTab(curtainType);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mimeType: photo.mimeType,
          imageBase64: photo.base64,
          curtainType,
          analysis,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResults((prev) => ({
          ...prev,
          [curtainType]: {
            status: "error",
            errorMessage: data.error ?? "Er ging iets mis bij het genereren van deze visualisatie.",
          },
        }));
        return;
      }

      const dataUrl = `data:${data.image.mimeType};base64,${data.image.base64}`;
      setResults((prev) => ({ ...prev, [curtainType]: { status: "done", imageDataUrl: dataUrl } }));
    } catch {
      setResults((prev) => ({
        ...prev,
        [curtainType]: { status: "error", errorMessage: "Netwerkfout. Probeer opnieuw." },
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
    setResults(EMPTY_RESULTS);
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
          <CurtainTypeSelector selected={selectedType} onSelect={setSelectedType} />
          <button
            type="button"
            disabled={!selectedType}
            onClick={() => selectedType && generateFor(selectedType)}
            className="w-full rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
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
