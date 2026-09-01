import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Client, Task, Activity, Command } from '@/models';
import { SEED_CLIENTS, SEED_TASKS, SEED_ACTIVITIES } from '@/data/seed';
import { loadClients, saveClients } from '@/storage/clientStorage';
import { loadTasks, saveTasks } from '@/storage/taskStorage';
import { loadActivities, saveActivities } from '@/storage/activityStorage';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface AppState {
  clients: Client[];
  tasks: Task[];
  activities: Activity[];
  /** Currently selected nav section id */
  activeSection: string;
  /** If non-null, shows ClientView for this client id */
  selectedClientId: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type AppAction =
  | { type: 'NAVIGATE'; payload: string }
  | { type: 'SELECT_CLIENT'; payload: string | null }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'SUBMIT_COMMAND'; payload: Command }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    case 'NAVIGATE':
      return { ...state, activeSection: action.payload, selectedClientId: null };

    case 'SELECT_CLIENT':
      return { ...state, selectedClientId: action.payload };

    case 'TOGGLE_TASK': {
      const now = new Date().toISOString();
      const tasks = state.tasks.map((t) =>
        t.id === action.payload
          ? { ...t, status: t.status === 'done' ? ('pending' as const) : ('done' as const), updatedAt: now }
          : t
      );
      return { ...state, tasks };
    }

    case 'SUBMIT_COMMAND': {
      const cmd = action.payload;
      const activity: Activity = {
        id: `act-${Date.now()}`,
        type: 'command',
        label: `Command received — "${cmd.input}"`,
        state: 'done',
        timestamp: cmd.timestamp,
      };
      // New activities go to the top
      return { ...state, activities: [activity, ...state.activities] };
    }

    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities] };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AppContextValue {
  state: AppState;
  navigate: (sectionId: string) => void;
  selectClient: (clientId: string | null) => void;
  toggleTask: (taskId: string) => void;
  submitCommand: (input: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const INITIAL_STATE: AppState = {
  clients: [],
  tasks: [],
  activities: [],
  activeSection: 'overview',
  selectedClientId: null,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  // Load from storage on mount
  useEffect(() => {
    const clients = loadClients() ?? SEED_CLIENTS;
    const tasks = loadTasks() ?? SEED_TASKS;
    const activities = loadActivities() ?? SEED_ACTIVITIES;
    dispatch({ type: 'LOAD_STATE', payload: { clients, tasks, activities } });
  }, []);

  // Persist clients on change
  useEffect(() => {
    if (state.clients.length > 0) saveClients(state.clients);
  }, [state.clients]);

  // Persist tasks on change
  useEffect(() => {
    if (state.tasks.length > 0) saveTasks(state.tasks);
  }, [state.tasks]);

  // Persist activities on change
  useEffect(() => {
    if (state.activities.length > 0) saveActivities(state.activities);
  }, [state.activities]);

  const navigate = useCallback((sectionId: string) => {
    dispatch({ type: 'NAVIGATE', payload: sectionId });
  }, []);

  const selectClient = useCallback((clientId: string | null) => {
    dispatch({ type: 'SELECT_CLIENT', payload: clientId });
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: taskId });
  }, []);

  const submitCommand = useCallback((input: string) => {
    const command: Command = {
      id: `cmd-${Date.now()}`,
      input: input.trim(),
      status: 'received',
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'SUBMIT_COMMAND', payload: command });
  }, []);

  return (
    <AppContext.Provider value={{ state, navigate, selectClient, toggleTask, submitCommand }}>
      {children}
    </AppContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
