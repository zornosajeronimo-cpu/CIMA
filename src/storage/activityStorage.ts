import type { Activity } from '@/models';
import { storageGet, storageSet } from './storage';

const KEY = 'cima:activities';
const MAX_ACTIVITIES = 50; // Keep the feed lean

export function loadActivities(): Activity[] | null {
  return storageGet<Activity[]>(KEY);
}

export function saveActivities(activities: Activity[]): void {
  // Trim to max to avoid unbounded growth
  storageSet(KEY, activities.slice(0, MAX_ACTIVITIES));
}
