import { CURTAIN_PHYSICAL_PROPERTIES } from "@/lib/curtains";
import type { CurtainTypeId, Product } from "@/types/product";
import type { RoomAnalysis } from "./types";

/**
 * Instruction for the vision analysis pass. Asks the model to act as the
 * "window detection / mask generation" stage of the pipeline (see README
 * pipeline diagram) and return strictly structured JSON — no pixel mask is
 * produced here, but the normalized bounding boxes + occlusion/floor-line
 * notes are what the edit prompt (below) uses to constrain the generation
 * step to the window zone only.
 */
export const ANALYSIS_SYSTEM_PROMPT = `You are a computer vision system for a Belgian window-treatment (curtains) company.
Analyze the attached interior photo and identify every window or glass door where curtains could realistically be hung.

For each one, determine:
- a tight bounding box (normalized 0-1, origin top-left)
- whether curtains already exist on it
- which foreground objects (furniture, plants, ...) partially occlude it and must stay in front of any curtain
- the normalized y-coordinate of the floor directly below the window (where a floor-length curtain would end), if visible
- a rough estimated width in meters, only if the room's perspective makes this reasonably inferable, otherwise null

Also describe the room briefly, its lighting, and its camera perspective — this will be used to keep an AI image edit consistent with the existing photo.

If you cannot confidently identify any window or glass door, return an empty "windows" array and add a clear warning explaining why (e.g. "no window visible in frame", "window fully blocked by furniture", "image too dark").

Respond ONLY with JSON matching the required schema. Do not invent windows that are not visible.`;

/** Gemini-flavored (OpenAPI-subset) structured output schema for RoomAnalysis. */
export const ANALYSIS_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    windows: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          boundingBox: {
            type: "object",
            properties: {
              xMin: { type: "number" },
              yMin: { type: "number" },
              xMax: { type: "number" },
              yMax: { type: "number" },
            },
            required: ["xMin", "yMin", "xMax", "yMax"],
          },
          floorLineY: { type: "number", nullable: true },
          hasExistingCurtains: { type: "boolean" },
          occludedBy: { type: "array", items: { type: "string" } },
          estimatedWidthMeters: { type: "number", nullable: true },
        },
        required: ["id", "label", "boundingBox", "hasExistingCurtains", "occludedBy"],
      },
    },
    roomDescription: { type: "string" },
    lightingNotes: { type: "string" },
    perspectiveNotes: { type: "string" },
    warnings: { type: "array", items: { type: "string" } },
  },
  required: ["windows", "roomDescription", "lightingNotes", "perspectiveNotes", "warnings"],
} as const;

function formatBox(box: RoomAnalysis["windows"][number]["boundingBox"]): string {
  return `x: ${box.xMin.toFixed(2)}-${box.xMax.toFixed(2)}, y: ${box.yMin.toFixed(2)}-${box.yMax.toFixed(2)} (normalized, origin top-left)`;
}

/**
 * Builds the instruction for the image-editing step. Follows the core
 * principle from the brief: "Edit the customer's existing photograph as
 * minimally as possible while realistically adding the selected curtain
 * treatment" — the photo is the source of truth, the curtain is the only
 * variable.
 */
export function buildEditPrompt(
  analysis: RoomAnalysis,
  curtainType: CurtainTypeId,
  product?: Product,
): string {
  const fabric = CURTAIN_PHYSICAL_PROPERTIES[curtainType];
  const windowLines = analysis.windows
    .map((w, i) => {
      const parts = [
        `${i + 1}. "${w.label}" at ${formatBox(w.boundingBox)}.`,
        w.hasExistingCurtains
          ? "This window already has curtains/blinds — replace them entirely with the new curtain."
          : "This window currently has no curtains.",
        w.occludedBy.length > 0
          ? `Objects in front of this window that must stay in front of the new curtain, unmodified: ${w.occludedBy.join(", ")}.`
          : "",
        w.floorLineY != null
          ? `The curtain should hang from just above the window down to approximately y=${w.floorLineY.toFixed(2)} (the floor line).`
          : "The curtain should hang from just above the window frame down to the floor.",
        w.estimatedWidthMeters
          ? `Keep the curtain width proportional to the window's real-world width of roughly ${w.estimatedWidthMeters.toFixed(1)}m.`
          : "",
      ];
      return parts.filter(Boolean).join(" ");
    })
    .join("\n");

  const productLine = product
    ? `Use this specific fabric where it does not conflict with the physical description below: ${product.name}, color ${product.color}, fabric ${product.fabric}.`
    : "";

  return `Edit this exact interior photograph. Do not generate a new room. Do not regenerate anything outside the window/curtain zones described below.

ROOM CONTEXT: ${analysis.roomDescription} Lighting: ${analysis.lightingNotes} Perspective: ${analysis.perspectiveNotes}

TASK: Add or replace window curtains on the following window(s), and nothing else:
${windowLines}

CURTAIN FABRIC TO RENDER: ${fabric}
${productLine}

STRICT RULES:
- Preserve, pixel-for-pixel where possible, everything that is not the curtain/window-treatment zone: furniture, floor, walls, ceiling, decor, lighting, plants, people or pets, architecture, camera angle and perspective must all remain identical to the original photo.
- The curtain must hang realistically from a curtain rod or rail mounted above the window frame — it must never appear to float or be pasted on flat. Include natural, physically plausible folds and correct perspective distortion matching the room.
- Respect real-world occlusion: any furniture or object already in front of the window must remain in front of the new curtain, not behind it.
- Keep the curtain's proportions realistic relative to the window's width and floor-to-window height.
- Match the new curtain's lighting, shadows and color temperature to the existing photo's light sources so it looks photographed, not composited.
- Photorealism is the top priority: the result must look like the customer's real room with different curtains, not an AI-generated interior.`;
}
