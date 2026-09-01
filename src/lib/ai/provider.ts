import { GeminiProvider } from "./providers/gemini";
import { MockProvider } from "./providers/mock";
import { OpenAIProvider } from "./providers/openai";
import type { AIProvider } from "./types";

let cachedProvider: AIProvider | null = null;

/**
 * Selects the AI provider via the AI_PROVIDER env var. Falls back to the
 * mock provider (no network, no cost) whenever a provider's required key is
 * missing, so the app always boots and is demoable — but logs a warning so
 * this is never silently mistaken for a real deployment.
 */
export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const requested = (process.env.AI_PROVIDER || "gemini").toLowerCase();

  try {
    switch (requested) {
      case "gemini":
        cachedProvider = new GeminiProvider();
        break;
      case "openai":
        cachedProvider = new OpenAIProvider();
        break;
      case "mock":
        cachedProvider = new MockProvider();
        break;
      default:
        console.warn(`Unknown AI_PROVIDER "${requested}", falling back to mock.`);
        cachedProvider = new MockProvider();
    }
  } catch (err) {
    console.warn(
      `AI provider "${requested}" could not be initialized (${(err as Error).message}). Falling back to mock provider.`,
    );
    cachedProvider = new MockProvider();
  }

  return cachedProvider;
}
