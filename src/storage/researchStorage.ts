import type { ResearchEntry } from '@/models';
import { storageGet, storageSet } from './storage';
const KEY = 'cima:research';
export function loadResearch(): ResearchEntry[] | null { return storageGet<ResearchEntry[]>(KEY); }
export function saveResearch(items: ResearchEntry[]): void { storageSet(KEY, items); }

