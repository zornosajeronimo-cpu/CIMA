import type { Command } from '@/models';
import { storageGet, storageSet } from './storage';
const KEY = 'cima:command-history';
export function loadCommandHistory(): Command[] | null { return storageGet<Command[]>(KEY); }
export function saveCommandHistory(items: Command[]): void { storageSet(KEY, items); }
