// ============================================================
// CIMA Action Plan — AI proposes, system validates, system executes
// PRINCIPLE: Never AI → execute(). Always AI → plan → validate → permission → execute
// ============================================================

import type { AIActionProposal, AIIntent } from './aiResponse';

export type RiskLevel = 'read' | 'write' | 'destructive' | 'external';

export type PlanStatus =
  | 'proposed'
  | 'validated'
  | 'awaiting_confirmation'
  | 'approved'
  | 'executing'
  | 'completed'
  | 'partially_completed'
  | 'failed'
  | 'cancelled';

export type ActionStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface PlannedAction {
  id: string;
  proposal: AIActionProposal;
  risk: RiskLevel;
  status: ActionStatus;
  /** Idempotency key: prevents duplicate writes for the same logical operation */
  idempotencyKey?: string;
  startedAt?: string;
  completedAt?: string;
  message?: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface ActionPlan {
  id: string;
  commandId: string;
  commandText: string;
  intent: AIIntent;
  /** Natural language message from AI explaining the plan */
  aiMessage: string;
  /** Optional analysis text for summarize/analyze intents */
  analysis?: string;
  actions: PlannedAction[];
  status: PlanStatus;
  /** If true, at least one action requires user confirmation */
  requiresConfirmation: boolean;
  createdAt: string;
  executedAt?: string;
  completedAt?: string;
}
