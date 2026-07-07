/**
 * lib/useLocalStorage.ts
 *
 * Custom hook: syncs a React state value to localStorage whenever it
 * changes, but only after the component has mounted (i.e. `enabled` is
 * true). This replaces the 5 identical useEffect patterns scattered across
 * DashboardContext.tsx with a single, tested abstraction.
 *
 * Usage:
 *   useSyncToLocalStorage('architax_tasks', tasks, isMounted.current);
 */

import { useEffect } from 'react';

/**
 * Writes `value` to localStorage under `key` on every change,
 * but only when `enabled` is true (i.e. after initial hydration).
 *
 * @param key     - The localStorage key to write to.
 * @param value   - The value to serialise and store (must be JSON-serialisable).
 * @param enabled - Set to false during initial mount to avoid overwriting
 *                  data that was just loaded from storage.
 */
export function useSyncToLocalStorage<T>(
  key: string,
  value: T,
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silent fail — storage quota exceeded or private browsing mode
    }
  }, [key, value, enabled]);
}
