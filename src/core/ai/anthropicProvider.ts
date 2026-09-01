import type { AIProvider, AIRequest } from './provider';
import type { AIResponse } from '@/models/aiResponse';
import { ToolRegistry } from '@/core/tools/registry';

export class AnthropicProvider implements AIProvider {
  readonly id = 'anthropic';

  constructor(private apiKey: string, private model: string = 'claude-3-5-sonnet-20241022') {}

  async process(request: AIRequest): Promise<AIResponse> {
    const startMs = Date.now();
    const endpoint = 'https://api.anthropic.com/v1/messages';

    const toolsDescription = ToolRegistry.all().map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));

    const systemPrompt = request.systemPrompt ?? `
Eres CIMA OS. Interpretas comandos y devuelves JSON.
IDIOMA: Español.

CONTEXTO DEL SISTEMA:
${JSON.stringify(request.context, null, 2)}

HERRAMIENTAS:
${JSON.stringify(toolsDescription, null, 2)}

RESPONDE CON ESTE JSON EXACTO (usa EXACTAMENTE estos nombres de campo):
{
  "message": "Qué vas a hacer, en español",
  "intent": {
    "type": "RESEARCH",
    "confidence": 0.95,
    "entities": {}
  },
  "actions": [
    {
      "tool": "investigateCompany",
      "parameters": {"companyName": "Ejemplo S.A.S."},
      "reason": "Investigar la empresa solicitada"
    }
  ]
}

IMPORTANTE:
- Usa EXACTAMENTE los nombres: "message", "intent", "actions", "tool", "parameters", "reason"
- "actions" siempre es un ARRAY []
- "parameters" siempre es un OBJETO {}
- Si no hay acción, usa "actions": []
- Todo en ESPAÑOL
`;

    const body = {
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: request.commandText },
        { role: 'assistant', content: '{' }
      ],
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerously-allow-browser': 'true'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error de la API de Anthropic: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    let candidateText = data.content?.[0]?.text;

    if (!candidateText) {
      throw new Error('No se recibió una respuesta válida de Anthropic.');
    }

    // Since we prefilled with "{", we must prepend it back for valid JSON parsing
    candidateText = '{' + candidateText;

    try {
      // Limpiar posibles bloques de markdown
      const cleaned = candidateText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      return {
        ...parsed,
        meta: {
          modelId: this.model,
          latencyMs: Date.now() - startMs,
          contextTokensEstimate: Math.floor(JSON.stringify(request.context).length / 4) + 200,
          timestamp: new Date().toISOString(),
        }
      };
    } catch {
      throw new Error(`Error al parsear el JSON de Anthropic: ${candidateText.slice(0, 300)}`);
    }
  }
}
