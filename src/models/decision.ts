export interface Decision {
  id: string;
  problem: string;
  decision: string;
  reasons: string[];
  alternatives: string[];
  expectedOutcome: string;
  clientId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
