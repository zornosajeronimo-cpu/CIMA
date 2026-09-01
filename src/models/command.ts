export type CommandStatus = 'received' | 'processing' | 'completed' | 'failed';

/**
 * A Command represents a user-initiated instruction to CIMA.
 * Currently: received → activity logged.
 * Future: received → router → brain → tool → result → activity.
 */
export interface Command {
  id: string;
  input: string;
  status: CommandStatus;
  timestamp: string;
}
