import type { CurtainTypeId, Product } from "@/types/product";

/**
 * The three MVP curtain categories, modeled as Products (see src/types/product.ts)
 * so Phase 2 can add real Copahome SKUs under the same categories without
 * touching the AI pipeline or the UI contract.
 */
export const CURTAIN_PRODUCTS: Record<CurtainTypeId, Product> = {
  transparent: {
    id: "copahome-transparant-default",
    name: "Transparant voile",
    collection: "Copahome Essentials",
    category: "transparent",
    transparency: "high",
    color: "Natuurlijk wit",
    fabric: "Lichte voile",
  },
  semi_transparent: {
    id: "copahome-semi-transparant-default",
    name: "Semi-transparant linnen",
    collection: "Copahome Essentials",
    category: "semi_transparent",
    transparency: "medium",
    color: "Zand",
    fabric: "Linnenmix",
  },
  blackout: {
    id: "copahome-blackout-default",
    name: "Blackout verduisterend",
    collection: "Copahome Essentials",
    category: "blackout",
    transparency: "low",
    color: "Antraciet",
    fabric: "Verzwaarde verduisteringsstof",
  },
};

export interface CurtainTypeCopy {
  id: CurtainTypeId;
  label: string;
  tagline: string;
  description: string;
  bullets: string[];
}

export const CURTAIN_TYPE_COPY: Record<CurtainTypeId, CurtainTypeCopy> = {
  transparent: {
    id: "transparent",
    label: "Transparant",
    tagline: "Lichtdoorlatend en luchtig",
    description:
      "Maximale lichtinval met een zachte, verfijnde afwerking. Het raam en het licht blijven grotendeels zichtbaar door de stof.",
    bullets: ["Zeer veel lichtdoorlaatbaarheid", "Lichte privacy", "Subtiele plooival"],
  },
  semi_transparent: {
    id: "semi_transparent",
    label: "Semi-transparant",
    tagline: "Meer privacy, nog steeds lichtinval",
    description:
      "Een gebalanceerde keuze: het raam wordt gedeeltelijk afgeschermd terwijl daglicht zacht binnenvalt.",
    bullets: ["Gemiddelde lichtdoorlaatbaarheid", "Duidelijk meer privacy", "Realistische stofstructuur"],
  },
  blackout: {
    id: "blackout",
    label: "Blackout",
    tagline: "Maximale verduistering en privacy",
    description:
      "Zware, verzwaarde stof die het raam grotendeels afschermt voor optimale rust en privacy.",
    bullets: ["Zeer weinig lichtdoorlaatbaarheid", "Zwaardere stof", "Correcte schaduwwerking"],
  },
};

/**
 * Physical fabric properties used to build the AI edit prompt. Keeping these
 * separate from the UI copy above means the prompt wording can be tuned for
 * photorealism without touching customer-facing text, and vice versa.
 */
export const CURTAIN_PHYSICAL_PROPERTIES: Record<CurtainTypeId, string> = {
  transparent:
    "A sheer, lightweight voile curtain with very high light transmission. The window and the light source behind it must remain largely visible through the fabric. Soft, thin folds. Subtle natural fabric sheen. Almost no reduction in the room's ambient brightness.",
  semi_transparent:
    "A mid-weight linen-blend curtain with moderate light transmission. The window is partially obscured — outlines of light stay visible but direct view through the fabric is diffused. Realistic woven fabric texture with natural, fuller folds than a sheer voile. Light entering the room becomes noticeably softer.",
  blackout:
    "A heavy, densely-woven blackout curtain with very low light transmission. The window is almost entirely obscured by the fabric. Visibly thicker, weightier material with deep, structured folds and correct self-shadowing. The fabric blocks the light source rather than diffusing it — cast shadows in the room should reflect the reduced light.",
};
