// ============================================================
// Tool Registry — Explicit catalog of every tool CIMA can execute.
// The AI can only propose tools registered here.
// ============================================================

import type { ToolDefinition } from './schema';
import type { AppState } from '@/state/reducer';
import type { Client, Task, KnowledgeItem, ResearchEntry, Lesson, Decision, Opportunity } from '@/models';

const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findClient(state: AppState, clientId: string): Client | undefined {
  return state.clients.find(
    c => c.id === clientId || c.name.toLowerCase().includes(clientId.toLowerCase())
  );
}

// ---------------------------------------------------------------------------
// Tool Definitions
// ---------------------------------------------------------------------------

const navigateToSection: ToolDefinition = {
  name: 'navigateToSection',
  description: 'Navigate to a specific section of CIMA',
  risk: 'read',
  parameters: {
    section: { type: 'string', required: true, description: 'Section id to navigate to' },
  },
  execute(params) {
    return {
      success: true,
      message: `Navigating to ${params.section}`,
      actions: [{ type: 'NAVIGATE', payload: params.section as string }],
    };
  },
};

const viewClient: ToolDefinition = {
  name: 'viewClient',
  description: 'Navigate to and select a client',
  risk: 'read',
  parameters: {
    clientId: { type: 'string', required: true, description: 'Client id or name' },
  },
  execute(params, state) {
    const client = findClient(state, params.clientId as string);
    if (!client) {
      return { success: false, message: `Client not found: ${params.clientId}`, actions: [] };
    }
    return {
      success: true,
      message: `Showing ${client.name}`,
      data: { clientId: client.id },
      actions: [
        { type: 'NAVIGATE', payload: 'clients' },
        { type: 'SELECT_CLIENT', payload: client.id },
      ],
    };
  },
};

const updateClient: ToolDefinition = {
  name: 'updateClient',
  description: 'Update client stage, status, or next action',
  risk: 'write',
  parameters: {
    clientId: { type: 'string', required: true, description: 'Client id or name' },
    stage: {
      type: 'string', required: false, description: 'New stage',
      enum: ['Discovery', 'Solution Design', 'Build', 'Live'],
    },
    status: {
      type: 'string', required: false, description: 'New status',
      enum: ['On track', 'Needs input', 'Blocked'],
    },
    nextAction: { type: 'string', required: false, description: 'Updated next action' },
  },
  execute(params, state) {
    const client = findClient(state, params.clientId as string);
    if (!client) {
      return { success: false, message: `Client not found: ${params.clientId}`, actions: [] };
    }
    const updated: Client = {
      ...client,
      ...(params.stage ? { stage: params.stage as Client['stage'] } : {}),
      ...(params.status ? { status: params.status as Client['status'] } : {}),
      ...(params.nextAction ? { nextAction: params.nextAction as string } : {}),
      updatedAt: now(),
    };
    return {
      success: true,
      message: `Updated ${client.name}`,
      data: { clientId: client.id, changes: params },
      actions: [{ type: 'UPSERT_CLIENT', payload: updated }],
    };
  },
};

const createTask: ToolDefinition = {
  name: 'createTask',
  description: 'Create a new task',
  risk: 'write',
  parameters: {
    title: { type: 'string', required: true, description: 'Task title' },
    priority: {
      type: 'string', required: false, description: 'Task priority',
      enum: ['low', 'medium', 'high'],
    },
    clientId: { type: 'string', required: false, description: 'Related client id' },
  },
  execute(params, state) {
    // Idempotency: don't create duplicate tasks with same title
    const existing = state.tasks.find(t => t.title.toLowerCase() === (params.title as string).toLowerCase());
    if (existing) {
      return { success: true, message: `Task already exists: "${params.title}"`, actions: [], data: { taskId: existing.id, idempotent: true } };
    }
    const task: Task = {
      id: uid('task'),
      title: params.title as string,
      status: 'pending',
      priority: (params.priority as Task['priority']) ?? 'medium',
      clientId: params.clientId ? findClient(state, params.clientId as string)?.id : undefined,
      createdAt: now(),
      updatedAt: now(),
    };
    return {
      success: true,
      message: `Task created: "${task.title}"`,
      data: { taskId: task.id },
      actions: [{ type: 'UPSERT_TASK', payload: task }],
    };
  },
};

const createKnowledge: ToolDefinition = {
  name: 'createKnowledge',
  description: 'Save information to the knowledge base',
  risk: 'write',
  parameters: {
    title: { type: 'string', required: true, description: 'Knowledge entry title' },
    content: { type: 'string', required: true, description: 'Knowledge content' },
    category: {
      type: 'string', required: false, description: 'Category',
      enum: ['general', 'technical', 'client', 'business', 'process'],
    },
    clientId: { type: 'string', required: false, description: 'Related client id' },
    important: { type: 'boolean', required: false, description: 'Mark as important' },
  },
  execute(params, state) {
    const entry: KnowledgeItem = {
      id: uid('k'),
      title: params.title as string,
      content: params.content as string,
      category: (params.category as KnowledgeItem['category']) ?? 'general',
      clientId: params.clientId ? findClient(state, params.clientId as string)?.id : undefined,
      important: (params.important as boolean) ?? false,
      tags: [],
      createdAt: now(),
      updatedAt: now(),
    };
    return {
      success: true,
      message: `Saved to Knowledge: "${entry.title}"`,
      data: { knowledgeId: entry.id },
      actions: [{ type: 'UPSERT_KNOWLEDGE', payload: entry }],
    };
  },
};

const createLesson: ToolDefinition = {
  name: 'createLesson',
  description: 'Record a lesson learned',
  risk: 'write',
  parameters: {
    title: { type: 'string', required: true, description: 'Lesson title' },
    learning: { type: 'string', required: true, description: 'What was learned' },
    context: { type: 'string', required: false, description: 'Context in which it was learned' },
    application: { type: 'string', required: false, description: 'How to apply this lesson' },
    clientId: { type: 'string', required: false, description: 'Related client id' },
  },
  execute(params, state) {
    const lesson: Lesson = {
      id: uid('lesson'),
      title: params.title as string,
      learning: params.learning as string,
      context: (params.context as string) ?? '',
      application: (params.application as string) ?? '',
      clientId: params.clientId ? findClient(state, params.clientId as string)?.id : undefined,
      tags: [],
      createdAt: now(),
      updatedAt: now(),
    };
    return {
      success: true,
      message: `Lesson recorded: "${lesson.title}"`,
      data: { lessonId: lesson.id },
      actions: [{ type: 'UPSERT_LESSON', payload: lesson }],
    };
  },
};

const createDecision: ToolDefinition = {
  name: 'createDecision',
  description: 'Record a decision',
  risk: 'write',
  parameters: {
    problem: { type: 'string', required: true, description: 'Problem being solved' },
    decision: { type: 'string', required: true, description: 'Decision made' },
    expectedOutcome: { type: 'string', required: false, description: 'Expected outcome' },
    clientId: { type: 'string', required: false, description: 'Related client id' },
  },
  execute(params, state) {
    const decision: Decision = {
      id: uid('dec'),
      problem: params.problem as string,
      decision: params.decision as string,
      reasons: [],
      alternatives: [],
      expectedOutcome: (params.expectedOutcome as string) ?? '',
      clientId: params.clientId ? findClient(state, params.clientId as string)?.id : undefined,
      tags: [],
      createdAt: now(),
      updatedAt: now(),
    };
    return {
      success: true,
      message: `Decision recorded: "${decision.problem}"`,
      data: { decisionId: decision.id },
      actions: [{ type: 'UPSERT_DECISION', payload: decision }],
    };
  },
};

const createResearch: ToolDefinition = {
  name: 'createResearch',
  description: 'Create a research entry',
  risk: 'write',
  parameters: {
    question: { type: 'string', required: true, description: 'Research question' },
    finding: { type: 'string', required: true, description: 'Finding or answer' },
    relevance: { type: 'string', required: false, description: 'Relevance level', enum: ['low', 'medium', 'high'] },
    clientId: { type: 'string', required: false, description: 'Related client id' },
  },
  execute(params, state) {
    const entry: ResearchEntry = {
      id: uid('res'),
      question: params.question as string,
      finding: params.finding as string,
      relevance: (params.relevance as ResearchEntry['relevance']) ?? 'medium',
      clientId: params.clientId ? findClient(state, params.clientId as string)?.id : undefined,
      tags: [],
      createdAt: now(),
      updatedAt: now(),
    };
    return {
      success: true,
      message: `Research entry created: "${entry.question}"`,
      data: { researchId: entry.id },
      actions: [{ type: 'UPSERT_RESEARCH', payload: entry }],
    };
  },
};

const updateOpportunity: ToolDefinition = {
  name: 'updateOpportunity',
  description: 'Update an existing opportunity stage or details',
  risk: 'write',
  parameters: {
    opportunityId: { type: 'string', required: false, description: 'Opportunity id' },
    company: { type: 'string', required: false, description: 'Company name to match' },
    stage: {
      type: 'string', required: false, description: 'New stage',
      enum: ['Lead', 'Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    },
    nextAction: { type: 'string', required: false, description: 'Updated next action' },
  },
  execute(params, state) {
    const opp = params.opportunityId
      ? state.opportunities.find(o => o.id === params.opportunityId)
      : state.opportunities.find(o => o.company.toLowerCase().includes((params.company as string ?? '').toLowerCase()));
    if (!opp) {
      return { success: false, message: 'Opportunity not found', actions: [] };
    }
    const updated: Opportunity = {
      ...opp,
      ...(params.stage ? { stage: params.stage as Opportunity['stage'] } : {}),
      ...(params.nextAction ? { nextAction: params.nextAction as string } : {}),
      updatedAt: now(),
    };
    return {
      success: true,
      message: `Updated opportunity for ${opp.company}`,
      data: { opportunityId: opp.id },
      actions: [{ type: 'UPSERT_OPPORTUNITY', payload: updated }],
    };
  },
};

const listClients: ToolDefinition = {
  name: 'listClients',
  description: 'Navigate to and show client list',
  risk: 'read',
  parameters: {},
  execute() {
    return {
      success: true,
      message: 'Showing all clients',
      actions: [{ type: 'NAVIGATE', payload: 'clients' }],
    };
  },
};

const listOpportunities: ToolDefinition = {
  name: 'listOpportunities',
  description: 'Navigate to sales pipeline',
  risk: 'read',
  parameters: {},
  execute() {
    return {
      success: true,
      message: 'Showing sales pipeline',
      actions: [{ type: 'NAVIGATE', payload: 'sales' }],
    };
  },
};

const analyzeClient: ToolDefinition = {
  name: 'analyzeClient',
  description: 'Gather and summarize all information about a client',
  risk: 'read',
  parameters: {
    clientId: { type: 'string', required: true, description: 'Client id or name' },
  },
  execute(params, state) {
    const client = findClient(state, params.clientId as string);
    if (!client) {
      return { success: false, message: `Client not found: ${params.clientId}`, actions: [] };
    }
    const tasks = state.tasks.filter(t => t.clientId === client.id);
    const knowledge = state.knowledge.filter(k => k.clientId === client.id);
    const opportunities = state.opportunities.filter(o =>
      o.clientId === client.id || o.company.toLowerCase().includes(client.name.toLowerCase())
    );
    return {
      success: true,
      message: `Analysis complete for ${client.name}`,
      data: {
        client,
        taskCount: tasks.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        knowledgeCount: knowledge.length,
        opportunities,
      },
      actions: [
        { type: 'NAVIGATE', payload: 'clients' },
        { type: 'SELECT_CLIENT', payload: client.id },
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

class ToolRegistryClass {
  private tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  all(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  names(): string[] {
    return Array.from(this.tools.keys());
  }
}

export const ToolRegistry = new ToolRegistryClass();

// Register all tools
[
  navigateToSection,
  viewClient,
  updateClient,
  createTask,
  createKnowledge,
  createLesson,
  createDecision,
  createResearch,
  updateOpportunity,
  listClients,
  listOpportunities,
  analyzeClient,
].forEach(t => ToolRegistry.register(t));
