type EventHandler<T = unknown> = (payload: T) => void;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler as EventHandler);
    return () => this.off(event, handler as EventHandler);
  }

  off(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event) ?? [];
    this.handlers.set(event, list.filter(h => h !== handler));
  }

  emit<T>(event: string, payload: T): void {
    (this.handlers.get(event) ?? []).forEach(h => h(payload));
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  COMMAND_CREATED: 'command:created',
  COMMAND_STARTED: 'command:started',
  COMMAND_COMPLETED: 'command:completed',
  COMMAND_FAILED: 'command:failed',
  CLIENT_CREATED: 'client:created',
  CLIENT_UPDATED: 'client:updated',
  TASK_COMPLETED: 'task:completed',
  TASK_CREATED: 'task:created',
  KNOWLEDGE_CREATED: 'knowledge:created',
  RESEARCH_CREATED: 'research:created',
  LESSON_CREATED: 'lesson:created',
  DECISION_CREATED: 'decision:created',
  EXPERIMENT_CREATED: 'experiment:created',
  OPPORTUNITY_CREATED: 'opportunity:created',
  EXECUTION_UPDATED: 'execution:updated',
} as const;
