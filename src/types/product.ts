/**
 * Product model.
 *
 * The MVP ships two window-treatment families — curtains (transparent /
 * semi-transparent / blackout) and wooden blinds (35mm / 50mm / 63mm slats)
 * — as a deliberate test of the extensibility this model was built for from
 * day one: adding a family or a specific SKU is new `Product` rows plus a
 * `TreatmentTypeId`/prompt entry, not a rewrite of the AI pipeline or UI,
 * which are both keyed off `TreatmentTypeId` rather than hardcoded to
 * curtains.
 */

export type TreatmentFamily = "curtain" | "wooden_blind";

export type TreatmentTypeId =
  | "transparent"
  | "semi_transparent"
  | "dim_out"
  | "blackout"
  | "wooden_blind_35mm"
  | "wooden_blind_50mm"
  | "wooden_blind_63mm";

/** Whether the treatment is shown drawn/tilted open (window visible) or closed (window covered). */
export type TreatmentState = "closed" | "open";

export type TransparencyLevel = "high" | "medium" | "low";

export interface Product {
  id: string;
  name: string;
  collection: string;
  family: TreatmentFamily;
  category: TreatmentTypeId;
  color: string;
  /** Curtain-family only. */
  transparency?: TransparencyLevel;
  fabric?: string;
  /** Wooden blind-family only. */
  slatWidthMm?: number;
  material?: string;
  image?: string;
  texture?: string;
  pattern?: string;
  metadata?: Record<string, unknown>;
}
