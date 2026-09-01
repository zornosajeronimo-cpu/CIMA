
import { describe, it, expect } from 'vitest';
import { ToolRegistry } from '../../core/tools/registry';
import { INITIAL_STATE } from '../../state/reducer';
import type { AppState } from '../../state/reducer';

const baseState: AppState = {
  ...INITIAL_STATE,
  clients: [
    { id: 'plasticpack', name: 'Plasticpack', stage: 'Solution Design', status: 'Needs input', nextAction: 'Confirm scope', createdAt: '', updatedAt: '' },
  ],
  tasks: [],
  opportunities: [
    { id: 'opp1', company: 'Plasticpack', stage: 'Proposal', value: 3500000, nextAction: 'Send proposal', createdAt: '', updatedAt: '' },
  ],
  knowledge: [],
  research: [],
  lessons: [],
  decisions: [],
  experiments: [],
  businessSystems: [],
  automations: [],
  agents: [],
  activities: [],
  executions: [],
  commandHistory: [],
};

describe('ToolRegistry', () => {
  it('has all expected tools registered', () => {
    const names = ToolRegistry.names();
    expect(names).toContain('viewClient');
    expect(names).toContain('updateClient');
    expect(names).toContain('createTask');
    expect(names).toContain('createKnowledge');
    expect(names).toContain('createLesson');
    expect(names).toContain('createDecision');
    expect(names).toContain('createResearch');
    expect(names).toContain('updateOpportunity');
    expect(names).toContain('listClients');
    expect(names).toContain('listOpportunities');
    expect(names).toContain('analyzeClient');
    expect(names).toContain('navigateToSection');
  });

  it('returns undefined for unknown tools', () => {
    expect(ToolRegistry.get('nonExistentTool')).toBeUndefined();
  });

  it('has correct risk levels', () => {
    expect(ToolRegistry.get('viewClient')?.risk).toBe('read');
    expect(ToolRegistry.get('updateClient')?.risk).toBe('write');
    expect(ToolRegistry.get('analyzeClient')?.risk).toBe('read');
    expect(ToolRegistry.get('createTask')?.risk).toBe('write');
  });
});

describe('viewClient tool', () => {
  it('finds client by id and returns navigate actions', () => {
    const tool = ToolRegistry.get('viewClient')!;
    const result = tool.execute({ clientId: 'plasticpack' }, baseState);
    expect(result.success).toBe(true);
    expect(result.actions.some(a => a.type === 'NAVIGATE')).toBe(true);
    expect(result.actions.some(a => a.type === 'SELECT_CLIENT')).toBe(true);
  });

  it('fails gracefully for unknown client', () => {
    const tool = ToolRegistry.get('viewClient')!;
    const result = tool.execute({ clientId: 'nonexistent' }, baseState);
    expect(result.success).toBe(false);
    expect(result.actions).toHaveLength(0);
  });
});

describe('updateClient tool', () => {
  it('updates client stage', () => {
    const tool = ToolRegistry.get('updateClient')!;
    const result = tool.execute({ clientId: 'plasticpack', stage: 'Build' }, baseState);
    expect(result.success).toBe(true);
    const upsertAction = result.actions.find(a => a.type === 'UPSERT_CLIENT');
    expect(upsertAction).toBeDefined();
    expect((upsertAction as { type: string; payload: { stage: string } } | undefined)?.payload?.stage).toBe('Build');
  });
});

describe('createTask tool', () => {
  it('creates a task and dispatches UPSERT_TASK', () => {
    const tool = ToolRegistry.get('createTask')!;
    const result = tool.execute({ title: 'Prepare proposal', priority: 'high' }, baseState);
    expect(result.success).toBe(true);
    expect(result.actions.some(a => a.type === 'UPSERT_TASK')).toBe(true);
  });

  it('is idempotent — does not create duplicate tasks', () => {
    const stateWithTask: AppState = {
      ...baseState,
      tasks: [{ id: 'task1', title: 'Prepare proposal', status: 'pending', priority: 'high', createdAt: '', updatedAt: '' }],
    };
    const tool = ToolRegistry.get('createTask')!;
    const result = tool.execute({ title: 'Prepare proposal' }, stateWithTask);
    expect(result.success).toBe(true);
    expect((result.data as Record<string, unknown> | undefined)?.idempotent).toBe(true);
    expect(result.actions).toHaveLength(0); // no dispatch needed
  });
});

describe('analyzeClient tool', () => {
  it('returns client data with task/knowledge counts', () => {
    const tool = ToolRegistry.get('analyzeClient')!;
    const result = tool.execute({ clientId: 'plasticpack' }, baseState);
    expect(result.success).toBe(true);
    expect(result.data?.client).toBeDefined();
  });
});
