'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { hydrateSettings } from '@/lib/editor-utils';
import type { EditorSettings } from '@/types/editor';

const STORAGE_KEY = 'md-editor-settings';

export const defaultSettings: EditorSettings = {
  fontSize: 16,
  lineHeight: 1.7,
  fontFamily: 'inter',
  wordWrap: true,
  spellCheck: true,
  autoSave: true,
  autoSaveInterval: 30000,
  showLineNumbers: false,
  showPreview: true,
  previewPosition: 'right',
  theme: 'system',
  mobileView: 'write',
};

function readSettings(): EditorSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return hydrateSettings(JSON.parse(raw));
  } catch {
    return defaultSettings;
  }
}

function writeSettings(settings: EditorSettings) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* noop */
  }
}

const FONT_STACKS: Record<EditorSettings['fontFamily'], string> = {
  inter: 'var(--font-inter), system-ui, sans-serif',
  'plus-jakarta-sans': 'var(--font-plus-jakarta-sans), system-ui, sans-serif',
  'fira-code': 'var(--font-fira-code), ui-monospace, monospace',
  'jetbrains-mono': 'var(--font-jetbrains-mono), ui-monospace, monospace',
};

const FONT_CLASSES: Record<EditorSettings['fontFamily'], string> = {
  inter: 'font-inter',
  'plus-jakarta-sans': 'font-plus-jakarta-sans',
  'fira-code': 'font-fira-code',
  'jetbrains-mono': 'font-jetbrains-mono',
};

interface FontContextValue {
  settings: EditorSettings;
  setSettings: (
    value: EditorSettings | ((prev: EditorSettings) => EditorSettings),
  ) => void;
  hydrated: boolean;
  defaults: EditorSettings;
}

const FontContext = createContext<FontContextValue | undefined>(undefined);

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<EditorSettings>(() =>
    readSettings(),
  );

  // Cross-tab sync only — StorageEvent is an external signal, not a
  // synchronous in-render setState.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setSettings(readSettings());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Apply font family — pure external-system sync (no setState).
  useEffect(() => {
    const root = document.documentElement;
    const family = FONT_STACKS[settings.fontFamily] ?? FONT_STACKS.inter;
    root.style.setProperty('--editor-font-family', family);
    Object.values(FONT_CLASSES).forEach((cls) => root.classList.remove(cls));
    root.classList.add(FONT_CLASSES[settings.fontFamily] ?? 'font-inter');
  }, [settings.fontFamily]);

  // Apply editor sizing — pure external-system sync.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--editor-font-size', `${settings.fontSize}px`);
    root.style.setProperty(
      '--editor-line-height',
      String(settings.lineHeight),
    );
  }, [settings.fontSize, settings.lineHeight]);

  // Persist on change.
  useEffect(() => {
    writeSettings(settings);
  }, [settings]);

  return (
    <FontContext.Provider
      value={{
        settings,
        setSettings,
        hydrated: true,
        defaults: defaultSettings,
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useEditorSettings() {
  const ctx = useContext(FontContext);
  if (!ctx) {
    throw new Error('useEditorSettings must be used within FontProvider');
  }
  return ctx;
}
