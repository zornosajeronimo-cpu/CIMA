// ============================================================
// AI Response Validator — rejects malformed AI output before execution
// CIMA never executes unvalidated AI responses
// ============================================================

import type { AIResponse, AIActionProposal } from '@/models/aiResponse';
import { ToolRegistry } from '@/core/tools/registry';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  /** Sanitized response with invalid actions removed */
  sanitized?: AIResponse;
}

function validateAction(action: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!action || typeof action !== 'object') {
    errors.push({ field: `actions[${index}]`, message: 'Action must be an object' });
    return errors;
  }
  const a = action as Record<string, unknown>;
  if (!a.tool || typeof a.tool !== 'string') {
    errors.push({ field: `actions[${index}].tool`, message: 'Tool name is required and must be a string' });
  } else if (!ToolRegistry.has(a.tool)) {
    errors.push({ field: `actions[${index}].tool`, message: `Tool "${a.tool}" is not registered in CIMA` });
  }
  if (!a.parameters || typeof a.parameters !== 'object') {
    errors.push({ field: `actions[${index}].parameters`, message: 'Parameters must be an object' });
  } else {
    // Validate parameters against tool schema
    const tool = ToolRegistry.get(a.tool as string);
    if (tool) {
      for (const [key, schema] of Object.entries(tool.parameters)) {
        if (schema.required && !((a.parameters as Record<string, unknown>)[key] !== undefined)) {
          errors.push({ field: `actions[${index}].parameters.${key}`, message: `Required parameter "${key}" is missing` });
        }
      }
    }
  }
  if (!a.reason || typeof a.reason !== 'string') {
    errors.push({ field: `actions[${index}].reason`, message: 'Reason is required and must be a string' });
  }
  return errors;
}

export function validateAIResponse(raw: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!raw || typeof raw !== 'object') {
    return { valid: false, errors: [{ field: 'response', message: 'AI response must be an object' }] };
  }

  const r = raw as Record<string, unknown>;

  if (!r.message || typeof r.message !== 'string') {
    errors.push({ field: 'message', message: 'message is required and must be a string' });
  }

  if (!r.intent || typeof r.intent !== 'object') {
    errors.push({ field: 'intent', message: 'intent is required and must be an object' });
  } else {
    const intent = r.intent as Record<string, unknown>;
    if (!intent.type || typeof intent.type !== 'string') {
      errors.push({ field: 'intent.type', message: 'intent.type is required' });
    }
    if (typeof intent.confidence !== 'number' || intent.confidence < 0 || intent.confidence > 1) {
      errors.push({ field: 'intent.confidence', message: 'intent.confidence must be a number between 0 and 1' });
    }
  }

  if (!Array.isArray(r.actions)) {
    errors.push({ field: 'actions', message: 'actions must be an array' });
  } else {
    const actionErrors = r.actions.flatMap((a: unknown, i: number) => validateAction(a, i));
    errors.push(...actionErrors);
  }

  if (errors.length > 0) {
    // Build sanitized version: keep valid actions only
    const sanitizedActions = Array.isArray(r.actions)
      ? (r.actions as AIActionProposal[]).filter((_, i) => {
          const actionErrors = validateAction((r.actions as unknown[])[i], i);
          return actionErrors.length === 0;
        })
      : [];

    const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join(', ');
    const originalMessage = r.message ? String(r.message) : 'AI response partially invalid';
    const sanitized: AIResponse = {
      message: `${originalMessage} (Errores de validación: ${errorMessages})`,
      intent: {
        type: ((r.intent as Record<string, unknown>)?.type as AIResponse['intent']['type']) ?? 'UNKNOWN',
        confidence: ((r.intent as Record<string, unknown>)?.confidence as number) ?? 0,
        entities: ((r.intent as Record<string, unknown>)?.entities as Record<string, string>) ?? {},
      },
      actions: sanitizedActions,
      meta: (r.meta as AIResponse['meta']) ?? {
        modelId: 'unknown',
        latencyMs: 0,
        contextTokensEstimate: 0,
        timestamp: new Date().toISOString(),
      },
    };

    return { valid: false, errors, sanitized };
  }

  return { valid: true, errors: [], sanitized: raw as AIResponse };
}
