import type { Opportunity } from '@/models';
import { storageGet, storageSet } from './storage';
const KEY = 'cima:opportunities';
export function loadOpportunities(): Opportunity[] | null { return storageGet<Opportunity[]>(KEY); }
export function saveOpportunities(items: Opportunity[]): void { storageSet(KEY, items); }

