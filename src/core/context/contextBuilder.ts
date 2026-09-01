import type { AppState } from '@/state/reducer';
import type { Intent } from '@/core/router/intents';
import type { Client } from '@/models';

export interface CommandContext {
  intent: Intent;
  relevantClient?: Client;
  recentActivities: string[];
  taskCount: { pending: number; done: number };
  timestamp: string;
}

export function buildContext(state: AppState, intent: Intent, commandText: string): CommandContext {
  let relevantClient: Client | undefined;
  if (intent.entities.clientName) {
    const name = intent.entities.clientName.toLowerCase();
    relevantClient = state.clients.find(c => c.name.toLowerCase().includes(name));
  } else {
    relevantClient = state.clients.find(c =>
      commandText.toLowerCase().includes(c.name.toLowerCase())
    );
  }

  return {
    intent,
    relevantClient,
    recentActivities: state.activities.slice(0, 3).map(a => a.label),
    taskCount: {
      pending: state.tasks.filter(t => t.status === 'pending').length,
      done: state.tasks.filter(t => t.status === 'done').length,
    },
    timestamp: new Date().toISOString(),
  };
}
