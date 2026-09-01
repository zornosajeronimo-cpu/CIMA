export type ExperimentStatus = 'planned' | 'running' | 'completed' | 'failed';
export interface Experiment {
  id: string;
  hypothesis: string;
  objective: string;
  method: string;
  result?: string;
  conclusion?: string;
  status: ExperimentStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
