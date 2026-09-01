export type ClientStage = 'Discovery' | 'Solution Design' | 'Build' | 'Live';
export type ClientStatus = 'On track' | 'Needs input' | 'Blocked';

export interface Client {
  id: string;
  name: string;
  stage: ClientStage;
  status: ClientStatus;
  nextAction: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
