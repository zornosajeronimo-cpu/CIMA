export interface Lesson {
  id: string;
  title: string;
  context: string;
  learning: string;
  application: string;
  clientId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
