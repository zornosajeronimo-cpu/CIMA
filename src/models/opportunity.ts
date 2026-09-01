export type OpportunityStage = 'Lead' | 'Discovery' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export interface Opportunity {
  id: string;
  company: string;
  clientId?: string;
  value?: number;
  stage: OpportunityStage;
  probability?: number;
  nextAction: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
