import type { BusinessSystem } from '@/models';
import { storageGet, storageSet } from './storage';
const KEY = 'cima:business-systems';
export function loadBusinessSystems(): BusinessSystem[] | null { return storageGet<BusinessSystem[]>(KEY); }
export function saveBusinessSystems(items: BusinessSystem[]): void { storageSet(KEY, items); }
