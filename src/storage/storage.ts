/// <reference types="vite/client" />

/**
 * Base localStorage helpers.
 * All components access data through typed storage modules — never directly.
 */

export function storageGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[CIMA storage] Failed to read key "${key}"`);
    return null;
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[CIMA storage] Failed to write key "${key}"`);
  }
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`[CIMA storage] Failed to remove key "${key}"`);
  }
}

/** Dev utility: wipe all CIMA keys from localStorage. */
export function storageReset(): void {
  const cimaKeys = Object.keys(localStorage).filter((k) => k.startsWith('cima:'));
  cimaKeys.forEach((k) => localStorage.removeItem(k));
  console.info('[CIMA storage] Reset complete. Refresh to reload seed data.');
}

// Expose dev utility on window in development
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).CIMA_RESET = storageReset;
  console.info('[CIMA] Dev: call CIMA_RESET() in console to reset local data.');
}
