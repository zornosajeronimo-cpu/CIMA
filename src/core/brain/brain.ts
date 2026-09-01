// ============================================================
// AI Brain — Orchestrates the full command pipeline
// Command → Context → AI → Validate → Plan → Permissions → (Execute or Confirm)
// ============================================================

import type { AIProvider } from '@/core/ai/provider';
import { mockAI } from '@/core/ai/mockProvider';
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
  /** Validation errors if any */
  validationErrors?: string[];
  /** Audit data for observability */
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

class AIBrain {
  private provider: AIProvider = mockAI;

  /** Replace the provider at runtime — this is how we'll connect real AI later */
  setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  getProviderId(): string {
    return this.provider.id;
  }

  async process(commandText: string, commandId: string, state: AppState): Promise<BrainProcessResult> {
    const startedAt = new Date().toISOString();
    const planId = uid('plan');

    // 1. Build scoped context
    const context = buildContext(commandText, state);

    // 2. Call AI provider
    const aiStartMs = Date.now();
    let aiResponse: AIResponse;
    try {
      aiResponse = await this.provider.process({
        commandText,
        context: context.data,
        availableTools: ToolRegistry.names(),
        systemPrompt: `You are CIMA, an intelligent operating system for building and operating AI solutions for businesses. You help the operator (the user) understand clients, organize knowledge, manage projects, and execute strategies. Always respond with structured JSON following the AIResponse schema. Available tools: ${ToolRegistry.names().join(', ')}.`,
      });
    } catch (err) {
      // AI provider failure — create failed plan
      const failedPlan: ActionPlan = {
        id: planId,
        commandId,
        commandText,
        intent: { type: 'UNKNOWN', confidence: 0, entities: {} },
        aiMessage: `AI processing failed: ${String(err)}`,
        actions: [],
        status: 'failed',
        requiresConfirmation: false,
        createdAt: startedAt,
      };
      return {
        plan: failedPlan,
        validationErrors: [`AI provider error: ${String(err)}`],
        audit: {
          commandText, contextScope: context.scope, contextTokens: context.estimatedTokens,
          aiLatencyMs: Date.now() - aiStartMs, validationPassed: false, planId, timestamp: startedAt,
        },
      };
    }
    const aiLatencyMs = Date.now() - aiStartMs;

    // 3. Validate AI response
    const validation = validateAIResponse(aiResponse);
    const sanitizedResponse = validation.sanitized ?? aiResponse;

    // 4. Evaluate permissions for each proposed action
    const permResults = permissionEngine.evaluatePlan(sanitizedResponse.actions);

    // 5. Build PlannedActions
    const plannedActions: PlannedAction[] = sanitizedResponse.actions.map((proposal, i) => {
      const perm = permResults.results[i];
      return {
        id: uid('action'),
        proposal,
        risk: perm.risk,
        status: perm.canExecute ? 'queued' : 'skipped',
        idempotencyKey: `${commandId}:${proposal.tool}:${JSON.stringify(proposal.parameters)}`,
      };
    });

    // 6. Build ActionPlan
    const plan: ActionPlan = {
      id: planId,
      commandId,
      commandText,
      intent: sanitizedResponse.intent,
      aiMessage: sanitizedResponse.message,
      analysis: sanitizedResponse.analysis,
      actions: plannedActions,
      status: permResults.requiresConfirmation ? 'awaiting_confirmation' : 'validated',
      requiresConfirmation: permResults.requiresConfirmation,
      createdAt: startedAt,
    };

    return {
      plan,
      validationErrors: validation.errors.map(e => `${e.field}: ${e.message}`),
      audit: {
        commandText,
        contextScope: context.scope,
        contextTokens: context.estimatedTokens,
        aiLatencyMs,
        validationPassed: validation.valid,
        planId,
        timestamp: startedAt,
      },
    };
  }

  /** Execute a validated ActionPlan against the current state */
  executePlan(plan: ActionPlan, state: AppState): {
    updatedPlan: ActionPlan;
    allActions: import('@/state/reducer').AppAction[];
  } {
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
          error: `Tool not found: ${action.proposal.tool}`,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        });
        continue;
      }

      const startedAt = new Date().toISOString();
      try {
        const result = tool.execute(action.proposal.parameters, state);
        const completedAt = new Date().toISOString();
        updatedActions.push({
          ...action,
          status: result.success ? 'completed' : 'failed',
          error: result.success ? undefined : result.message,
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
