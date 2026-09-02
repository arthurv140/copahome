import { buildEditPrompt } from "../prompts";
import {
  NoWindowDetectedError,
  type AIProvider,
  type AnalyzeRoomInput,
  type GenerateVisualizationParams,
  type GenerateVisualizationResult,
  type RoomAnalysis,
} from "../types";

const CHAT_URL = "https://api.openai.com/v1/chat/completions";
const EDIT_URL = "https://api.openai.com/v1/images/edits";

const ANALYSIS_JSON_INSTRUCTIONS = `Respond ONLY with a single JSON object with this exact shape (no markdown, no prose):
{
  "windows": [
    {
      "id": string,
      "label": string,
      "boundingBox": { "xMin": number, "yMin": number, "xMax": number, "yMax": number },
      "floorLineY": number | null,
      "hasExistingCurtains": boolean,
      "occludedBy": string[],
      "estimatedWidthMeters": number | null
    }
  ],
  "roomDescription": string,
  "lightingNotes": string,
  "perspectiveNotes": string,
  "warnings": string[]
}
All bounding box and floorLineY values are normalized 0-1, origin top-left. If no window is visible, return an empty "windows" array and explain why in "warnings".`;

/**
 * Secondary/fallback provider using OpenAI (gpt-4o vision for analysis,
 * gpt-image-1 edits for generation). Kept behind the same AIProvider
 * interface as Gemini so AI_PROVIDER=openai is a drop-in swap. Scene
 * preservation is generally less reliable than Gemini 2.5 Flash Image for
 * this "edit only the curtains" use case since gpt-image-1's edit endpoint
 * without an explicit pixel mask re-renders more of the frame — see README
 * for the full comparison. Prefer Gemini for production; this exists mainly
 * so the architecture is verifiably provider-agnostic.
 */
export class OpenAIProvider implements AIProvider {
  name = "openai";

  private apiKey: string;
  private analysisModel: string;
  private imageModel: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    this.apiKey = apiKey;
    this.analysisModel = process.env.OPENAI_ANALYSIS_MODEL || "gpt-4o";
    this.imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
  }

  async analyzeRoom(input: AnalyzeRoomInput): Promise<RoomAnalysis> {
    const res = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.analysisModel,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a computer vision system for a Belgian window-treatment company, detecting windows and glass doors suitable for curtains in interior photos. " +
              ANALYSIS_JSON_INSTRUCTIONS,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this interior photo." },
              { type: "image_url", image_url: { url: `data:${input.mimeType};base64,${input.imageBase64}` } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenAI analysis error (${res.status}): ${errText.slice(0, 500)}`);
    }

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content;
    if (!text) throw new Error("OpenAI returned no analysis content");

    let parsed: RoomAnalysis;
    try {
      parsed = JSON.parse(text) as RoomAnalysis;
    } catch {
      throw new Error("OpenAI returned malformed analysis JSON");
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
    const prompt = buildEditPrompt(
      params.analysis,
      params.treatmentType,
      params.state,
      params.product,
      params.curtainFinish && params.fullness ? { finish: params.curtainFinish, fullness: params.fullness } : undefined,
    );

    const imageBuffer = Buffer.from(params.imageBase64, "base64");
    const form = new FormData();
    form.append("model", this.imageModel);
    form.append("prompt", prompt);
    form.append(
      "image",
      new Blob([new Uint8Array(imageBuffer)], { type: params.mimeType }),
      "room.png",
    );

    const res = await fetch(EDIT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenAI image edit error (${res.status}): ${errText.slice(0, 500)}`);
    }

    const json = await res.json();
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no generated image");

    return { imageBase64: b64, mimeType: "image/png" };
  }
}
