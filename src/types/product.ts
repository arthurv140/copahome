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

/**
 * Curtain heading construction — how the fabric is pleated/gathered at the
 * top. Curtain-family only (`TreatmentFamily === "curtain"`); wooden blinds
 * have no heading. Orthogonal to `Product`/fabric: this is a construction
 * choice the customer makes independently of which fabric they picked.
 */
export type CurtainFinish = "single_pleat" | "double_pleat" | "wave";

/**
 * Fabric fullness ratio — how many times the finished track width is used
 * in fabric (2.0 = twice the track width, gathered down to size). Curtain-
 * family only, same as `CurtainFinish`.
 */
export type CurtainFullness = 1.6 | 1.8 | 2.0 | 2.2;

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
