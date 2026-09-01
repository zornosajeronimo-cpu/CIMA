export type AutomationStatus = 'draft' | 'active' | 'paused' | 'simulating';
export interface AutomationTrigger {
  type: string;
  description: string;
}
export interface AutomationAction {
  order: number;
  tool: string;
  description: string;
  simulated: boolean;
}
export interface AutomationCondition {
  field: string;
  operator: string;
  value: string;
}
export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  status: AutomationStatus;
  lastRunAt?: string;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}
