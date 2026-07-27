'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

function readStorage<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') return initialValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return initialValue;
    const parsed = JSON.parse(raw) as unknown;
    return parsed as T;
  } catch (error) {
    console.error(`useLocalStorage: okunamadı "${key}"`, error);
    return initialValue;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`useLocalStorage: yazılamadı "${key}"`, error);
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [hydrated, setHydrated] = useState(false);
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const isFirstRender = useRef(true);

  // Hydrate from localStorage on the client only
  useEffect(() => {
    setStoredValue(readStorage<T>(key, initialValue));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Cross-tab sync
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      try {
        setStoredValue(
          event.newValue ? (JSON.parse(event.newValue) as T) : initialValue,
        );
      } catch {
        /* noop */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        writeStorage(key, next);
        return next;
      });
    },
    [key],
  );

  // Avoid spurious first-render warnings if caller logs
  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return [storedValue, setValue, hydrated];
}
