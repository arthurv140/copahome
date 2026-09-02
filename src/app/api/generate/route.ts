import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";
import { getAIProvider } from "@/lib/ai/provider";
import type { RoomAnalysis } from "@/lib/ai/types";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";
import { DEFAULT_CURTAIN_FINISH, DEFAULT_CURTAIN_FULLNESS, getDefaultProduct, hasCurtainConstruction } from "@/lib/treatments";
import {
  ValidationError,
  validateCurtainFinish,
  validateCurtainFullness,
  validateImagePayload,
  validateProductId,
  validateTreatmentState,
  validateTreatmentType,
} from "@/lib/validation";

function isRoomAnalysis(value: unknown): value is RoomAnalysis {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.windows) && typeof v.roomDescription === "string";
}

export async function POST(request: Request) {
  const rate = checkRateLimit(`generate:${getClientKey(request)}`, 20, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429, headers: rate.retryAfterSeconds ? { "Retry-After": String(rate.retryAfterSeconds) } : {} },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const {
    mimeType: rawMime,
    imageBase64: rawImage,
    treatmentType: rawTreatmentType,
    state: rawState,
    productId: rawProductId,
    curtainFinish: rawCurtainFinish,
    fullness: rawFullness,
    analysis: rawAnalysis,
  } = (body ?? {}) as Record<string, unknown>;

  let mimeType: string;
  let imageBase64: string;
  let treatmentType;
  let state;
  let product;
  let curtainFinish;
  let fullness;
  try {
    ({ mimeType, imageBase64 } = validateImagePayload(rawMime, rawImage));
    treatmentType = validateTreatmentType(rawTreatmentType);
    state = validateTreatmentState(rawState);
    product = validateProductId(rawProductId, treatmentType) ?? getDefaultProduct(treatmentType);
    // Curtain-family only — wooden blinds have no heading/fullness, so these stay undefined for them.
    if (hasCurtainConstruction(treatmentType)) {
      curtainFinish = validateCurtainFinish(rawCurtainFinish) ?? DEFAULT_CURTAIN_FINISH;
      fullness = validateCurtainFullness(rawFullness) ?? DEFAULT_CURTAIN_FULLNESS;
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  if (!isRoomAnalysis(rawAnalysis)) {
    return NextResponse.json({ error: "Missing or invalid analysis data. Please upload the photo again." }, { status: 400 });
  }

  try {
    const provider = getAIProvider();
    const result = await provider.generateVisualization({
      imageBase64,
      mimeType,
      analysis: rawAnalysis,
      treatmentType,
      state,
      product,
      curtainFinish,
      fullness,
    });
    trackEvent({ type: "visualization_generated", treatmentType });
    return NextResponse.json({
      image: { base64: result.imageBase64, mimeType: result.mimeType },
      providerNotes: result.providerNotes,
    });
  } catch (err) {
    console.error("[/api/generate]", err);
    trackEvent({ type: "visualization_failed", treatmentType, reason: "provider_error" });
    return NextResponse.json(
      { error: "Something went wrong while generating the visualisation. Please try again." },
      { status: 502 },
    );
  }
}
