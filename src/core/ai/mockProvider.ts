// ============================================================
// Mock AI Provider — Simulates realistic AI behavior for testing
// Produces structured AIResponse objects that test the full pipeline
// ============================================================

import type { AIProvider, AIRequest } from './provider';
import type { AIResponse, AIIntentType } from '@/models/aiResponse';

interface MockPattern {
  patterns: (RegExp | string)[];
  buildResponse(text: string, context: Record<string, unknown>): AIResponse;
}

function resp(
  text: string,
  message: string,
  intentType: AIIntentType,
  confidence: number,
  entities: Record<string, string>,
  actions: AIResponse['actions'],
  analysis?: string,
): AIResponse {
  const start = Date.now();
  return {
    message,
    intent: { type: intentType, confidence, entities },
    actions,
    analysis,
    meta: {
      modelId: 'mock-v1',
      latencyMs: Math.floor(Math.random() * 200) + 80,
      contextTokensEstimate: Math.floor(text.length / 4) + 120,
      timestamp: new Date().toISOString(),
    },
  };
  void start;
}

function extractClientName(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('plasticpack')) return 'plasticpack';
  if (lower.includes('plántulas') || lower.includes('plantulas')) return 'plantulas';
  if (lower.includes('colegio')) return 'colegio';
  return '';
}

function extractStage(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('negociación') || lower.includes('negotiation')) return 'Negotiation';
  if (lower.includes('propuesta') || lower.includes('proposal')) return 'Proposal';
  if (lower.includes('discovery') || lower.includes('descubrimiento')) return 'Discovery';
  if (lower.includes('calificado') || lower.includes('qualified')) return 'Qualified';
  if (lower.includes('ganado') || lower.includes('won')) return 'Won';
  if (lower.includes('perdido') || lower.includes('lost')) return 'Lost';
  if (lower.includes('diseño') || lower.includes('solution design')) return 'Solution Design';
  if (lower.includes('build') || lower.includes('construcción')) return 'Build';
  if (lower.includes('live') || lower.includes('activo')) return 'Live';
  return '';
}

const PATTERNS: MockPattern[] = [
  // VIEW CLIENT
  {
    patterns: [/\b(muéstrame|ver|show|abre|open|view)\b.*(plasticpack|plántulas|plantulas|colegio)/i],
    buildResponse(text) {
      const client = extractClientName(text);
      return resp(text,
        `Mostrando información de ${client}`,
        'CLIENT_VIEW', 0.96, { clientName: client },
        [{ tool: 'viewClient', parameters: { clientId: client }, reason: 'User explicitly requested to view this client.' }]
      );
    },
  },
  // ANALYZE CLIENT
  {
    patterns: [/\b(analiza|analyze|análisis|analysis)\b.*(plasticpack|plántulas|plantulas|colegio)/i],
    buildResponse(text) {
      const client = extractClientName(text);
      return resp(text,
        `Analizando el contexto completo de ${client}`,
        'CLIENT_ANALYZE', 0.94, { clientName: client },
        [{ tool: 'analyzeClient', parameters: { clientId: client }, reason: 'User requested comprehensive client analysis.' }],
        `He reunido toda la información disponible sobre ${client}. A continuación encontrarás el estado actual, tareas pendientes, oportunidades y conocimiento relacionado. Revisa las próximas acciones recomendadas.`
      );
    },
  },
  // UPDATE CLIENT STAGE
  {
    patterns: [/\b(actualiza|update|cambia|change|mueve|move)\b.*(plasticpack|plántulas|plantulas|colegio)/i],
    buildResponse(text) {
      const client = extractClientName(text);
      const stage = extractStage(text);
      const actions: AIResponse['actions'] = [
        { tool: 'updateClient', parameters: { clientId: client, ...(stage ? { stage } : {}) }, reason: `User requested to update ${client}${stage ? ` to stage ${stage}` : ''}.` },
      ];
      if (text.toLowerCase().includes('tarea') || text.toLowerCase().includes('task')) {
        actions.push({
          tool: 'createTask',
          parameters: { title: `Preparar propuesta para ${client}`, clientId: client, priority: 'high' },
          reason: 'User mentioned creating a task alongside the client update.',
        });
      }
      return resp(text,
        `Puedo actualizar ${client}${stage ? ` a ${stage}` : ''}.`,
        'CLIENT_UPDATE', 0.97, { clientName: client, stage },
        actions
      );
    },
  },
  // TASK CREATE
  {
    patterns: [/\b(agrega|crea|nueva|nueva tarea|agregar|add|create)\b.*(tarea|task)/i],
    buildResponse(text) {
      const client = extractClientName(text);
      const titleMatch = text.replace(/agrega|crea|nueva|tarea|agregar|add|create|task/gi, '').trim();
      return resp(text,
        `Creando tarea: "${titleMatch || 'Nueva tarea'}"`,
        'TASK_CREATE', 0.91, { clientName: client },
        [{ tool: 'createTask', parameters: { title: titleMatch || 'Nueva tarea', clientId: client || undefined, priority: 'medium' }, reason: 'User requested task creation.' }]
      );
    },
  },
  // KNOWLEDGE / GUARDA / RECUERDA
  {
    patterns: [/\b(guarda|save|recuerda|nota|apunta|anota|remember)\b/i],
    buildResponse(text) {
      const client = extractClientName(text);
      const content = text.replace(/guarda|save|recuerda|nota|apunta|anota|remember|esto como|esto/gi, '').trim();
      return resp(text,
        `Guardando en Knowledge Base`,
        'KNOWLEDGE_CREATE', 0.88, { clientName: client },
        [{ tool: 'createKnowledge', parameters: { title: content.slice(0, 50) || 'Nueva nota', content: content || text, category: client ? 'client' : 'general', clientId: client || undefined }, reason: 'User requested to save information.' }]
      );
    },
  },
  // LESSON
  {
    patterns: [/\b(aprendí|aprendizaje|lección|lesson|learned|aprendí que)\b/i],
    buildResponse(text) {
      const client = extractClientName(text);
      const content = text.replace(/aprendí que|aprendí|aprendizaje|lección|lesson|learned/gi, '').trim();
      return resp(text,
        `Registrando aprendizaje`,
        'LESSON_CREATE', 0.90, { clientName: client },
        [{ tool: 'createLesson', parameters: { title: content.slice(0, 60) || 'Nuevo aprendizaje', learning: content || text, clientId: client || undefined }, reason: 'User reported a lesson learned.' }]
      );
    },
  },
  // DECISION
  {
    patterns: [/\b(decisión|decision|decidí|decided|registra la decisión)\b/i],
    buildResponse(text) {
      const client = extractClientName(text);
      const content = text.replace(/decisión|decision|decidí|decided|registra la decisión/gi, '').trim();
      return resp(text,
        `Registrando decisión`,
        'DECISION_CREATE', 0.87, { clientName: client },
        [{ tool: 'createDecision', parameters: { problem: 'Decisión registrada por el usuario', decision: content || text, clientId: client || undefined }, reason: 'User recorded a decision.' }]
      );
    },
  },
  // OPPORTUNITIES
  {
    patterns: [/\b(oportunidades|opportunities|pipeline|ventas|sales|qué tengo)\b/i],
    buildResponse(text) {
      return resp(text,
        `Mostrando pipeline de ventas`,
        'OPPORTUNITY_LIST', 0.93, {},
        [{ tool: 'listOpportunities', parameters: {}, reason: 'User requested to see opportunities.' }]
      );
    },
  },
  // CLIENTS LIST
  {
    patterns: [/\b(qué clientes|clientes|clients|lista de clientes|listar)\b/i],
    buildResponse(text) {
      return resp(text,
        `Mostrando todos los clientes`,
        'CLIENT_LIST', 0.91, {},
        [{ tool: 'listClients', parameters: {}, reason: 'User requested client list.' }]
      );
    },
  },
  // RESEARCH
  {
    patterns: [/\b(investiga|research|busca información|find info)\b/i],
    buildResponse(text) {
      const client = extractClientName(text);
      const topic = text.replace(/investiga|research|busca información|find info/gi, '').trim();
      return resp(text,
        `Creando entrada de investigación`,
        'RESEARCH_CREATE', 0.85, { clientName: client },
        [{ tool: 'createResearch', parameters: { question: topic || text, finding: 'Pendiente de investigación — actualiza con los hallazgos.', relevance: 'medium', clientId: client || undefined }, reason: 'User requested research on a topic.' }]
      );
    },
  },
];

export class MockAIProvider implements AIProvider {
  readonly id = 'mock-v1';

  async process(request: AIRequest): Promise<AIResponse> {
    const { commandText, context } = request;

    // Simulate network latency
    await new Promise(r => setTimeout(r, 150 + Math.random() * 200));

    const text = commandText.toLowerCase();

    for (const pattern of PATTERNS) {
      const matched = pattern.patterns.some(p =>
        typeof p === 'string' ? text.includes(p) : p.test(commandText)
      );
      if (matched) {
        return pattern.buildResponse(commandText, context);
      }
    }

    // Default: UNKNOWN with no actions
    return resp(commandText,
      `Recibí tu comando. Todavía no tengo una estrategia específica para "${commandText.slice(0, 40)}...". Cuando conecte un LLM real, podré manejar esto correctamente.`,
      'UNKNOWN', 0.30, {},
      []
    );
  }
}

export const mockAI = new MockAIProvider();
