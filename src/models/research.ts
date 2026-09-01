export interface ResearchEntry {
  id: string;
  question: string;
  source?: string;
  finding: string;
  conclusion?: string;
  relevance: 'low' | 'medium' | 'high';
  clientId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
