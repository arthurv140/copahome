import type { CurtainTypeId } from "./product";

export type CurtainResultStatus = "idle" | "loading" | "done" | "error";

export interface CurtainResultEntry {
  status: CurtainResultStatus;
  imageDataUrl?: string;
  errorMessage?: string;
}

export type ResultsMap = Record<CurtainTypeId, CurtainResultEntry>;

export type ActiveTab = "original" | CurtainTypeId;
