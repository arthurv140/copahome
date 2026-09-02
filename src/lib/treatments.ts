import type { Product, TreatmentFamily, TreatmentState, TreatmentTypeId } from "@/types/product";

/**
 * Every selectable window treatment, modeled as a Product (see
 * src/types/product.ts) so a real Copahome collection (more fabrics, more
 * slat widths, more colors) is additive later — new rows here plus new
 * TreatmentTypeId values — rather than a rewrite of the AI pipeline or UI,
 * both of which are keyed off TreatmentTypeId rather than hardcoded to
 * curtains.
 */
export const TREATMENT_PRODUCTS: Record<TreatmentTypeId, Product> = {
  transparent: {
    id: "copahome-transparant-default",
    name: "Transparant voile",
    collection: "Copahome Essentials",
    family: "curtain",
    category: "transparent",
    transparency: "high",
    color: "Natuurlijk wit",
    fabric: "Lichte voile",
  },
  semi_transparent: {
    id: "copahome-semi-transparant-default",
    name: "Semi-transparant linnen",
    collection: "Copahome Essentials",
    family: "curtain",
    category: "semi_transparent",
    transparency: "medium",
    color: "Zand",
    fabric: "Linnenmix",
  },
  blackout: {
    id: "copahome-blackout-default",
    name: "Blackout verduisterend",
    collection: "Copahome Essentials",
    family: "curtain",
    category: "blackout",
    transparency: "low",
    color: "Antraciet",
    fabric: "Verzwaarde verduisteringsstof",
  },
  wooden_blind_35mm: {
    id: "copahome-houten-jaloezie-35mm-default",
    name: "Houten jaloezie 35mm",
    collection: "Copahome Essentials",
    family: "wooden_blind",
    category: "wooden_blind_35mm",
    slatWidthMm: 35,
    color: "Naturel eiken",
    material: "Massief hout",
  },
  wooden_blind_50mm: {
    id: "copahome-houten-jaloezie-50mm-default",
    name: "Houten jaloezie 50mm",
    collection: "Copahome Essentials",
    family: "wooden_blind",
    category: "wooden_blind_50mm",
    slatWidthMm: 50,
    color: "Naturel eiken",
    material: "Massief hout",
  },
  wooden_blind_63mm: {
    id: "copahome-houten-jaloezie-63mm-default",
    name: "Houten jaloezie 63mm",
    collection: "Copahome Essentials",
    family: "wooden_blind",
    category: "wooden_blind_63mm",
    slatWidthMm: 63,
    color: "Naturel eiken",
    material: "Massief hout",
  },
};

export interface TreatmentCopy {
  id: TreatmentTypeId;
  family: TreatmentFamily;
  label: string;
  tagline: string;
  description: string;
  bullets: string[];
}

export const TREATMENT_COPY: Record<TreatmentTypeId, TreatmentCopy> = {
  transparent: {
    id: "transparent",
    family: "curtain",
    label: "Transparant",
    tagline: "Lichtdoorlatend en luchtig",
    description:
      "Maximale lichtinval met een zachte, verfijnde afwerking. Het raam en het licht blijven grotendeels zichtbaar door de stof.",
    bullets: ["Zeer veel lichtdoorlaatbaarheid", "Lichte privacy", "Subtiele plooival"],
  },
  semi_transparent: {
    id: "semi_transparent",
    family: "curtain",
    label: "Semi-transparant",
    tagline: "Meer privacy, nog steeds lichtinval",
    description:
      "Een gebalanceerde keuze: het raam wordt gedeeltelijk afgeschermd terwijl daglicht zacht binnenvalt.",
    bullets: ["Gemiddelde lichtdoorlaatbaarheid", "Duidelijk meer privacy", "Realistische stofstructuur"],
  },
  blackout: {
    id: "blackout",
    family: "curtain",
    label: "Blackout",
    tagline: "Maximale verduistering en privacy",
    description:
      "Zware, verzwaarde stof die het raam grotendeels afschermt voor optimale rust en privacy.",
    bullets: ["Zeer weinig lichtdoorlaatbaarheid", "Zwaardere stof", "Correcte schaduwwerking"],
  },
  wooden_blind_35mm: {
    id: "wooden_blind_35mm",
    family: "wooden_blind",
    label: "Houten jaloezie 35mm",
    tagline: "Fijne lamellen, tijdloos",
    description:
      "Smalle houten lamellen van 35mm voor een verfijnde, traditionele uitstraling met nauwkeurige lichtregeling.",
    bullets: ["Fijne lamelbreedte", "Precieze lichtregeling", "Tijdloze houtnerf"],
  },
  wooden_blind_50mm: {
    id: "wooden_blind_50mm",
    family: "wooden_blind",
    label: "Houten jaloezie 50mm",
    tagline: "De klassieke, veelzijdige maat",
    description:
      "De meest gekozen lamelbreedte: een evenwichtige, hedendaagse look die in vrijwel elk interieur past.",
    bullets: ["Populairste lamelbreedte", "Hedendaagse uitstraling", "Warme houtstructuur"],
  },
  wooden_blind_63mm: {
    id: "wooden_blind_63mm",
    family: "wooden_blind",
    label: "Houten jaloezie 63mm",
    tagline: "Statement lamellen, architecturaal",
    description:
      "Brede lamellen van 63mm voor een gedurfde, architecturale uitstraling met een geprononceerde houtnerf.",
    bullets: ["Brede statement-lamellen", "Architecturale look", "Geprononceerde houtnerf"],
  },
};

/** Family groupings + order for the UI selector. */
export const TREATMENT_FAMILIES: { family: TreatmentFamily; label: string; types: TreatmentTypeId[] }[] = [
  { family: "curtain", label: "Gordijnen", types: ["transparent", "semi_transparent", "blackout"] },
  {
    family: "wooden_blind",
    label: "Houten jaloezieën",
    types: ["wooden_blind_35mm", "wooden_blind_50mm", "wooden_blind_63mm"],
  },
];

/**
 * Physical properties per treatment type AND state (open/closed), used to
 * build the AI edit prompt. Kept separate from the UI copy above so prompt
 * wording can be tuned for photorealism without touching customer-facing
 * text. Curtains "open" means drawn aside and gathered at the window's
 * edges; wooden blinds "open" means the slats tilted so light passes
 * between them (not raised out of the window).
 */
export const TREATMENT_PHYSICAL_PROPERTIES: Record<TreatmentTypeId, Record<TreatmentState, string>> = {
  transparent: {
    closed:
      "A sheer, lightweight voile curtain with very high light transmission, drawn fully closed across the window. The window and the light source behind it must remain largely visible through the fabric. Soft, thin folds. Subtle natural fabric sheen. Almost no reduction in the room's ambient brightness.",
    open:
      "A sheer, lightweight voile curtain drawn open and gathered in soft folds at each side of the window frame, leaving the window and view essentially unobstructed. The fabric panels remain visible framing the window, not fully removed.",
  },
  semi_transparent: {
    closed:
      "A mid-weight linen-blend curtain with moderate light transmission, drawn fully closed across the window. The window is partially obscured — outlines of light stay visible but direct view through the fabric is diffused. Realistic woven fabric texture with natural, fuller folds than a sheer voile.",
    open:
      "A mid-weight linen-blend curtain drawn open and gathered into fuller folds bunched at each side of the window frame, leaving the window and view unobstructed. Realistic woven fabric texture visible in the gathered folds.",
  },
  blackout: {
    closed:
      "A heavy, densely-woven blackout curtain with very low light transmission, drawn fully closed across the window. The window is almost entirely obscured by the fabric. Visibly thicker, weightier material with deep, structured folds and correct self-shadowing.",
    open:
      "A heavy, densely-woven blackout curtain drawn open and stacked in thick, structured folds at each side of the window frame, leaving the window and view fully unobstructed. The curtain rod or track remains visible above the window.",
  },
  wooden_blind_35mm: {
    closed:
      "Horizontal wooden venetian blind slats, 35mm wide, tilted fully closed and stacked edge-to-edge, completely blocking the view through the window. Natural wood grain and warm tone, mounted at the top of the window frame. Fine, tightly-spaced slats giving a neat, traditional appearance with subtle horizontal shadow lines between slats.",
    open:
      "Horizontal wooden venetian blind slats, 35mm wide, tilted open so light and the outside view pass through in narrow horizontal bands between the slats. The slats remain at full height across the window (not raised up), natural wood grain visible on each slat edge.",
  },
  wooden_blind_50mm: {
    closed:
      "Horizontal wooden venetian blind slats, 50mm wide, tilted fully closed and stacked edge-to-edge, completely blocking the view through the window. Natural wood grain and warm tone, mounted at the top of the window frame. A contemporary, evenly-spaced slat pattern with clear horizontal shadow lines between slats.",
    open:
      "Horizontal wooden venetian blind slats, 50mm wide, tilted open so light and the outside view pass through in horizontal bands between the slats. The slats remain at full height across the window (not raised up), warm wood grain visible on each slat edge.",
  },
  wooden_blind_63mm: {
    closed:
      "Horizontal wooden venetian blind slats, 63mm wide, tilted fully closed and stacked edge-to-edge, completely blocking the view through the window. Bold, architectural presence with strongly visible individual slats, pronounced wood grain, and deep horizontal shadow lines — a premium, statement look.",
    open:
      "Horizontal wooden venetian blind slats, 63mm wide, tilted open so light and the outside view pass through in wide horizontal bands between the slats, casting a bold striped shadow pattern into the room. The slats remain at full height across the window (not raised up).",
  },
};
