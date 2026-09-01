// ============================================================
// AI Provider Factory — reads VITE_AI_PROVIDER env var
// Swap provider by changing .env.local — no code changes needed
// ============================================================

import type { AIProvider } from './provider';
import { MockAIProvider } from './mockProvider';

function createProvider(): AIProvider {
  const providerId = (import.meta.env.VITE_AI_PROVIDER ?? 'mock') as string;

  switch (providerId) {
    case 'mock':
      return new MockAIProvider();
    // Future providers (uncomment when adding API keys):
    // case 'openai':
    //   return new OpenAIProvider(import.meta.env.VITE_OPENAI_API_KEY, import.meta.env.VITE_OPENAI_MODEL);
    // case 'anthropic':
    //   return new AnthropicProvider(import.meta.env.VITE_ANTHROPIC_API_KEY, import.meta.env.VITE_ANTHROPIC_MODEL);
    // case 'gemini':
    //   return new GeminiProvider(import.meta.env.VITE_GEMINI_API_KEY, import.meta.env.VITE_GEMINI_MODEL);
    default:
      console.warn(`[CIMA] Unknown AI provider "${providerId}", falling back to mock`);
      return new MockAIProvider();
  }
}

export const activeProvider: AIProvider = createProvider();
