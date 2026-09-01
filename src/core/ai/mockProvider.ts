import type { AIProvider, AIGenerateOptions } from './provider';

export class MockAIProvider implements AIProvider {
  async generate(options: AIGenerateOptions): Promise<string> {
    const last = options.messages[options.messages.length - 1]?.content ?? '';
    return `[MOCK] Processed: "${last.slice(0, 60)}${last.length > 60 ? '...' : ''}"\n\nThis is a simulated AI response. Connect a real AI provider in Paso 1.`;
  }

  async classify(text: string, labels: string[]): Promise<string> {
    const lower = text.toLowerCase();
    for (const label of labels) {
      if (lower.includes(label.toLowerCase().split('_')[1] ?? '')) return label;
    }
    return labels[labels.length - 1] ?? 'UNKNOWN';
  }

  async extract<T>(_text: string, schema: Record<string, string>): Promise<T> {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(schema)) result[key] = null;
    return result as T;
  }
}

export const mockAI = new MockAIProvider();
