import type { AIProvider, AIRequest } from './provider';
import type { AIResponse } from '@/models/aiResponse';
import { ToolRegistry } from '@/core/tools/registry';

export class GeminiProvider implements AIProvider {
  readonly id = 'gemini';

  constructor(private apiKeys: string[], private model: string = 'gemini-2.5-flash') {}

  // Selecciona una llave aleatoria para distribuir la cuota
  private getRandomKey(): string {
    const randomIndex = Math.floor(Math.random() * this.apiKeys.length);
    return this.apiKeys[randomIndex];
  }

  async process(request: AIRequest): Promise<AIResponse> {
    const startMs = Date.now();
    const currentKey = this.getRandomKey();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${currentKey}`;

    const toolsDescription = ToolRegistry.all().map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));

    const systemPrompt = `
Eres CIMA OS, un sistema operativo inteligente personal para gestionar clientes, ventas, conocimiento y operaciones.
Tu trabajo es interpretar el comando del usuario, analizar el contexto provisto y retornar un objeto JSON ESTRICTO que represente tu plan de acción.

Todo tu razonamiento, análisis y mensajes deben ser SIEMPRE EN ESPAÑOL.

CONTEXTO ACTUAL:
${JSON.stringify(request.context, null, 2)}

HERRAMIENTAS DISPONIBLES:
${JSON.stringify(toolsDescription, null, 2)}

TU RESPUESTA DEBE SER UN OBJETO JSON VÁLIDO QUE CUMPLA EXACTAMENTE ESTE ESQUEMA:
{
  "message": "Explicación legible para el humano de lo que entendiste y vas a hacer (EN ESPAÑOL)",
  "intent": {
    "type": "STRING enum (ej. CLIENT_VIEW, CLIENT_UPDATE, TASK_CREATE, ANALYZE, UNKNOWN)",
    "confidence": 0.95,
    "entities": { "clientName": "...", "topic": "..." }
  },
  "actions": [
    {
      "tool": "nombreDeLaHerramienta",
      "parameters": { "param1": "valor1" },
      "reason": "Por qué elegiste esta herramienta (EN ESPAÑOL)"
    }
  ],
  "analysis": "Narrativa opcional en español si el usuario pidió un resumen o análisis."
}

REGLAS:
1. No uses tildes invertidas de Markdown (\`\`\`). Retorna ÚNICAMENTE JSON puro.
2. Solo usa herramientas explícitamente listadas en HERRAMIENTAS DISPONIBLES.
3. Valida los tipos de los parámetros contra el esquema de la herramienta.
4. Si no sabes qué hacer, retorna el intent UNKNOWN sin acciones.
5. Todo texto dirigido al usuario DEBE estar en ESPAÑOL.
`;

    const body = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: request.commandText }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error de la API de Gemini: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error('No se recibió una respuesta válida de Gemini.');
    }

    try {
      const parsed = JSON.parse(candidateText);
      return {
        ...parsed,
        meta: {
          modelId: this.model,
          latencyMs: Date.now() - startMs,
          contextTokensEstimate: Math.floor(JSON.stringify(request.context).length / 4) + 200,
          timestamp: new Date().toISOString(),
        }
      };
    } catch (err) {
      throw new Error(`Error al parsear el JSON de Gemini: ${candidateText}`);
    }
  }
}
