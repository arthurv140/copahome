import { getProductById } from "@/lib/treatments";
import type { Product, TreatmentState, TreatmentTypeId } from "@/types/product";

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_TREATMENT_TYPES: TreatmentTypeId[] = [
  "transparent",
  "semi_transparent",
  "dim_out",
  "blackout",
  "wooden_blind_35mm",
  "wooden_blind_50mm",
  "wooden_blind_63mm",
];
export const ALLOWED_TREATMENT_STATES: TreatmentState[] = ["closed", "open"];

/** Decoded-bytes cap. Client resizes before upload (see lib/image-client.ts) so this is a hard safety ceiling, not the expected size. */
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/** Rough byte size of a base64 string once decoded, without actually decoding it. */
export function estimateBase64Bytes(base64: string): number {
  const len = base64.length;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return (len * 3) / 4 - padding;
}

export function validateImagePayload(mimeType: unknown, imageBase64: unknown): { mimeType: string; imageBase64: string } {
  if (typeof mimeType !== "string" || !ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    throw new ValidationError("Ongeldig bestandstype. Gebruik JPG, PNG of WebP.");
  }
  if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
    throw new ValidationError("Geen afbeelding ontvangen.");
  }
  // Basic sanity check that this looks like base64 (not a data: URL, no stray whitespace).
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64)) {
    throw new ValidationError("De afbeelding kon niet gelezen worden.");
  }
  if (estimateBase64Bytes(imageBase64) > MAX_IMAGE_BYTES) {
    throw new ValidationError("De afbeelding is te groot. Probeer een kleinere foto (max. ~12MB).");
  }
  return { mimeType, imageBase64 };
}

export function validateTreatmentType(value: unknown): TreatmentTypeId {
  if (typeof value !== "string" || !ALLOWED_TREATMENT_TYPES.includes(value as TreatmentTypeId)) {
    throw new ValidationError("Ongeldig type raamdecoratie.");
  }
  return value as TreatmentTypeId;
}

export function validateTreatmentState(value: unknown): TreatmentState {
  if (typeof value !== "string" || !ALLOWED_TREATMENT_STATES.includes(value as TreatmentState)) {
    throw new ValidationError("Ongeldige stand (open/toe).");
  }
  return value as TreatmentState;
}

/**
 * Resolves a client-supplied product id against the server-side catalog —
 * the client never sends product details directly, only an id, so the
 * fabric/color/material fed into the AI prompt always comes from a trusted
 * source. `value` is optional (undefined when the customer hasn't picked a
 * specific fabric yet); it must belong to the given treatment type when present.
 */
export function validateProductId(value: unknown, treatmentType: TreatmentTypeId): Product | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new ValidationError("Ongeldige stofkeuze.");
  }
  const product = getProductById(value);
  if (!product || product.category !== treatmentType) {
    throw new ValidationError("Ongeldige stofkeuze.");
  }
  return product;
}
