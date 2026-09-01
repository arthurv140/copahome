import type { CurtainTypeId } from "./product";

export type CurtainResultStatus = "idle" | "loading" | "done" | "error";

export interface CurtainResultEntry {
  status: CurtainResultStatus;
  imageDataUrl?: string;
  errorMessage?: string;
  /** Set by the mock provider (no AI_PROVIDER key configured) to flag that this is not a real generation. */
  providerNotes?: string;
}

export type ResultsMap = Record<CurtainTypeId, CurtainResultEntry>;

export type ActiveTab = "original" | CurtainTypeId;
