import { ANALYSIS_RESPONSE_SCHEMA, ANALYSIS_SYSTEM_PROMPT, buildEditPrompt } from "../prompts";
import {
  NoWindowDetectedError,
  type AIProvider,
  type AnalyzeRoomInput,
  type GenerateVisualizationParams,
  type GenerateVisualizationResult,
  type RoomAnalysis,
} from "../types";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
}

/**
 * Google Gemini 2.5 Flash Image ("nano banana") provider.
 *
 * Chosen as the default because it is an instruction-following IMAGE EDIT
 * model rather than a pure text-to-image model: given the original photo
 * plus an edit instruction, it tends to preserve everything outside the
 * described change, which matches the brief's core principle ("edit
 * minimally, the curtain is the only variable") far better than a
 * generate-from-scratch model would, without requiring a hand-built pixel
 * inpainting mask. See README for the full provider comparison.
 */
export class GeminiProvider implements AIProvider {
  name = "gemini";

  private apiKey: string;
  private analysisModel: string;
  private imageModel: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    this.apiKey = apiKey;
    this.analysisModel = process.env.GEMINI_ANALYSIS_MODEL || "gemini-2.5-flash";
    this.imageModel = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
  }

  private async callGemini(model: string, body: Record<string, unknown>): Promise<GeminiResponse> {
    const res = await fetch(`${API_BASE}/${model}:generateContent?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Gemini API error (${res.status}) for model ${model}: ${errText.slice(0, 500)}`);
    }

    return (await res.json()) as GeminiResponse;
  }

  async analyzeRoom(input: AnalyzeRoomInput): Promise<RoomAnalysis> {
    const response = await this.callGemini(this.analysisModel, {
      contents: [
        {
          parts: [
            { text: ANALYSIS_SYSTEM_PROMPT },
            { inlineData: { mimeType: input.mimeType, data: input.imageBase64 } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_RESPONSE_SCHEMA,
      },
    });

    if (response.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked the analysis request: ${response.promptFeedback.blockReason}`);
    }

    const text = response.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
    if (!text) {
      throw new Error("Gemini returned no analysis content");
    }

    let parsed: RoomAnalysis;
    try {
      parsed = JSON.parse(text) as RoomAnalysis;
    } catch {
      throw new Error("Gemini returned malformed analysis JSON");
    }

    if (!parsed.windows || parsed.windows.length === 0) {
      throw new NoWindowDetectedError(
        parsed.warnings?.[0] || "No window could be confidently detected in this photo.",
      );
    }

    return parsed;
  }

  async generateVisualization(
    params: GenerateVisualizationParams,
  ): Promise<GenerateVisualizationResult> {
    const prompt = buildEditPrompt(params.analysis, params.curtainType, params.product);

    const response = await this.callGemini(this.imageModel, {
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: params.mimeType, data: params.imageBase64 } },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    });

    if (response.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked the generation request: ${response.promptFeedback.blockReason}`);
    }

    const imagePart = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!imagePart?.inlineData) {
      throw new Error("Gemini returned no generated image");
    }

    return {
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || "image/png",
    };
  }
}
