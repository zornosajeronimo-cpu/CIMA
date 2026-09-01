// ============================================================
// CIMA AI Provider — Abstract interface
// Plug-and-play: MockAIProvider, OpenAIProvider, AnthropicProvider, GeminiProvider
// The rest of the system NEVER imports a specific provider directly.
// ============================================================

import type { AIResponse } from '@/models/aiResponse';

export interface AIRequest {
  /** The raw command text from the user */
  commandText: string;
  /** Scoped context: only what's relevant for this command */
  context: Record<string, unknown>;
  /** Available tool names the AI can propose */
  availableTools: string[];
  /** System instructions */
  systemPrompt?: string;
}

export interface AIProvider {
  readonly id: string;
  /** Process a command and return a structured AIResponse (never free text control) */
  process(request: AIRequest): Promise<AIResponse>;
}
