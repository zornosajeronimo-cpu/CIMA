import type { Automation } from '@/models';
import { storageGet, storageSet } from './storage';
const KEY = 'cima:automations';
export function loadAutomations(): Automation[] | null { return storageGet<Automation[]>(KEY); }
export function saveAutomations(items: Automation[]): void { storageSet(KEY, items); }

