'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  hydrated: boolean;
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(
  undefined,
);

const STORAGE_KEY = 'md-editor-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredTheme(defaultTheme: Theme): Theme {
  if (typeof window === 'undefined') return defaultTheme;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return defaultTheme;
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    resolveTheme(defaultTheme),
  );
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from storage
  useEffect(() => {
    const stored = getStoredTheme(defaultTheme);
    setThemeState(stored);
    setResolvedTheme(resolveTheme(stored));
    setHydrated(true);
  }, [defaultTheme]);

  // Apply theme class to <html>
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [hydrated, resolvedTheme]);

  // Track system theme changes when set to "system"
  useEffect(() => {
    if (!hydrated || theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolvedTheme(getSystemTheme());
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [hydrated, theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
    setThemeState(next);
    setResolvedTheme(resolveTheme(next));
  }, []);

  return (
    <ThemeProviderContext.Provider
      value={{ theme, setTheme, resolvedTheme, hydrated }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
