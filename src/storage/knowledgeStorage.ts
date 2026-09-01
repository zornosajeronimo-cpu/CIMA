import type { KnowledgeItem } from '@/models';
import { storageGet, storageSet } from './storage';
const KEY = 'cima:knowledge';
export function loadKnowledge(): KnowledgeItem[] | null { return storageGet<KnowledgeItem[]>(KEY); }
export function saveKnowledge(items: KnowledgeItem[]): void { storageSet(KEY, items); }
