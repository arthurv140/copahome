import type {
  AIProvider,
  GenerateVisualizationParams,
  GenerateVisualizationResult,
  RoomAnalysis,
} from "../types";

/**
 * No-network provider used when no AI_PROVIDER API key is configured (local
 * dev, demos, CI). It lets the full upload -> analyze -> select -> generate
 * -> before/after UI flow be exercised end to end without incurring API
 * costs or requiring secrets. It intentionally does NOT fabricate a fake
 * photorealistic edit (that would misrepresent what the real providers do)
 * — it returns the original photo back with a clear provider note that the
 * UI surfaces to the user.
 */
export class MockProvider implements AIProvider {
  name = "mock";

  async analyzeRoom(): Promise<RoomAnalysis> {
    return {
      windows: [
        {
          id: "mock-window-1",
          label: "Gedetecteerd raam (demo)",
          boundingBox: { xMin: 0.55, yMin: 0.15, xMax: 0.92, yMax: 0.78 },
          floorLineY: 0.78,
          hasExistingCurtains: false,
          occludedBy: [],
          estimatedWidthMeters: 1.6,
        },
      ],
      roomDescription: "Demo-analyse (mock provider) van de geüploade ruimte.",
      lightingNotes: "Niet geanalyseerd — mock provider actief.",
      perspectiveNotes: "Niet geanalyseerd — mock provider actief.",
      warnings: [
        "Demo-modus: geen AI-provider API key geconfigureerd. Dit is een gesimuleerde analyse, geen echte raamdetectie.",
      ],
    };
  }

  async generateVisualization(
    params: GenerateVisualizationParams,
  ): Promise<GenerateVisualizationResult> {
    return {
      imageBase64: params.imageBase64,
      mimeType: params.mimeType,
      providerNotes:
        "No AI provider is configured, so the original photo is shown. Set AI_PROVIDER and its API key to generate real visualisations (see README).",
    };
  }
}
