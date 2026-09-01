import type { CurtainTypeId } from "@/types/product";

/**
 * Structured product analytics events (brief section 30: uploads,
 * visualizations by curtain type, conversion to contact/sample requests).
 *
 * MVP sink is a structured console log — safe by construction (no image
 * bytes, no PII beyond what the caller explicitly passes) and easy to grep
 * in server logs. Swap `trackEvent`'s body for a real sink (PostHog, GA4,
 * a server-side events table) later without touching call sites.
 */
export type AnalyticsEvent =
  | { type: "photo_uploaded" }
  | { type: "analysis_completed"; windowCount: number }
  | { type: "analysis_failed"; reason: string }
  | { type: "visualization_generated"; curtainType: CurtainTypeId }
  | { type: "visualization_failed"; curtainType: CurtainTypeId; reason: string }
  | { type: "cta_clicked"; cta: "collection" | "advice" | "sample_request" };

export function trackEvent(event: AnalyticsEvent): void {
  try {
    console.log(JSON.stringify({ event: "copahome_visualizer", ts: new Date().toISOString(), ...event }));
  } catch {
    // Analytics must never break the user-facing flow.
  }
}
