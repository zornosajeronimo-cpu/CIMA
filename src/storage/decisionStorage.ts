import type { Decision } from '@/models';
import { storageGet, storageSet } from './storage';
const KEY = 'cima:decisions';
export function loadDecisions(): Decision[] | null { return storageGet<Decision[]>(KEY); }
export function saveDecisions(items: Decision[]): void { storageSet(KEY, items); }

