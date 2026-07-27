'use client';

import { useCallback, useEffect, useState } from 'react';

type Updater<T> = T | ((current: T) => T);

function readSnapshot<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeSnapshot<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

/**
 * useLocalStorage — client-only state synced to window.localStorage.
 *
 * The initial render returns the `initialValue` (matching the server render)
 * to avoid hydration mismatches. After mount the hook hydrates from
 * localStorage. Writes are mirrored back to localStorage on every change.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: Updater<T>) => void, boolean] {
  // Always start with the fallback so server and client first render match.
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // After mount, hydrate from localStorage.
  useEffect(() => {
    // External-system sync (localStorage -> React state). One-shot on mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    setStoredValue(readSnapshot(key, initialValue));
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // We intentionally only run this once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Cross-tab updates only.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      setStoredValue(
        event.newValue === null
          ? initialValue
          : readSnapshot<T>(key, initialValue),
      );
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value: Updater<T>) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        writeSnapshot(key, next);
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue, hydrated];
}

