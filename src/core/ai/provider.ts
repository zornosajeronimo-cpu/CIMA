export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIGenerateOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  generate(options: AIGenerateOptions): Promise<string>;
  classify(text: string, labels: string[]): Promise<string>;
  extract<T>(text: string, schema: Record<string, string>): Promise<T>;
}
