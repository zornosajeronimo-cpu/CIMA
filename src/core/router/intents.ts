export type IntentType =
  | 'CLIENT_VIEW'
  | 'CLIENT_LIST'
  | 'CLIENT_UPDATE'
  | 'CLIENT_CREATE'
  | 'TASK_CREATE'
  | 'TASK_UPDATE'
  | 'TASK_LIST'
  | 'KNOWLEDGE_CREATE'
  | 'KNOWLEDGE_LIST'
  | 'RESEARCH_CREATE'
  | 'LESSON_CREATE'
  | 'DECISION_CREATE'
  | 'EXPERIMENT_CREATE'
  | 'OPPORTUNITY_CREATE'
  | 'OPPORTUNITY_LIST'
  | 'NAVIGATE'
  | 'SEARCH'
  | 'UNKNOWN';

export interface Intent {
  type: IntentType;
  confidence: 'high' | 'medium' | 'low';
  entities: Record<string, string>;
  parameters: Record<string, unknown>;
}

export interface IntentPattern {
  patterns: string[];
  intentType: IntentType;
  extractEntities?: (text: string) => Record<string, string>;
}

export const INTENT_PATTERNS: IntentPattern[] = [
  {
    patterns: ['muéstrame', 'ver', 'show', 'abre', 'open', 'view'],
    intentType: 'CLIENT_VIEW',
    extractEntities: (text) => {
      const clients = ['plasticpack', 'plántulas', 'plantulas', 'colegio'];
      for (const c of clients) {
        if (text.toLowerCase().includes(c)) return { clientName: c };
      }
      return {} as Record<string, string>;
    },
  },
  {
    patterns: ['clientes', 'clients', 'qué clientes', 'lista de clientes', 'listar clientes'],
    intentType: 'CLIENT_LIST',
  },
  {
    patterns: ['actualiza', 'update', 'edita', 'edit', 'cambia', 'change', 'modifica'],
    intentType: 'CLIENT_UPDATE',
    extractEntities: (text) => {
      const clients = ['plasticpack', 'plántulas', 'plantulas', 'colegio'];
      for (const c of clients) {
        if (text.toLowerCase().includes(c)) return { clientName: c };
      }
      return {} as Record<string, string>;
    },
  },
  {
    patterns: ['agrega tarea', 'nueva tarea', 'add task', 'create task', 'crea tarea', 'agregar tarea'],
    intentType: 'TASK_CREATE',
  },
  {
    patterns: ['marca tarea', 'completar tarea', 'complete task', 'done task'],
    intentType: 'TASK_UPDATE',
  },
  {
    patterns: ['guarda', 'save', 'nota', 'note', 'knowledge', 'conocimiento', 'apunta'],
    intentType: 'KNOWLEDGE_CREATE',
  },
  {
    patterns: ['investiga', 'research', 'busca información', 'find info'],
    intentType: 'RESEARCH_CREATE',
  },
  {
    patterns: ['aprendizaje', 'lección', 'lesson', 'aprendí', 'learned'],
    intentType: 'LESSON_CREATE',
  },
  {
    patterns: ['decisión', 'decision', 'decidí', 'decided'],
    intentType: 'DECISION_CREATE',
  },
  {
    patterns: ['experimento', 'experiment', 'prueba', 'hypothesis'],
    intentType: 'EXPERIMENT_CREATE',
  },
  {
    patterns: ['oportunidad', 'opportunity', 'lead', 'cliente potencial', 'propuesta'],
    intentType: 'OPPORTUNITY_CREATE',
  },
  {
    patterns: ['oportunidades', 'opportunities', 'pipeline', 'ventas', 'sales'],
    intentType: 'OPPORTUNITY_LIST',
  },
  {
    patterns: ['busca', 'search', 'encuentra', 'find'],
    intentType: 'SEARCH',
  },
];
