'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

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

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: Updater<T>) => void, boolean] {
  const fallback = useMemo(() => initialValue, [initialValue]);
  // Lazy initializer already reads from localStorage on the client, so we
  // do NOT call setState inside an effect to "hydrate" the state.
  const [storedValue, setStoredValue] = useState<T>(() =>
    readSnapshot(key, fallback),
  );

  // Cross-tab updates only — StorageEvent is an external signal, not a
  // synchronous in-render setState.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      setStoredValue(
        event.newValue === null ? fallback : readSnapshot<T>(key, fallback),
      );
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, fallback]);

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

  return [storedValue, setValue, true];
}
