export type TaskStatus = 'pending' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  meta?: string;        // e.g. "11:00", "Before 3pm", "Ongoing"
  clientId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}
