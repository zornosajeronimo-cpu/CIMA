import type { Experiment } from '@/models';
import { storageGet, storageSet } from './storage';
const KEY = 'cima:experiments';
export function loadExperiments(): Experiment[] | null { return storageGet<Experiment[]>(KEY); }
export function saveExperiments(items: Experiment[]): void { storageSet(KEY, items); }

