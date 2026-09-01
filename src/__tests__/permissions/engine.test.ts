
import { describe, it, expect } from 'vitest';
import { PermissionEngine, DEFAULT_POLICY } from '../../core/permissions/engine';
import type { AIActionProposal } from '../../models/aiResponse';

describe('PermissionEngine', () => {
  const engine = new PermissionEngine(DEFAULT_POLICY);

  it('auto-approves read tools without confirmation', () => {
    const proposal: AIActionProposal = { tool: 'viewClient', parameters: { clientId: 'plasticpack' }, reason: 'test' };
    const result = engine.evaluate(proposal);
    expect(result.canExecute).toBe(true);
    expect(result.requiresConfirmation).toBe(false);
    expect(result.risk).toBe('read');
  });

  it('auto-approves write tools with default policy', () => {
    const proposal: AIActionProposal = { tool: 'updateClient', parameters: { clientId: 'plasticpack', stage: 'Build' }, reason: 'test' };
    const result = engine.evaluate(proposal);
    expect(result.canExecute).toBe(true);
    expect(result.requiresConfirmation).toBe(false); // default policy auto-approves writes
    expect(result.risk).toBe('write');
  });

  it('rejects unknown tool', () => {
    const proposal: AIActionProposal = { tool: 'unknownTool', parameters: {}, reason: 'test' };
    const result = engine.evaluate(proposal);
    expect(result.canExecute).toBe(false);
    expect(result.reason).toContain('not registered');
  });

  it('requires confirmation for write when policy says so', () => {
    const strictEngine = new PermissionEngine({ ...DEFAULT_POLICY, autoApproveWrite: false });
    const proposal: AIActionProposal = { tool: 'createTask', parameters: { title: 'Test' }, reason: 'test' };
    const result = strictEngine.evaluate(proposal);
    expect(result.requiresConfirmation).toBe(true);
  });

  it('evaluates a full plan and detects if any action requires confirmation', () => {
    const proposals: AIActionProposal[] = [
      { tool: 'viewClient', parameters: { clientId: 'p' }, reason: 'r' },
      { tool: 'updateClient', parameters: { clientId: 'p' }, reason: 'r' },
    ];
    const { requiresConfirmation } = engine.evaluatePlan(proposals);
    expect(requiresConfirmation).toBe(false); // both auto-approved by default
  });

  it('marks plan as requiring confirmation when any action needs it', () => {
    const strictEngine = new PermissionEngine({ ...DEFAULT_POLICY, autoApproveWrite: false });
    const proposals: AIActionProposal[] = [
      { tool: 'viewClient', parameters: { clientId: 'p' }, reason: 'r' },
      { tool: 'createTask', parameters: { title: 'Test' }, reason: 'r' },
    ];
    const { requiresConfirmation } = strictEngine.evaluatePlan(proposals);
    expect(requiresConfirmation).toBe(true);
  });
});
