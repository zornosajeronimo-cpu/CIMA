export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed';
export interface ExecutionStep {
  label: string;
  detail?: string;
  timestamp: string;
}
export interface Execution {
  id: string;
  commandId: string;
  commandText: string;
  intentType: string;
  toolName?: string;
  status: ExecutionStatus;
  steps: ExecutionStep[];
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}
