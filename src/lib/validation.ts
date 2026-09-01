import type { CurtainTypeId } from "@/types/product";

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_CURTAIN_TYPES: CurtainTypeId[] = ["transparent", "semi_transparent", "blackout"];

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

export function validateCurtainType(value: unknown): CurtainTypeId {
  if (typeof value !== "string" || !ALLOWED_CURTAIN_TYPES.includes(value as CurtainTypeId)) {
    throw new ValidationError("Ongeldig gordijntype.");
  }
  return value as CurtainTypeId;
}
