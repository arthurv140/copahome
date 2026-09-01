import type { CurtainTypeId } from "@/types/product";
import { GeminiProvider } from "./gemini";
import type {
  AIProvider,
  AnalyzeRoomInput,
  GenerateVisualizationParams,
  GenerateVisualizationResult,
  RoomAnalysis,
} from "../types";

const IMAGE_MODEL_URL = "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix";

/**
 * Short, imperative instructions — instruct-pix2pix is an instruction-editing
 * model trained on commands like "turn the sky purple", not long descriptive
 * prompts, so this intentionally does NOT reuse the detailed
 * buildEditPrompt() used for Gemini/OpenAI.
 */
const INSTRUCT_PIX2PIX_PROMPTS: Record<CurtainTypeId, string> = {
  transparent: "add sheer, lightweight white curtains hanging beside the window, letting light pass through",
  semi_transparent: "add semi-transparent linen curtains hanging over the window, partially covering it",
  blackout: "add heavy, dark blackout curtains covering the window completely",
};

/**
 * Free-tier experimental provider: analysis (window detection) still goes
 * through Gemini's text/vision endpoint, which has a genuinely free quota
 * (confirmed working without billing) — only image generation, which Google
 * and OpenAI both gate behind a paid account, is routed to a free
 * Hugging Face-hosted open model instead.
 *
 * Tradeoffs vs. the Gemini/OpenAI providers, by design of the free tier:
 * - Lower photorealism/quality (smaller open model, no scene-preservation
 *   guarantees — instruct-pix2pix can shift more of the frame than an
 *   instruction-tuned frontier model would).
 * - Hugging Face's shared free inference API can return 503 while a model
 *   "warms up" on first use — this implementation retries once after the
 *   wait time the API reports.
 * - Requires both GEMINI_API_KEY (free) and HF_API_TOKEN (free, no card,
 *   from https://huggingface.co/settings/tokens).
 */
export class HuggingFaceProvider implements AIProvider {
  name = "huggingface";

  private hfToken: string;
  private analysisProvider: GeminiProvider;

  constructor() {
    const hfToken = process.env.HF_API_TOKEN;
    if (!hfToken) {
      throw new Error("HF_API_TOKEN is not set");
    }
    this.hfToken = hfToken;
    // Reuses Gemini for analysis only — throws here (caught by the provider
    // factory) if GEMINI_API_KEY is also missing, same as the Gemini provider.
    this.analysisProvider = new GeminiProvider();
  }

  async analyzeRoom(input: AnalyzeRoomInput): Promise<RoomAnalysis> {
    return this.analysisProvider.analyzeRoom(input);
  }

  async generateVisualization(
    params: GenerateVisualizationParams,
  ): Promise<GenerateVisualizationResult> {
    const instruction = INSTRUCT_PIX2PIX_PROMPTS[params.curtainType];

    const callOnce = () =>
      fetch(IMAGE_MODEL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: params.imageBase64,
          parameters: { prompt: instruction },
        }),
      });

    let res = await callOnce();

    // Free shared inference API returns 503 with an estimated_time while a
    // model spins up on first use — wait once, then retry.
    if (res.status === 503) {
      const body = await res.json().catch(() => ({}) as { estimated_time?: number });
      const waitSeconds = Math.min(body.estimated_time ?? 20, 30);
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
      res = await callOnce();
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Hugging Face API error (${res.status}): ${errText.slice(0, 500)}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Hugging Face returned no image (content-type: ${contentType}): ${errText.slice(0, 500)}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return {
      imageBase64: base64,
      mimeType: contentType,
      providerNotes:
        "Gratis experimenteel model (Hugging Face) — lagere kwaliteit dan de betaalde providers, resultaten kunnen wisselvallig zijn.",
    };
  }
}
