import type { Task } from '@/models';
import { storageGet, storageSet } from './storage';

const KEY = 'cima:tasks';

export function loadTasks(): Task[] | null {
  return storageGet<Task[]>(KEY);
}

export function saveTasks(tasks: Task[]): void {
  storageSet(KEY, tasks);
}
