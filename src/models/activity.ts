export type ActivityState = 'active' | 'queued' | 'done';
export type ActivityType =
  | 'command'
  | 'client_created'
  | 'client_updated'
  | 'task_created'
  | 'task_completed'
  | 'navigation'
  | 'system';

export interface Activity {
  id: string;
  type: ActivityType;
  label: string;
  state: ActivityState;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
