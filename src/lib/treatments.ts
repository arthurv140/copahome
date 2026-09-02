import type { Product, TreatmentFamily, TreatmentState, TreatmentTypeId } from "@/types/product";

/**
 * The product catalog: every purchasable fabric/slat option, modeled as a
 * Product (see src/types/product.ts). This is a real (if small) test of the
 * catalog this was built for — Benares/Elite/Bologna are actual Copahome
 * fabric samples, not placeholders. Multiple products can share a
 * `category` (e.g. Elite and Bologna are both "semi_transparent") — the UI
 * lets the customer pick a specific fabric within a category, defaulting to
 * the first one. Adding a new fabric is one more entry here; adding a new
 * category is one more TreatmentTypeId + an entry in TREATMENT_COPY /
 * TREATMENT_PHYSICAL_PROPERTIES below.
 */
export const PRODUCTS: Product[] = [
  {
    id: "copahome-elite",
    name: "Elite",
    collection: "Copahome",
    family: "curtain",
    category: "semi_transparent",
    transparency: "medium",
    color: "Warm beige/taupe",
    // Product-authored AI reference description (kept in English, matching the
    // rest of the edit prompt) — supersedes an earlier guess made from the
    // sample photo alone (which incorrectly assumed a visible lurex sparkle
    // thread; the actual fabric is matte with very low sheen).
    fabric:
      "ELITE curtain fabric — preserve the exact visual characteristics of the reference fabric. A premium, natural-look woven curtain fabric in a warm neutral beige/taupe colour. Fine, dense micro-weave with a clearly visible open textile structure. Subtle irregularity in the yarn gives the fabric an authentic natural and linen-inspired appearance. Matte surface, very low sheen, soft tactile appearance. Lightweight and flexible construction with an elegant, fluid drape and natural vertical folds. Semi-transparent / light-filtering fabric: daylight passes through the fabric softly, creating a gentle diffused glow. Objects and silhouettes behind the curtain remain partially visible but blurred and softened. The fabric provides privacy through visual diffusion rather than opacity. The weave must remain realistic and consistent across the entire curtain. Preserve the warm beige/taupe colour and natural tonal variation. The fabric should look like a real high-quality architectural interior textile, not a digital texture. Do not make the fabric thicker, heavier, darker or more opaque than the reference. Do not introduce patterns, stripes, embroidery or decorative motifs. No satin sheen, no velvet effect, no blackout appearance, no plastic texture, no artificial smoothness. The final curtain must behave physically like a lightweight woven textile: soft folds, natural gravity, realistic tension and realistic light transmission.",
  },
  {
    id: "copahome-bologna",
    name: "Bologna",
    collection: "Copahome",
    family: "curtain",
    category: "semi_transparent",
    transparency: "medium",
    color: "Natural ecru/off-white",
    fabric:
      "Fine, evenly and tightly woven linen-look fabric (plain weave, not knit) — an even, visible cross-thread texture with no sheen or glitter thread. Consistent light transmission across the entire fabric (no uneven gaps as with a coarser weave). Soft, straight fold.",
  },
  {
    id: "copahome-benares",
    name: "Benares",
    collection: "Copahome",
    family: "curtain",
    category: "dim_out",
    transparency: "low",
    color: "Dark olive / taupe / warm brown melange",
    // Product-authored AI reference description, same treatment as Elite.
    fabric:
      "BENARES curtain fabric — a premium, richly textured decorative woven fabric with a sophisticated dark olive, taupe and warm brown colour palette. The fabric has a complex, irregular melange effect created by the combination of subtly contrasting yarns. Its surface shows an organic, abstract woven pattern consisting of irregular horizontal and vertical tonal blocks and softly blurred rectangular areas. The pattern is integrated into the weave itself and must never appear printed, geometric or sharply defined. The fabric has a dense, substantial textile construction with a refined coarse micro-texture. Individual yarns are subtly visible, creating depth, dimension and a tactile, natural appearance. The surface is predominantly matte with only a very subtle natural textile reflection. The colour is not uniform: it contains nuanced variations between deep olive-brown, charcoal-taupe, muted khaki and warm beige-brown tones, producing a sophisticated lived-in appearance. BENARES should have a medium-heavy, luxurious drape with soft but structured vertical folds, hanging naturally under gravity with enough body for elegant, full folds rather than appearing thin or flimsy. Light transmission is extremely low — this is near-total blackout, not a light-filtering fabric: the closed window must appear almost completely obscured, with at most the faintest whisper of diffused glow at the very thinnest points of the weave, and no clearly visible daylight, silhouette, or view through the fabric. Err strongly toward too opaque rather than too transparent — this fabric should read visually much closer to a true blackout curtain than to a dim-out or semi-transparent one. Preserve the characteristic irregular woven melange and tonal block effect across the entire curtain — organic and softly blended, no repetitive digital pattern. Do not make it look like wallpaper, printed fabric, velvet, linen, satin or a smooth solid-colour textile. No gloss, no metallic effect, no sharp geometric graphics, no artificial texture.",
  },
  // Placeholder fabrics for categories with no real sample yet — replace as
  // physical samples come in, same way Elite/Bologna/Benares did.
  {
    id: "copahome-transparant-default",
    name: "Transparent voile",
    collection: "Copahome Essentials",
    family: "curtain",
    category: "transparent",
    transparency: "high",
    color: "Natural white",
    fabric: "Light voile",
  },
  {
    id: "copahome-blackout-default",
    name: "Blackout",
    collection: "Copahome Essentials",
    family: "curtain",
    category: "blackout",
    transparency: "low",
    color: "Anthracite",
    fabric: "Weighted blackout fabric",
  },
  {
    id: "copahome-houten-jaloezie-35mm-default",
    name: "Wooden blind 35mm",
    collection: "Copahome Essentials",
    family: "wooden_blind",
    category: "wooden_blind_35mm",
    slatWidthMm: 35,
    color: "Natural oak",
    material: "Solid wood",
  },
  {
    id: "copahome-houten-jaloezie-50mm-default",
    name: "Wooden blind 50mm",
    collection: "Copahome Essentials",
    family: "wooden_blind",
    category: "wooden_blind_50mm",
    slatWidthMm: 50,
    color: "Natural oak",
    material: "Solid wood",
  },
  {
    id: "copahome-houten-jaloezie-63mm-default",
    name: "Wooden blind 63mm",
    collection: "Copahome Essentials",
    family: "wooden_blind",
    category: "wooden_blind_63mm",
    slatWidthMm: 63,
    color: "Natural oak",
    material: "Solid wood",
  },
];

export function getProductsForType(type: TreatmentTypeId): Product[] {
  return PRODUCTS.filter((p) => p.category === type);
}

/** The fabric used when the customer hasn't picked a specific one within a category. */
export function getDefaultProduct(type: TreatmentTypeId): Product {
  const product = getProductsForType(type)[0];
  if (!product) throw new Error(`No product configured for treatment type "${type}"`);
  return product;
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

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
    label: "Transparent",
    tagline: "Light and airy",
    description:
      "Maximum daylight with a soft, refined finish. The window and the light stay largely visible through the fabric.",
    bullets: ["Very high light transmission", "Light privacy", "Subtle fold"],
  },
  semi_transparent: {
    id: "semi_transparent",
    family: "curtain",
    label: "Semi-transparent",
    tagline: "More privacy, soft daylight",
    description:
      "A balanced choice: the window is partially screened while daylight still filters through gently.",
    bullets: ["Medium light transmission", "Noticeably more privacy", "Realistic fabric texture"],
  },
  dim_out: {
    id: "dim_out",
    family: "curtain",
    label: "Dim-out",
    tagline: "Strongly dimming, not fully blackout",
    description:
      "A tightly woven fabric that blocks most light and view from outside, while retaining a soft glow — between semi-transparent and blackout.",
    bullets: ["Strongly reduced daylight", "High privacy", "A soft residual glow"],
  },
  blackout: {
    id: "blackout",
    family: "curtain",
    label: "Blackout",
    tagline: "Maximum darkness and privacy",
    description:
      "A heavy, weighted fabric that largely screens the window for optimal rest and privacy.",
    bullets: ["Minimal light transmission", "Heavier fabric", "Accurate shadow behaviour"],
  },
  wooden_blind_35mm: {
    id: "wooden_blind_35mm",
    family: "wooden_blind",
    label: "Wooden blind 35mm",
    tagline: "Fine slats, timeless",
    description:
      "Narrow 35mm wooden slats for a refined, traditional look with precise light control.",
    bullets: ["Fine slat width", "Precise light control", "Timeless wood grain"],
  },
  wooden_blind_50mm: {
    id: "wooden_blind_50mm",
    family: "wooden_blind",
    label: "Wooden blind 50mm",
    tagline: "The classic, versatile size",
    description:
      "The most popular slat width: a balanced, contemporary look that suits almost any interior.",
    bullets: ["Most popular width", "Contemporary look", "Warm wood texture"],
  },
  wooden_blind_63mm: {
    id: "wooden_blind_63mm",
    family: "wooden_blind",
    label: "Wooden blind 63mm",
    tagline: "Statement slats, architectural",
    description:
      "Wide 63mm slats for a bold, architectural look with a pronounced wood grain.",
    bullets: ["Wide statement slats", "Architectural look", "Pronounced wood grain"],
  },
};

/** Family groupings + order for the UI selector. */
export const TREATMENT_FAMILIES: { family: TreatmentFamily; label: string; types: TreatmentTypeId[] }[] = [
  { family: "curtain", label: "Curtains", types: ["transparent", "semi_transparent", "dim_out", "blackout"] },
  {
    family: "wooden_blind",
    label: "Wooden blinds",
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
      "A mid-weight, loosely-woven curtain with moderate light transmission, drawn fully closed across the window. The window is partially obscured — outlines of light stay visible but direct view through the fabric is diffused. Realistic open weave texture with natural, fuller folds than a sheer voile.",
    open:
      "A mid-weight, loosely-woven curtain drawn open and gathered into fuller folds bunched at each side of the window frame, leaving the window and view unobstructed. Realistic open weave texture visible in the gathered folds.",
  },
  dim_out: {
    closed:
      "A densely-woven, essentially opaque dim-out curtain, drawn fully closed across the window. Blocks direct view through the fabric almost entirely — treat the exact light transmission and any pattern/texture as specified by the selected fabric's own description below, which takes priority over this general one. Mid-to-heavy weight fabric with a tighter, more structured weave and moderate folds, noticeably denser in texture than a sheer or semi-transparent curtain.",
    open:
      "A densely-woven, essentially opaque dim-out curtain drawn open and gathered into moderate, structured folds bunched at each side of the window frame, leaving the window and view unobstructed. The tighter weave, body, and any pattern of the fabric (per the selected fabric's own description below) remain visible in the gathered folds.",
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
