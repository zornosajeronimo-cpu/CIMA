// ============================================================
// AI Brain — Orchestrates the full command pipeline
// Command → PreRouter → (AI si es necesario) → Validate → Plan → Execute
// ============================================================

import type { AIProvider } from '@/core/ai/provider';
import { activeProvider } from '@/core/ai/factory';
import { buildContext } from '@/core/context/contextBuilder';
import { validateAIResponse } from '@/core/ai/validator';
import { permissionEngine } from '@/core/permissions/engine';
import { ToolRegistry } from '@/core/tools/registry';
import type { AppState } from '@/state/reducer';
import type { ActionPlan, PlannedAction } from '@/models/actionPlan';
import type { AIResponse } from '@/models/aiResponse';

const uid = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export interface BrainProcessResult {
  plan: ActionPlan;
  validationErrors?: string[];
  audit: {
    commandText: string;
    contextScope: string[];
    contextTokens: number;
    aiLatencyMs: number;
    validationPassed: boolean;
    planId: string;
    timestamp: string;
  };
}

// ---------------------------------------------------------------------------
// Pre-Router Determinista
// Detecta patrones conocidos y genera planes SIN llamar a la IA.
// Esto elimina la dependencia de Gemini para comandos predecibles.
// ---------------------------------------------------------------------------
interface PreRouterMatch {
  intent: AIResponse['intent'];
  message: string;
  actions: AIResponse['actions'];
  analysis?: string;
}

function preRoute(text: string): PreRouterMatch | null {
  const lower = text.toLowerCase().trim();

  // ── Investigar empresa ────────────────────────────────────
  // "investiga plantulas de colombia", "investigar empresa X", "busca info de X"
  const investigatePatterns = [
    /^(?:investiga|investigar|investiga sobre|busca info(?:rmaci[oó]n)? (?:de|sobre)|analiza|analizar|research)\s+(.+)/i,
    /^(?:que sabes de|qué sabes de|dime sobre|averigua sobre|averigua)\s+(.+)/i,
  ];

  for (const pattern of investigatePatterns) {
    const match = lower.match(pattern);
    if (match) {
      const companyName = match[1]
        .replace(/^(?:la empresa|la compañ[ií]a|el cliente|a)\s+/i, '')
        .trim();
      
      if (companyName.length > 1) {
        return {
          intent: { type: 'RESEARCH', confidence: 1.0, entities: { companyName } },
          message: `Iniciando investigación profunda sobre "${companyName}". Buscaré en internet su perfil corporativo, presencia en el mercado y datos clave.`,
          actions: [{
            tool: 'investigateCompany',
            parameters: { companyName, createIfNew: true },
            reason: `El usuario solicitó investigar la empresa "${companyName}"`,
          }],
        };
      }
    }
  }

  // ── Buscar noticias ───────────────────────────────────────
  const newsPatterns = [
    /^(?:noticias|busca noticias|noticias sobre|news)\s+(.+)/i,
    /^(?:que hay de nuevo|qué hay de nuevo|novedades)\s+(?:de|sobre|en)\s+(.+)/i,
  ];

  for (const pattern of newsPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const topic = match[1].trim();
      if (topic.length > 1) {
        return {
          intent: { type: 'SEARCH', confidence: 1.0, entities: { topic } },
          message: `Buscando noticias recientes sobre "${topic}".`,
          actions: [{
            tool: 'searchNews',
            parameters: { topic },
            reason: `Buscar noticias sobre "${topic}"`,
          }],
        };
      }
    }
  }

  // ── Ver cliente ───────────────────────────────────────────
  const viewPatterns = [
    /^(?:ver|muestra|abre|muestrame|muéstrame|show|view)\s+(?:al?\s+)?(?:cliente\s+)?(.+)/i,
  ];

  for (const pattern of viewPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const clientId = match[1].trim();
      if (clientId.length > 1) {
        return {
          intent: { type: 'CLIENT_VIEW', confidence: 0.9, entities: { clientId } },
          message: `Mostrando información del cliente "${clientId}".`,
          actions: [{
            tool: 'viewClient',
            parameters: { clientId },
            reason: `Mostrar el cliente solicitado`,
          }],
        };
      }
    }
  }

  // ── Listar clientes ───────────────────────────────────────
  if (/^(?:clientes|lista(?:r)? clientes|mis clientes|todos los clientes)/i.test(lower)) {
    return {
      intent: { type: 'CLIENT_LIST', confidence: 1.0, entities: {} },
      message: 'Mostrando la lista de clientes.',
      actions: [{
        tool: 'listClients',
        parameters: {},
        reason: 'Listar todos los clientes',
      }],
    };
  }

  // ── Navegar ───────────────────────────────────────────────
  const navMap: Record<string, string> = {
    'inicio': 'overview', 'overview': 'overview', 'panel': 'overview',
    'clientes': 'clients', 'tareas': 'tasks', 'conocimiento': 'knowledge',
    'investigacion': 'research', 'investigación': 'research',
    'decisiones': 'decisions', 'lecciones': 'lessons',
    'experimentos': 'experiments', 'oportunidades': 'opportunities',
    'ventas': 'opportunities', 'sistemas': 'systems',
    'automatizaciones': 'automations', 'agentes': 'agents',
  };

  const navMatch = lower.match(/^(?:ir a|ve a|navega a|abre|vamos a|show)\s+(\S+)/i);
  if (navMatch) {
    const section = navMap[navMatch[1].trim()] ?? navMatch[1].trim();
    return {
      intent: { type: 'NAVIGATE', confidence: 1.0, entities: { section } },
      message: `Navegando a ${section}.`,
      actions: [{
        tool: 'navigate',
        parameters: { section },
        reason: `Navegar a la sección solicitada`,
      }],
    };
  }

  // No se reconoció el patrón → dejar que la IA lo procese
  return null;
}

// ---------------------------------------------------------------------------
// AIBrain
// ---------------------------------------------------------------------------
class AIBrain {
  private provider: AIProvider = activeProvider;

  setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  getProviderId(): string {
    return this.provider.id;
  }

  async process(commandText: string, commandId: string, state: AppState): Promise<BrainProcessResult> {
    const startedAt = new Date().toISOString();
    const planId = uid('plan');
    const context = buildContext(commandText, state);

    // ── Paso 1: Intentar pre-routing determinista ──────────
    const preRouted = preRoute(commandText);

    let aiResponse: AIResponse;
    let aiLatencyMs = 0;
    let validationPassed = true;
    let validationErrors: string[] = [];

    if (preRouted) {
      // El pre-router detectó el comando → no necesitamos IA
      console.log('[CIMA Brain] Pre-router detectó:', preRouted.intent.type);
      aiResponse = {
        message: preRouted.message,
        intent: preRouted.intent,
        actions: preRouted.actions,
        analysis: preRouted.analysis,
        meta: {
          modelId: 'pre-router',
          latencyMs: 0,
          contextTokensEstimate: 0,
          timestamp: startedAt,
        },
      };
    } else {
      // ── Paso 2: Llamar a la IA para comandos no reconocidos ──
      const aiStartMs = Date.now();
      try {
        aiResponse = await this.provider.process({
          commandText,
          context: context.data,
          availableTools: ToolRegistry.names(),
        });
      } catch (err) {
        const failedPlan: ActionPlan = {
          id: planId,
          commandId,
          commandText,
          intent: { type: 'UNKNOWN', confidence: 0, entities: {} },
          aiMessage: `Error al procesar: ${String(err)}`,
          actions: [],
          status: 'failed',
          requiresConfirmation: false,
          createdAt: startedAt,
        };
        return {
          plan: failedPlan,
          validationErrors: [`Error del proveedor IA: ${String(err)}`],
          audit: {
            commandText, contextScope: context.scope, contextTokens: context.estimatedTokens,
            aiLatencyMs: Date.now() - aiStartMs, validationPassed: false, planId, timestamp: startedAt,
          },
        };
      }
      aiLatencyMs = Date.now() - aiStartMs;

      // Validar respuesta de IA
      const validation = validateAIResponse(aiResponse);
      aiResponse = validation.sanitized ?? aiResponse;
      validationPassed = validation.valid;
      validationErrors = validation.errors.map(e => `${e.field}: ${e.message}`);
    }

    // ── Paso 3: Permisos ──────────────────────────────────
    const permResults = permissionEngine.evaluatePlan(aiResponse.actions);

    // ── Paso 4: Construir plan ────────────────────────────
    const plannedActions: PlannedAction[] = aiResponse.actions.map((proposal, i) => {
      const perm = permResults.results[i];
      return {
        id: uid('action'),
        proposal,
        risk: perm.risk,
        status: perm.canExecute ? 'queued' : 'skipped',
        idempotencyKey: `${commandId}:${proposal.tool}:${JSON.stringify(proposal.parameters)}`,
      };
    });

    const plan: ActionPlan = {
      id: planId,
      commandId,
      commandText,
      intent: aiResponse.intent,
      aiMessage: aiResponse.message,
      analysis: aiResponse.analysis,
      actions: plannedActions,
      status: permResults.requiresConfirmation ? 'awaiting_confirmation' : 'validated',
      requiresConfirmation: permResults.requiresConfirmation,
      createdAt: startedAt,
    };

    return {
      plan,
      validationErrors,
      audit: {
        commandText,
        contextScope: context.scope,
        contextTokens: context.estimatedTokens,
        aiLatencyMs,
        validationPassed,
        planId,
        timestamp: startedAt,
      },
    };
  }

  /** Execute a validated ActionPlan against the current state */
  async executePlan(plan: ActionPlan, state: AppState): Promise<{
    updatedPlan: ActionPlan;
    allActions: import('@/state/reducer').AppAction[];
  }> {
    const allActions: import('@/state/reducer').AppAction[] = [];
    const updatedActions: PlannedAction[] = [];

    for (const action of plan.actions) {
      if (action.status === 'skipped') {
        updatedActions.push(action);
        continue;
      }

      const tool = ToolRegistry.get(action.proposal.tool);
      if (!tool) {
        updatedActions.push({
          ...action,
          status: 'failed',
          error: `Herramienta no encontrada: ${action.proposal.tool}`,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        });
        continue;
      }

      const startedAt = new Date().toISOString();
      try {
        const result = await tool.execute(action.proposal.parameters, state);
        const completedAt = new Date().toISOString();
        updatedActions.push({
          ...action,
          status: result.success ? 'completed' : 'failed',
          error: result.success ? undefined : result.message,
          message: result.success ? result.message : undefined,
          result: result.data,
          startedAt,
          completedAt,
        });
        if (result.success) {
          allActions.push(...result.actions);
        }
      } catch (err) {
        updatedActions.push({
          ...action,
          status: 'failed',
          error: String(err),
          startedAt,
          completedAt: new Date().toISOString(),
        });
      }
    }

    const anyFailed = updatedActions.some(a => a.status === 'failed');
    const allCompleted = updatedActions.every(a => a.status === 'completed' || a.status === 'skipped');

    const updatedPlan: ActionPlan = {
      ...plan,
      actions: updatedActions,
      status: allCompleted ? 'completed' : anyFailed ? 'partially_completed' : 'completed',
      executedAt: plan.executedAt ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    return { updatedPlan, allActions };
  }
}

export const brain = new AIBrain();
