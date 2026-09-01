import type { Lesson } from '@/models';
import { storageGet, storageSet } from './storage';
const KEY = 'cima:lessons';
export function loadLessons(): Lesson[] | null { return storageGet<Lesson[]>(KEY); }
export function saveLessons(items: Lesson[]): void { storageSet(KEY, items); }

