import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { AppAction } from './reducer';
import { appReducer, INITIAL_STATE } from './reducer';
import type { AppState } from './reducer';
import { brain } from '@/core/brain/brain';
import type { Activity, Command } from '@/models';
import type { ActionPlan } from '@/models/actionPlan';
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
  confirmPlan: () => Promise<void>;
  cancelPlan: () => void;
  navigate: (section: string) => void;
  selectClient: (id: string | null) => void;
  toggleTask: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  // ── Load from storage on mount ────────────────────────────────────────────
  useEffect(() => {
    dispatch({
      type: 'LOAD_STATE', payload: {
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
      }
    });
  }, []);

  // ── Persist on change ─────────────────────────────────────────────────────
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const navigate = useCallback((section: string) => {
    dispatch({ type: 'NAVIGATE', payload: section });
  }, []);

  const selectClient = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_CLIENT', payload: id });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  }, []);

  // ── Execute a plan (shared between submitCommand and confirmPlan) ──────────
  const executePlan = useCallback(async (plan: ActionPlan, currentState: AppState) => {
    dispatch({ type: 'SET_COMMAND_STATE', payload: 'executing' });

    const { updatedPlan, allActions } = brain.executePlan(plan, currentState);

    // Dispatch all state mutations from tool execution
    allActions.forEach(a => dispatch(a));

    // Update execution trace
    dispatch({ type: 'SET_LAST_COMPLETED_PLAN', payload: updatedPlan });
    dispatch({ type: 'SET_PENDING_CONFIRMATION', payload: null });

    // Add activity
    const succeeded = updatedPlan.actions.filter(a => a.status === 'completed').length;
    const failed = updatedPlan.actions.filter(a => a.status === 'failed').length;
    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: 'command',
      label: updatedPlan.status === 'completed'
        ? updatedPlan.aiMessage
        : `Completed with ${failed} error${failed > 1 ? 's' : ''} — ${succeeded} action${succeeded !== 1 ? 's' : ''} succeeded`,
      timestamp: new Date().toISOString(),
      state: updatedPlan.status === 'completed' ? 'done' : 'active',
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    dispatch({ type: 'SET_COMMAND_STATE', payload: updatedPlan.status === 'failed' ? 'failed' : 'completed' });
    dispatch({ type: 'SET_COMMAND_RUNNING', payload: false });

    // Brief "completed" flash, then return to idle
    setTimeout(() => dispatch({ type: 'SET_COMMAND_STATE', payload: 'idle' }), 2000);
  }, []);

  // ── submitCommand — full AI pipeline ─────────────────────────────────────
  const submitCommand = useCallback(async (text: string) => {
    if (!text.trim() || state.isCommandRunning) return;

    dispatch({ type: 'SET_COMMAND_RUNNING', payload: true });
    dispatch({ type: 'SET_COMMAND_STATE', payload: 'thinking' });

    const commandId = `cmd-${Date.now()}`;
    const command: Command = {
      id: commandId,
      input: text.trim(),
      timestamp: new Date().toISOString(),
      status: 'received',
    };
    dispatch({ type: 'ADD_COMMAND_HISTORY', payload: command });

    try {
      dispatch({ type: 'SET_COMMAND_STATE', payload: 'planning' });

      // AI Brain processes the command
      const { plan } = await brain.process(text, commandId, state);

      if (plan.requiresConfirmation) {
        // Put the plan on hold — user must confirm
        dispatch({ type: 'SET_PENDING_CONFIRMATION', payload: plan });
        dispatch({ type: 'SET_COMMAND_STATE', payload: 'awaiting_confirmation' });
        dispatch({ type: 'SET_COMMAND_RUNNING', payload: false });
        return;
      }

      // Auto-execute approved plan
      await executePlan(plan, state);

    } catch (err) {
      const activity: Activity = {
        id: `act-${Date.now()}`,
        type: 'system',
        label: `Command failed: ${String(err)}`,
        timestamp: new Date().toISOString(),
        state: 'active',
      };
      dispatch({ type: 'ADD_ACTIVITY', payload: activity });
      dispatch({ type: 'SET_COMMAND_STATE', payload: 'failed' });
      dispatch({ type: 'SET_COMMAND_RUNNING', payload: false });
      setTimeout(() => dispatch({ type: 'SET_COMMAND_STATE', payload: 'idle' }), 2000);
    }
  }, [state, executePlan]);

  // ── confirmPlan — user approved a pending plan ────────────────────────────
  const confirmPlan = useCallback(async () => {
    const plan = state.pendingConfirmation;
    if (!plan) return;

    dispatch({ type: 'SET_COMMAND_RUNNING', payload: true });
    await executePlan({ ...plan, status: 'approved' }, state);
  }, [state, executePlan]);

  // ── cancelPlan ────────────────────────────────────────────────────────────
  const cancelPlan = useCallback(() => {
    dispatch({ type: 'SET_PENDING_CONFIRMATION', payload: null });
    dispatch({ type: 'SET_COMMAND_STATE', payload: 'idle' });
    dispatch({ type: 'SET_COMMAND_RUNNING', payload: false });

    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: 'system',
      label: 'Action cancelled by user',
      timestamp: new Date().toISOString(),
      state: 'done',
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, submitCommand, confirmPlan, cancelPlan, navigate, selectClient, toggleTask }}>
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
