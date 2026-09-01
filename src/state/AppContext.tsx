import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { AppAction } from './reducer';
import { appReducer, INITIAL_STATE } from './reducer';
import type { AppState } from './reducer';
import { routeCommand } from '@/core/router/router';
import type { Execution, Command, Activity } from '@/models';
import {
  SEED_CLIENTS, SEED_TASKS, SEED_ACTIVITIES, SEED_KNOWLEDGE,
  SEED_RESEARCH, SEED_DECISIONS, SEED_LESSONS, SEED_OPPORTUNITIES,
  SEED_BUSINESS_SYSTEMS, SEED_AUTOMATIONS, SEED_AGENTS
} from '@/data/seed';
import { loadClients, saveClients } from '@/storage/clientStorage';
import { loadTasks, saveTasks } from '@/storage/taskStorage';
import { loadActivities, saveActivities } from '@/storage/activityStorage';
import { loadKnowledge, saveKnowledge } from '@/storage/knowledgeStorage';
import { loadResearch, saveResearch } from '@/storage/researchStorage';
import { loadDecisions, saveDecisions } from '@/storage/decisionStorage';
import { loadLessons, saveLessons } from '@/storage/lessonStorage';
import { loadExperiments, saveExperiments } from '@/storage/experimentStorage';
import { loadOpportunities, saveOpportunities } from '@/storage/opportunityStorage';
import { loadBusinessSystems, saveBusinessSystems } from '@/storage/businessSystemStorage';
import { loadAutomations, saveAutomations } from '@/storage/automationStorage';
import { loadAgents, saveAgents } from '@/storage/agentStorage';
import { loadExecutions, saveExecutions } from '@/storage/executionStorage';
import { loadCommandHistory, saveCommandHistory } from '@/storage/commandHistoryStorage';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  submitCommand: (text: string) => Promise<void>;
  navigate: (section: string) => void;
  selectClient: (id: string | null) => void;
  toggleTask: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  // Load from storage on mount, fall back to seed
  useEffect(() => {
    dispatch({ type: 'LOAD_STATE', payload: {
      clients: loadClients() ?? SEED_CLIENTS,
      tasks: loadTasks() ?? SEED_TASKS,
      activities: loadActivities() ?? SEED_ACTIVITIES,
      knowledge: loadKnowledge() ?? SEED_KNOWLEDGE,
      research: loadResearch() ?? SEED_RESEARCH,
      decisions: loadDecisions() ?? SEED_DECISIONS,
      lessons: loadLessons() ?? SEED_LESSONS,
      experiments: loadExperiments() ?? [],
      opportunities: loadOpportunities() ?? SEED_OPPORTUNITIES,
      businessSystems: loadBusinessSystems() ?? SEED_BUSINESS_SYSTEMS,
      automations: loadAutomations() ?? SEED_AUTOMATIONS,
      agents: loadAgents() ?? SEED_AGENTS,
      executions: loadExecutions() ?? [],
      commandHistory: loadCommandHistory() ?? [],
    }});
  }, []);

  // Persist on change
  useEffect(() => { if (state.clients.length) saveClients(state.clients); }, [state.clients]);
  useEffect(() => { if (state.tasks.length) saveTasks(state.tasks); }, [state.tasks]);
  useEffect(() => { saveActivities(state.activities); }, [state.activities]);
  useEffect(() => { saveKnowledge(state.knowledge); }, [state.knowledge]);
  useEffect(() => { saveResearch(state.research); }, [state.research]);
  useEffect(() => { saveDecisions(state.decisions); }, [state.decisions]);
  useEffect(() => { saveLessons(state.lessons); }, [state.lessons]);
  useEffect(() => { saveExperiments(state.experiments); }, [state.experiments]);
  useEffect(() => { saveOpportunities(state.opportunities); }, [state.opportunities]);
  useEffect(() => { saveBusinessSystems(state.businessSystems); }, [state.businessSystems]);
  useEffect(() => { saveAutomations(state.automations); }, [state.automations]);
  useEffect(() => { saveAgents(state.agents); }, [state.agents]);
  useEffect(() => { saveExecutions(state.executions); }, [state.executions]);
  useEffect(() => { saveCommandHistory(state.commandHistory); }, [state.commandHistory]);

  const navigate = useCallback((section: string) => {
    dispatch({ type: 'NAVIGATE', payload: section });
  }, []);

  const selectClient = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_CLIENT', payload: id });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  }, []);

  const submitCommand = useCallback(async (text: string) => {
    if (!text.trim() || state.isCommandRunning) return;
    dispatch({ type: 'SET_COMMAND_RUNNING', payload: true });

    const command: Command = {
      id: `cmd-${Date.now()}`,
      input: text.trim(),
      timestamp: new Date().toISOString(),
      status: 'received',
    };
    dispatch({ type: 'ADD_COMMAND_HISTORY', payload: command });

    const executionId = `exec-${Date.now()}`;
    const execution: Execution = {
      id: executionId,
      commandId: command.id,
      commandText: text,
      intentType: 'UNKNOWN',
      status: 'running',
      steps: [{ label: 'Command received', timestamp: new Date().toISOString() }],
      startedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_EXECUTION', payload: execution });

    try {
      await new Promise(r => setTimeout(r, 500));

      const { intent, result } = routeCommand(command);

      const completedExecution: Execution = {
        ...execution,
        intentType: intent.type,
        toolName: result.toolName,
        status: 'completed',
        completedAt: new Date().toISOString(),
        steps: [
          ...execution.steps,
          { label: 'Intent identified', detail: intent.type, timestamp: new Date().toISOString() },
          { label: 'Tool selected', detail: result.toolName, timestamp: new Date().toISOString() },
          { label: 'Completed', detail: result.message, timestamp: new Date().toISOString() },
        ],
      };
      dispatch({ type: 'UPDATE_EXECUTION', payload: completedExecution });

      result.actions.forEach(a => dispatch(a));

      const activity: Activity = {
        id: `act-${Date.now()}`,
        type: 'command',
        label: result.message,
        timestamp: new Date().toISOString(),
        state: 'done',
      };
      dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    } catch (err) {
      const failedExecution: Execution = {
        ...execution,
        status: 'failed',
        error: String(err),
        completedAt: new Date().toISOString(),
        steps: [
          ...execution.steps,
          { label: 'Failed', detail: String(err), timestamp: new Date().toISOString() },
        ],
      };
      dispatch({ type: 'UPDATE_EXECUTION', payload: failedExecution });
    } finally {
      dispatch({ type: 'SET_COMMAND_RUNNING', payload: false });
    }
  }, [state.isCommandRunning]);

  return (
    <AppContext.Provider value={{ state, dispatch, submitCommand, navigate, selectClient, toggleTask }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
}
