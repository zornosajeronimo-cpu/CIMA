
import { describe, it, expect } from 'vitest';
import { validateAIResponse } from '../../core/ai/validator';

describe('validateAIResponse', () => {
  it('accepts a valid full response', () => {
    const valid = {
      message: 'Updating Plasticpack',
      intent: { type: 'CLIENT_UPDATE', confidence: 0.97, entities: { clientName: 'plasticpack' } },
      actions: [{
        tool: 'updateClient',
        parameters: { clientId: 'plasticpack', stage: 'Negotiation' },
        reason: 'User requested update',
      }],
      meta: { modelId: 'mock-v1', latencyMs: 120, contextTokensEstimate: 200, timestamp: new Date().toISOString() },
    };
    const result = validateAIResponse(valid);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects null response', () => {
    const result = validateAIResponse(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects response with missing message', () => {
    const invalid = {
      intent: { type: 'CLIENT_VIEW', confidence: 0.9, entities: {} },
      actions: [],
      meta: { modelId: 'mock-v1', latencyMs: 100, contextTokensEstimate: 50, timestamp: '' },
    };
    const result = validateAIResponse(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'message')).toBe(true);
  });

  it('rejects response with unknown tool', () => {
    const invalid = {
      message: 'Doing something',
      intent: { type: 'UNKNOWN', confidence: 0.3, entities: {} },
      actions: [{ tool: 'hackTheSystem', parameters: {}, reason: 'test' }],
      meta: { modelId: 'mock-v1', latencyMs: 100, contextTokensEstimate: 50, timestamp: '' },
    };
    const result = validateAIResponse(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('not registered'))).toBe(true);
  });

  it('produces sanitized response with only valid actions', () => {
    const mixed = {
      message: 'Doing something',
      intent: { type: 'CLIENT_LIST', confidence: 0.8, entities: {} },
      actions: [
        { tool: 'listClients', parameters: {}, reason: 'valid' },
        { tool: 'dangerousTool', parameters: {}, reason: 'invalid' },
      ],
      meta: { modelId: 'mock-v1', latencyMs: 100, contextTokensEstimate: 50, timestamp: '' },
    };
    const result = validateAIResponse(mixed);
    expect(result.valid).toBe(false);
    expect(result.sanitized?.actions).toHaveLength(1);
    expect(result.sanitized?.actions[0].tool).toBe('listClients');
  });

  it('rejects confidence outside 0-1 range', () => {
    const invalid = {
      message: 'Test',
      intent: { type: 'UNKNOWN', confidence: 1.5, entities: {} },
      actions: [],
      meta: { modelId: 'mock-v1', latencyMs: 100, contextTokensEstimate: 50, timestamp: '' },
    };
    const result = validateAIResponse(invalid);
    expect(result.valid).toBe(false);
  });
});
