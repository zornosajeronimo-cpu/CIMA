import type { Execution } from '@/models';
import { storageGet, storageSet } from './storage';
const KEY = 'cima:executions';
export function loadExecutions(): Execution[] | null { return storageGet<Execution[]>(KEY); }
export function saveExecutions(items: Execution[]): void { storageSet(KEY, items); }
