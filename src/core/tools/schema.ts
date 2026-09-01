// ============================================================
// Tool Schema — Defines the contract for every tool CIMA can execute.
// The AI can only propose tools that exist in this registry.
// ============================================================

import type { RiskLevel } from '@/models/actionPlan';
import type { AppState } from '@/state/reducer';
import type { AppAction } from '@/state/reducer';

export type ToolResult = {
  success: boolean;
  data?: Record<string, unknown>;
  message: string;
  /** State mutations to dispatch after successful execution */
  actions: AppAction[];
};

export interface ParameterSchema {
  type: 'string' | 'number' | 'boolean' | 'object';
  required: boolean;
  description: string;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  risk: RiskLevel;
  /** Parameter schema for validation before execution */
  parameters: Record<string, ParameterSchema>;
  /** The actual execution logic — reads state, returns actions to dispatch.
   *  Can be async for tools that call external APIs (e.g. Tavily search). */
  execute(params: Record<string, unknown>, state: AppState): ToolResult | Promise<ToolResult>;
}
