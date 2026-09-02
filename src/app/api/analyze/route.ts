import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";
import { getAIProvider } from "@/lib/ai/provider";
import { NoWindowDetectedError } from "@/lib/ai/types";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";
import { ValidationError, validateImagePayload } from "@/lib/validation";

const NO_WINDOW_TIPS = [
  "Take the photo facing the window straight on.",
  "Make sure the entire window is visible.",
  "Avoid extremely dark photos.",
  "Make sure the window isn't fully hidden behind furniture.",
];

export async function POST(request: Request) {
  const rate = checkRateLimit(`analyze:${getClientKey(request)}`, 30, 10 * 60 * 1000);
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
  const { mimeType: rawMime, imageBase64: rawImage } = (body ?? {}) as Record<string, unknown>;

  let mimeType: string;
  let imageBase64: string;
  try {
    ({ mimeType, imageBase64 } = validateImagePayload(rawMime, rawImage));
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  trackEvent({ type: "photo_uploaded" });

  try {
    const provider = getAIProvider();
    const analysis = await provider.analyzeRoom({ mimeType, imageBase64 });
    trackEvent({ type: "analysis_completed", windowCount: analysis.windows.length });
    return NextResponse.json({ analysis });
  } catch (err) {
    if (err instanceof NoWindowDetectedError) {
      trackEvent({ type: "analysis_failed", reason: "no_window_detected" });
      return NextResponse.json(
        {
          error:
            "We couldn't clearly recognise the window in this photo. Please try a photo where the window is clearly visible.",
          tips: NO_WINDOW_TIPS,
        },
        { status: 422 },
      );
    }

    console.error("[/api/analyze]", err);
    trackEvent({ type: "analysis_failed", reason: "provider_error" });
    return NextResponse.json(
      { error: "Something went wrong while analysing this photo. Please try again." },
      { status: 502 },
    );
  }
}
