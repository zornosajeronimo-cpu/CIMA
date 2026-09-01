export type AgentStatus = 'idle' | 'running' | 'paused' | 'disabled';
export interface AgentTool {
  name: string;
  description: string;
}
export interface Agent {
  id: string;
  name: string;
  description: string;
  goal: string;
  tools: AgentTool[];
  status: AgentStatus;
  contextRequired: string[];
  createdAt: string;
  updatedAt: string;
}
