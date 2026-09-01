import type { Intent, IntentType } from './intents';
import type { AppAction } from '@/state/reducer';

export type HandlerResult = {
  actions: AppAction[];
  message: string;
  toolName: string;
};

export type IntentHandler = (intent: Intent, text: string) => HandlerResult;

const clientViewHandler: IntentHandler = (intent) => ({
  actions: [{ type: 'NAVIGATE', payload: 'clients' }],
  message: "Navigating to client: " + (intent.entities.clientName ?? 'list'),
  toolName: 'navigateToClient',
});

const clientListHandler: IntentHandler = () => ({
  actions: [{ type: 'NAVIGATE', payload: 'clients' }],
  message: 'Showing client list',
  toolName: 'listClients',
});

const taskCreateHandler: IntentHandler = (_intent, text) => {
  const title = text.replace(/agrega tarea|nueva tarea|add task|create task|crea tarea|agregar tarea/gi, '').trim();
  return {
    actions: [{ type: 'NAVIGATE', payload: 'overview' }],
    message: `Task queued: "${title || 'New task'}" — use the Tasks module to add it.`,
    toolName: 'createTask',
  };
};

const knowledgeCreateHandler: IntentHandler = (_intent, text) => ({
  actions: [{ type: 'NAVIGATE', payload: 'knowledge' }],
  message: `Opening Knowledge — save: "${text.slice(0, 40)}..."`,
  toolName: 'createKnowledge',
});

const researchCreateHandler: IntentHandler = () => ({
  actions: [{ type: 'NAVIGATE', payload: 'research' }],
  message: 'Opening Research module',
  toolName: 'createResearch',
});

const lessonCreateHandler: IntentHandler = () => ({
  actions: [{ type: 'NAVIGATE', payload: 'lessons' }],
  message: 'Opening Lessons — log your learning',
  toolName: 'createLesson',
});

const decisionCreateHandler: IntentHandler = () => ({
  actions: [{ type: 'NAVIGATE', payload: 'decisions' }],
  message: 'Opening Decisions — record this decision',
  toolName: 'createDecision',
});

const experimentCreateHandler: IntentHandler = () => ({
  actions: [{ type: 'NAVIGATE', payload: 'experiments' }],
  message: 'Opening Experiments',
  toolName: 'createExperiment',
});

const opportunityCreateHandler: IntentHandler = () => ({
  actions: [{ type: 'NAVIGATE', payload: 'sales' }],
  message: 'Opening Sales pipeline — add new opportunity',
  toolName: 'createOpportunity',
});

const opportunityListHandler: IntentHandler = () => ({
  actions: [{ type: 'NAVIGATE', payload: 'sales' }],
  message: 'Showing sales pipeline',
  toolName: 'listOpportunities',
});

const searchHandler: IntentHandler = (_intent, text) => ({
  actions: [{ type: 'SET_SEARCH_QUERY', payload: text }],
  message: `Searching for: "${text}"`,
  toolName: 'globalSearch',
});

const unknownHandler: IntentHandler = (_intent, text) => ({
  actions: [],
  message: `Command recorded: "${text}" — AI routing not connected yet.`,
  toolName: 'noop',
});

export const HANDLERS: Record<IntentType, IntentHandler> = {
  CLIENT_VIEW: clientViewHandler,
  CLIENT_LIST: clientListHandler,
  CLIENT_UPDATE: clientViewHandler,
  CLIENT_CREATE: clientListHandler,
  TASK_CREATE: taskCreateHandler,
  TASK_UPDATE: taskCreateHandler,
  TASK_LIST: () => ({ actions: [{ type: 'NAVIGATE', payload: 'overview' }], message: 'Showing tasks', toolName: 'listTasks' }),
  KNOWLEDGE_CREATE: knowledgeCreateHandler,
  KNOWLEDGE_LIST: () => ({ actions: [{ type: 'NAVIGATE', payload: 'knowledge' }], message: 'Showing knowledge base', toolName: 'listKnowledge' }),
  RESEARCH_CREATE: researchCreateHandler,
  LESSON_CREATE: lessonCreateHandler,
  DECISION_CREATE: decisionCreateHandler,
  EXPERIMENT_CREATE: experimentCreateHandler,
  OPPORTUNITY_CREATE: opportunityCreateHandler,
  OPPORTUNITY_LIST: opportunityListHandler,
  NAVIGATE: (_intent, text) => ({ actions: [], message: `Navigate: ${text}`, toolName: 'navigate' }),
  SEARCH: searchHandler,
  UNKNOWN: unknownHandler,
};

