import type { TreatmentState, TreatmentTypeId } from "./product";

export type TreatmentResultStatus = "idle" | "loading" | "done" | "error";

export interface TreatmentResultEntry {
  status: TreatmentResultStatus;
  imageDataUrl?: string;
  errorMessage?: string;
  /** Set by the mock/Hugging Face providers to flag a non-standard result (demo mode / experimental quality). */
  providerNotes?: string;
}

/** Keyed by treatment type, then by open/closed state — each combination is its own generation. */
export type ResultsMap = Record<TreatmentTypeId, Record<TreatmentState, TreatmentResultEntry>>;

export type ActiveTab = "original" | TreatmentTypeId;
