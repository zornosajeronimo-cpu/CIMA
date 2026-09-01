import type { Client } from '@/models';
import { storageGet, storageSet } from './storage';

const KEY = 'cima:clients';

export function loadClients(): Client[] | null {
  return storageGet<Client[]>(KEY);
}

export function saveClients(clients: Client[]): void {
  storageSet(KEY, clients);
}
