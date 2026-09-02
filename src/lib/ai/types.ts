import type { CurtainFinish, CurtainFullness, Product, TreatmentState, TreatmentTypeId } from "@/types/product";

/** Normalized (0-1) bounding box, origin top-left — resolution independent. */
export interface NormalizedBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export interface WindowRegion {
  id: string;
  /** Short human label, e.g. "Raam links, woonkamer". */
  label: string;
  boundingBox: NormalizedBox;
  /** Normalized y where the curtain should end (top of the floor at that x-range). */
  floorLineY: number | null;
  hasExistingCurtains: boolean;
  /** Furniture/objects in front of the window the curtain must fall behind. */
  occludedBy: string[];
  /** Rough estimate in meters, when derivable from the photo's perspective. */
  estimatedWidthMeters: number | null;
}

export interface RoomAnalysis {
  windows: WindowRegion[];
  roomDescription: string;
  lightingNotes: string;
  perspectiveNotes: string;
  /** Non-fatal notes surfaced to the user, e.g. "window partly out of frame". */
  warnings: string[];
}

/** Thrown by a provider when no usable window can be detected in the photo. */
export class NoWindowDetectedError extends Error {
  constructor(message = "No window could be confidently detected in this photo.") {
    super(message);
    this.name = "NoWindowDetectedError";
  }
}

export interface GenerateVisualizationParams {
  imageBase64: string;
  mimeType: string;
  analysis: RoomAnalysis;
  treatmentType: TreatmentTypeId;
  state: TreatmentState;
  /** Optional specific SKU (Phase 2: fabric/color picker) overriding the default. */
  product?: Product;
  /** Curtain-family only — heading construction (see `CurtainFinish`). Ignored for blinds. */
  curtainFinish?: CurtainFinish;
  /** Curtain-family only — fabric fullness ratio (see `CurtainFullness`). Ignored for blinds. */
  fullness?: CurtainFullness;
}

export interface GenerateVisualizationResult {
  imageBase64: string;
  mimeType: string;
  providerNotes?: string;
}

export interface AnalyzeRoomInput {
  imageBase64: string;
  mimeType: string;
}

export interface AIProvider {
  name: string;
  analyzeRoom(input: AnalyzeRoomInput): Promise<RoomAnalysis>;
  generateVisualization(params: GenerateVisualizationParams): Promise<GenerateVisualizationResult>;
}
