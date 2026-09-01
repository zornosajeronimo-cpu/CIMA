import type { Agent } from '@/models';
import { storageGet, storageSet } from './storage';
const KEY = 'cima:agents';
export function loadAgents(): Agent[] | null { return storageGet<Agent[]>(KEY); }
export function saveAgents(items: Agent[]): void { storageSet(KEY, items); }

