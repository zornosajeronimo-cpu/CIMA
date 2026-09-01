import type { AIProvider, AIRequest } from './provider';
import type { AIResponse } from '@/models/aiResponse';
import { ToolRegistry } from '@/core/tools/registry';

// ---------------------------------------------------------------------------
// Normalizador universal de respuestas de Gemini
// Gemini suele inventarse nombres de campos. Este normalizador mapea
// CUALQUIER variante plausible al esquema estricto de CIMA.
// ---------------------------------------------------------------------------

/** Busca el primer valor string en el objeto que coincida con alguna de las llaves candidatas */
function pickString(obj: Record<string, unknown>, candidates: string[], fallback: string): string {
  for (const key of candidates) {
    if (typeof obj[key] === 'string' && (obj[key] as string).trim().length > 0) {
      return obj[key] as string;
    }
  }
  return fallback;
}

/** Busca un array de acciones en cualquier campo plausible del objeto */
function pickActions(obj: Record<string, unknown>): Record<string, unknown>[] {
  const candidates = ['actions', 'action', 'tools', 'toolCalls', 'tool_calls', 'plan', 'steps'];
  for (const key of candidates) {
    const val = obj[key];
    if (Array.isArray(val) && val.length > 0) return val as Record<string, unknown>[];
  }
  return [];
}

/** Normaliza una acción individual al formato {tool, parameters, reason} */
function normalizeAction(raw: Record<string, unknown>): { tool: string; parameters: Record<string, unknown>; reason: string } {
  const tool = pickString(raw, ['tool', 'toolName', 'tool_name', 'name', 'function', 'herramienta'], '');

  // parameters puede venir como "parameters", "params", "args", "arguments", "input"
  let params: Record<string, unknown> = {};
  for (const key of ['parameters', 'params', 'args', 'arguments', 'input', 'parametros']) {
    if (raw[key] && typeof raw[key] === 'object' && !Array.isArray(raw[key])) {
      params = raw[key] as Record<string, unknown>;
      break;
    }
  }

  const reason = pickString(raw, ['reason', 'razon', 'razón', 'justification', 'why', 'motivo', 'explanation', 'descripcion', 'description'], `Ejecutar ${tool}`);

  return { tool, parameters: params, reason };
}

/** Intenta reconstruir un AIResponse válido desde CUALQUIER JSON que Gemini devuelva */
function normalizeGeminiResponse(raw: Record<string, unknown>): Omit<AIResponse, 'meta'> {
  // 1. Extraer message de cualquier campo plausible
  const message = pickString(raw, [
    'message', 'mensaje', 'acknowledged', 'response', 'respuesta',
    'reply', 'text', 'texto', 'summary', 'resumen', 'description',
    'output', 'salida', 'answer', 'resultado',
  ], 'Procesando tu comando...');

  // 2. Extraer intent
  let intent: AIResponse['intent'] = { type: 'UNKNOWN', confidence: 0.8, entities: {} };
  if (raw.intent && typeof raw.intent === 'object' && !Array.isArray(raw.intent)) {
    const intentObj = raw.intent as Record<string, unknown>;
    intent = {
      type: (intentObj.type as AIResponse['intent']['type']) ?? 'UNKNOWN',
      confidence: typeof intentObj.confidence === 'number' ? intentObj.confidence : 0.8,
      entities: (typeof intentObj.entities === 'object' && intentObj.entities !== null ? intentObj.entities : {}) as Record<string, string>,
    };
  }

  // 3. Extraer actions — busca en el root y también dentro de sub-objetos
  let rawActions = pickActions(raw);

  // Caso especial: Gemini puso tool/parameters directamente en el root (sin array)
  if (rawActions.length === 0 && typeof raw.tool === 'string') {
    rawActions = [raw];
  }

  // Caso especial: Gemini puso un solo objeto "action" (no array)
  if (rawActions.length === 0) {
    for (const key of ['action', 'tool_call']) {
      if (raw[key] && typeof raw[key] === 'object' && !Array.isArray(raw[key])) {
        rawActions = [raw[key] as Record<string, unknown>];
        break;
      }
    }
  }

  const actions = rawActions
    .map(a => normalizeAction(a as Record<string, unknown>))
    .filter(a => a.tool.length > 0); // Filtrar acciones vacías

  // 4. Extraer analysis (opcional)
  const analysis = pickString(raw, [
    'analysis', 'analisis', 'análisis', 'thoughts', 'thinking',
    'pensamientos', 'razonamiento', 'reasoning',
  ], '');

  return {
    message,
    intent,
    actions,
    ...(analysis ? { analysis } : {}),
  };
}

// ---------------------------------------------------------------------------
// GeminiProvider
// ---------------------------------------------------------------------------
export class GeminiProvider implements AIProvider {
  readonly id = 'gemini';

  constructor(private apiKeys: string[], private model: string = 'gemini-2.5-flash') {}

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

    // Si el caller pasa systemPrompt (ej: ResearchSynthesizer), lo usamos directamente
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
- NO uses nombres alternativos como "acknowledged", "thoughts", "steps"
- "actions" siempre es un ARRAY []
- "parameters" siempre es un OBJETO {}
- Si no hay acción, usa "actions": []
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
        temperature: 0.1,
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000)
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

    let parsed: Record<string, unknown>;
    try {
      const cleaned = candidateText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`Gemini devolvió texto no-JSON: ${candidateText.slice(0, 200)}`);
    }

    const meta = {
      modelId: this.model,
      latencyMs: Date.now() - startMs,
      contextTokensEstimate: Math.floor(JSON.stringify(request.context).length / 4) + 200,
      timestamp: new Date().toISOString(),
    };

    // Ruta 1: Si Gemini devolvió el formato perfecto, usarlo directamente
    if (
      typeof parsed.message === 'string' &&
      parsed.intent &&
      typeof parsed.intent === 'object' &&
      Array.isArray(parsed.actions)
    ) {
      // Aún así normalizar las acciones por si les falta reason/parameters
      const normalized = normalizeGeminiResponse(parsed);
      return { ...normalized, meta };
    }

    // Ruta 2: Si es una respuesta de síntesis (ResearchSynthesizer), pasar como está
    if (request.systemPrompt && (parsed.companyName || parsed.description || parsed.executiveSummary)) {
      return {
        message: '',
        intent: { type: 'RESEARCH', confidence: 1.0, entities: {} },
        actions: [],
        ...parsed,
        meta,
      } as AIResponse;
    }

    // Ruta 3: Normalizar agresivamente cualquier JSON malformado
    console.warn('[CIMA Gemini] Normalizando respuesta no estándar:', JSON.stringify(parsed).slice(0, 300));
    const normalized = normalizeGeminiResponse(parsed);
    return { ...normalized, meta };
  }
}
