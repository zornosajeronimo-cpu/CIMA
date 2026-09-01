import type { AIProvider } from './provider';
import { MockAIProvider } from './mockProvider';
import { GeminiProvider } from './geminiProvider';
import { AnthropicProvider } from './anthropicProvider';

function createProvider(): AIProvider {
  const providerId = (import.meta.env.VITE_AI_PROVIDER ?? 'mock') as string;

  switch (providerId) {
    case 'gemini': {
      // Recolectar hasta 7 llaves de Gemini del .env
      const geminiKeys = [
        import.meta.env.VITE_GEMINI_API_KEY_1,
        import.meta.env.VITE_GEMINI_API_KEY_2,
        import.meta.env.VITE_GEMINI_API_KEY_3,
        import.meta.env.VITE_GEMINI_API_KEY_4,
        import.meta.env.VITE_GEMINI_API_KEY_5,
        import.meta.env.VITE_GEMINI_API_KEY_6,
        import.meta.env.VITE_GEMINI_API_KEY_7,
      ].filter((k): k is string => typeof k === 'string' && k.trim().length > 0);

      if (geminiKeys.length === 0) {
        console.warn('[CIMA] No se encontraron llaves de Gemini. Cayendo a mock.');
        return new MockAIProvider();
      }

      return new GeminiProvider(
        geminiKeys,
        import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-2.5-flash'
      );
    }
    case 'anthropic': {
      const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!key) {
        console.warn('[CIMA] No hay llave de Anthropic. Cayendo a mock.');
        return new MockAIProvider();
      }
      return new AnthropicProvider(
        key,
        import.meta.env.VITE_ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022'
      );
    }
    case 'mock':
    default:
      if (providerId !== 'mock') {
        console.warn(`[CIMA] Proveedor "${providerId}" desconocido, cayendo a mock`);
      }
      return new MockAIProvider();
  }
}

export const activeProvider: AIProvider = createProvider();
