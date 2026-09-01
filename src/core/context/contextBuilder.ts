// ============================================================
// Context Builder — Builds scoped context for AI processing
// PRINCIPLE: Send minimum sufficient context, never the full state
// ============================================================

import type { AppState } from '@/state/reducer';

export type ContextScope =
  | 'global'
  | 'client'
  | 'sales'
  | 'research'
  | 'knowledge'
  | 'operations'
  | 'system';

export interface BuiltContext {
  scope: ContextScope[];
  timestamp: string;
  /** Estimated token count for observability */
  estimatedTokens: number;
  data: Record<string, unknown>;
}

function detectScope(text: string): ContextScope[] {
  const lower = text.toLowerCase();
  const scopes: ContextScope[] = [];

  const clientNames = ['plasticpack', 'plántulas', 'plantulas', 'colegio'];
  const mentionsClient = clientNames.some(c => lower.includes(c));

  if (mentionsClient || lower.includes('cliente') || lower.includes('client')) {
    scopes.push('client');
  }
  if (lower.includes('oportunidad') || lower.includes('opportunity') || lower.includes('ventas') || lower.includes('sales') || lower.includes('pipeline')) {
    scopes.push('sales');
  }
  if (lower.includes('investiga') || lower.includes('research')) {
    scopes.push('research');
  }
  if (lower.includes('conocimiento') || lower.includes('knowledge') || lower.includes('guarda') || lower.includes('save') || lower.includes('recuerda')) {
    scopes.push('knowledge');
  }
  if (lower.includes('aprendí') || lower.includes('lesson') || lower.includes('decisión') || lower.includes('decision')) {
    scopes.push('knowledge');
  }
  if (lower.includes('automatiza') || lower.includes('automation') || lower.includes('agente') || lower.includes('agent')) {
    scopes.push('operations');
  }
  if (lower.includes('sistema') || lower.includes('system') || lower.includes('estado') || lower.includes('status')) {
    scopes.push('system');
  }

  return scopes.length > 0 ? scopes : ['global'];
}

function findRelevantClient(text: string, state: AppState) {
  const lower = text.toLowerCase();
  return state.clients.find(c => lower.includes(c.name.toLowerCase()) || lower.includes(c.id.toLowerCase()));
}

export function buildContext(commandText: string, state: AppState): BuiltContext {
  const scopes = detectScope(commandText);
  const data: Record<string, unknown> = {};
  const now = new Date().toISOString();

  // Always include basic summary
  data.summary = {
    clientCount: state.clients.length,
    pendingTasks: state.tasks.filter(t => t.status === 'pending').length,
    recentActivities: state.activities.slice(0, 3).map(a => a.label),
  };

  if (scopes.includes('client')) {
    const relevantClient = findRelevantClient(commandText, state);
    if (relevantClient) {
      const clientTasks = state.tasks.filter(t => t.clientId === relevantClient.id);
      const clientKnowledge = state.knowledge.filter(k => k.clientId === relevantClient.id);
      const clientSystems = state.businessSystems.filter(s => s.clientId === relevantClient.id);
      const clientOpp = state.opportunities.find(o =>
        o.clientId === relevantClient.id || o.company.toLowerCase().includes(relevantClient.name.toLowerCase())
      );
      data.client = {
        ...relevantClient,
        tasks: clientTasks.map(t => ({ id: t.id, title: t.title, status: t.status, priority: t.priority })),
        knowledge: clientKnowledge.map(k => ({ id: k.id, title: k.title, category: k.category })),
        systems: clientSystems.map(s => ({ id: s.id, name: s.name, status: s.status })),
        opportunity: clientOpp ? { stage: clientOpp.stage, value: clientOpp.value, nextAction: clientOpp.nextAction } : null,
      };
    } else {
      data.clients = state.clients.map(c => ({ id: c.id, name: c.name, stage: c.stage, status: c.status, nextAction: c.nextAction }));
    }
  }

  if (scopes.includes('sales')) {
    data.opportunities = state.opportunities.map(o => ({
      id: o.id, company: o.company, stage: o.stage, value: o.value, nextAction: o.nextAction,
    }));
    data.pipelineTotal = state.opportunities
      .filter(o => o.stage !== 'Lost')
      .reduce((sum, o) => sum + (o.value ?? 0), 0);
  }

  if (scopes.includes('knowledge')) {
    data.recentKnowledge = state.knowledge.slice(0, 5).map(k => ({ id: k.id, title: k.title, category: k.category }));
    data.recentLessons = state.lessons.slice(0, 3).map(l => ({ id: l.id, title: l.title }));
    data.recentDecisions = state.decisions.slice(0, 3).map(d => ({ id: d.id, problem: d.problem }));
  }

  if (scopes.includes('research')) {
    data.research = state.research.map(r => ({ id: r.id, question: r.question, relevance: r.relevance }));
  }

  if (scopes.includes('operations')) {
    data.automations = state.automations.map(a => ({ id: a.id, name: a.name, status: a.status }));
    data.agents = state.agents.map(a => ({ id: a.id, name: a.name, status: a.status, goal: a.goal }));
  }

  if (scopes.includes('global') || scopes.includes('system')) {
    data.tasks = state.tasks.filter(t => t.status === 'pending').slice(0, 5).map(t => ({
      id: t.id, title: t.title, priority: t.priority, clientId: t.clientId,
    }));
  }

  // Estimate tokens (rough: 1 token ≈ 4 chars of JSON)
  const estimatedTokens = Math.floor(JSON.stringify(data).length / 4);

  return { scope: scopes, timestamp: now, estimatedTokens, data };
}
