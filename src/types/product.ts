/**
 * Product model.
 *
 * The MVP only ships three curtain "categories" (transparent / semi-transparent /
 * blackout), but the visualizer is built against this richer model from day one
 * so Phase 2 (real Copahome collection: fabric, color, pattern per SKU) is
 * additive — new Product rows and a picker UI — rather than a rewrite of the
 * AI pipeline, which already accepts a Product.
 */

export type CurtainTypeId = "transparent" | "semi_transparent" | "blackout";

export type TransparencyLevel = "high" | "medium" | "low";

export interface Product {
  id: string;
  name: string;
  collection: string;
  category: CurtainTypeId;
  transparency: TransparencyLevel;
  color: string;
  fabric: string;
  image?: string;
  texture?: string;
  pattern?: string;
  metadata?: Record<string, unknown>;
}
