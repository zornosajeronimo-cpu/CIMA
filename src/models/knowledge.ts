export type KnowledgeCategory = 'general' | 'client' | 'technical' | 'business' | 'process';
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  clientId?: string;
  important: boolean;
  createdAt: string;
  updatedAt: string;
}
