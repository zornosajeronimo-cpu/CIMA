import type { 
  Client, Task, Activity, Command,
  KnowledgeItem, ResearchEntry, Decision, Lesson, 
  Experiment, Opportunity, BusinessSystem, 
  Automation, Agent, Execution 
} from '@/models';

export interface AppState {
  clients: Client[];
  tasks: Task[];
  activities: Activity[];
  activeSection: string;
  selectedClientId: string | null;
  knowledge: KnowledgeItem[];
  research: ResearchEntry[];
  decisions: Decision[];
  lessons: Lesson[];
  experiments: Experiment[];
  opportunities: Opportunity[];
  businessSystems: BusinessSystem[];
  automations: Automation[];
  agents: Agent[];
  executions: Execution[];
  searchQuery: string;
  commandHistory: Command[];
  isCommandRunning: boolean;
}

export type AppAction = 
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'NAVIGATE'; payload: string }
  | { type: 'SELECT_CLIENT'; payload: string | null }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'ADD_EXECUTION'; payload: Execution }
  | { type: 'UPDATE_EXECUTION'; payload: Execution }
  | { type: 'SET_COMMAND_RUNNING'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'UPSERT_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'UPSERT_TASK'; payload: Task }
  | { type: 'UPSERT_KNOWLEDGE'; payload: KnowledgeItem }
  | { type: 'DELETE_KNOWLEDGE'; payload: string }
  | { type: 'UPSERT_RESEARCH'; payload: ResearchEntry }
  | { type: 'UPSERT_DECISION'; payload: Decision }
  | { type: 'UPSERT_LESSON'; payload: Lesson }
  | { type: 'UPSERT_EXPERIMENT'; payload: Experiment }
  | { type: 'UPSERT_OPPORTUNITY'; payload: Opportunity }
  | { type: 'UPDATE_OPPORTUNITY_STAGE'; payload: { id: string; stage: Opportunity['stage'] } }
  | { type: 'UPSERT_BUSINESS_SYSTEM'; payload: BusinessSystem }
  | { type: 'UPSERT_AUTOMATION'; payload: Automation }
  | { type: 'RUN_AUTOMATION_SIMULATION'; payload: string }
  | { type: 'ADD_COMMAND_HISTORY'; payload: Command };

export const INITIAL_STATE: AppState = {
  clients: [],
  tasks: [],
  activities: [],
  activeSection: 'overview',
  selectedClientId: null,
  knowledge: [],
  research: [],
  decisions: [],
  lessons: [],
  experiments: [],
  opportunities: [],
  businessSystems: [],
  automations: [],
  agents: [],
  executions: [],
  searchQuery: '',
  commandHistory: [],
  isCommandRunning: false,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'NAVIGATE':
      return { ...state, activeSection: action.payload, searchQuery: '' };
    case 'SELECT_CLIENT':
      return { ...state, selectedClientId: action.payload };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t),
      };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities].slice(0, 50) };
    case 'ADD_EXECUTION':
      return { ...state, executions: [action.payload, ...state.executions].slice(0, 20) };
    case 'UPDATE_EXECUTION':
      return {
        ...state,
        executions: state.executions.map(e => e.id === action.payload.id ? action.payload : e),
      };
    case 'SET_COMMAND_RUNNING':
      return { ...state, isCommandRunning: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'UPSERT_CLIENT': {
      const exists = state.clients.some(c => c.id === action.payload.id);
      return { ...state, clients: exists ? state.clients.map(c => c.id === action.payload.id ? action.payload : c) : [...state.clients, action.payload] };
    }
    case 'DELETE_CLIENT':
      return { ...state, clients: state.clients.filter(c => c.id !== action.payload) };
    case 'UPSERT_TASK': {
      const exists = state.tasks.some(t => t.id === action.payload.id);
      return { ...state, tasks: exists ? state.tasks.map(t => t.id === action.payload.id ? action.payload : t) : [...state.tasks, action.payload] };
    }
    case 'UPSERT_KNOWLEDGE': {
      const exists = state.knowledge.some(k => k.id === action.payload.id);
      return { ...state, knowledge: exists ? state.knowledge.map(k => k.id === action.payload.id ? action.payload : k) : [...state.knowledge, action.payload] };
    }
    case 'DELETE_KNOWLEDGE':
      return { ...state, knowledge: state.knowledge.filter(k => k.id !== action.payload) };
    case 'UPSERT_RESEARCH': {
      const exists = state.research.some(r => r.id === action.payload.id);
      return { ...state, research: exists ? state.research.map(r => r.id === action.payload.id ? action.payload : r) : [...state.research, action.payload] };
    }
    case 'UPSERT_DECISION': {
      const exists = state.decisions.some(d => d.id === action.payload.id);
      return { ...state, decisions: exists ? state.decisions.map(d => d.id === action.payload.id ? action.payload : d) : [...state.decisions, action.payload] };
    }
    case 'UPSERT_LESSON': {
      const exists = state.lessons.some(l => l.id === action.payload.id);
      return { ...state, lessons: exists ? state.lessons.map(l => l.id === action.payload.id ? action.payload : l) : [...state.lessons, action.payload] };
    }
    case 'UPSERT_EXPERIMENT': {
      const exists = state.experiments.some(e => e.id === action.payload.id);
      return { ...state, experiments: exists ? state.experiments.map(e => e.id === action.payload.id ? action.payload : e) : [...state.experiments, action.payload] };
    }
    case 'UPSERT_OPPORTUNITY': {
      const exists = state.opportunities.some(o => o.id === action.payload.id);
      return { ...state, opportunities: exists ? state.opportunities.map(o => o.id === action.payload.id ? action.payload : o) : [...state.opportunities, action.payload] };
    }
    case 'UPDATE_OPPORTUNITY_STAGE':
      return {
        ...state,
        opportunities: state.opportunities.map(o => o.id === action.payload.id ? { ...o, stage: action.payload.stage } : o),
      };
    case 'UPSERT_BUSINESS_SYSTEM': {
      const exists = state.businessSystems.some(b => b.id === action.payload.id);
      return { ...state, businessSystems: exists ? state.businessSystems.map(b => b.id === action.payload.id ? action.payload : b) : [...state.businessSystems, action.payload] };
    }
    case 'UPSERT_AUTOMATION': {
      const exists = state.automations.some(a => a.id === action.payload.id);
      return { ...state, automations: exists ? state.automations.map(a => a.id === action.payload.id ? action.payload : a) : [...state.automations, action.payload] };
    }
    case 'RUN_AUTOMATION_SIMULATION':
      return {
        ...state,
        automations: state.automations.map(a => a.id === action.payload ? { ...a, status: 'simulating' } : a),
      };
    case 'ADD_COMMAND_HISTORY':
      return { ...state, commandHistory: [action.payload, ...state.commandHistory].slice(0, 50) };
    default:
      return state;
  }
}
