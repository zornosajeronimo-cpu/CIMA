// ============================================================
// CIMA AI Response — Structured contract between AI and system
// The AI NEVER returns free text as the primary control mechanism.
// ============================================================

export type AIIntentType =
  | 'CLIENT_VIEW'
  | 'CLIENT_UPDATE'
  | 'CLIENT_CREATE'
  | 'CLIENT_LIST'
  | 'CLIENT_ANALYZE'
  | 'TASK_CREATE'
  | 'TASK_UPDATE'
  | 'TASK_LIST'
  | 'KNOWLEDGE_CREATE'
  | 'KNOWLEDGE_LIST'
  | 'RESEARCH_CREATE'
  | 'RESEARCH'
  | 'LESSON_CREATE'
  | 'DECISION_CREATE'
  | 'EXPERIMENT_CREATE'
  | 'OPPORTUNITY_CREATE'
  | 'OPPORTUNITY_LIST'
  | 'OPPORTUNITY_UPDATE'
  | 'TOOL_CALL'
  | 'NAVIGATE'
  | 'ANALYZE'
  | 'SUMMARIZE'
  | 'SEARCH'
  | 'UNKNOWN';

export interface AIIntent {
  type: AIIntentType;
  /** 0.0 – 1.0 */
  confidence: number;
  /** Named entities extracted from the command */
  entities: Record<string, string>;
}

export interface AIActionProposal {
  /** Must match a registered tool name */
  tool: string;
  /** Validated against tool input schema before execution */
  parameters: Record<string, unknown>;
  /** Human-readable reason for proposing this action */
  reason: string;
}

export interface AIResponse {
  /** Human-readable explanation of what CIMA understood */
  message: string;
  intent: AIIntent;
  actions: AIActionProposal[];
  /** Optional narrative (for analyze/summarize intents) */
  analysis?: string;
  /** Metadata for observability */
  meta: {
    modelId: string;
    latencyMs: number;
    contextTokensEstimate: number;
    timestamp: string;
  };
}
