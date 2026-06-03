'use client';

import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { EditorSettings } from '@/types/editor';

const defaultSettings: EditorSettings = {
  fontSize: 16,
  lineHeight: 1.6,
  fontFamily: 'inter',
  wordWrap: true,
  spellCheck: true,
  autoSave: true,
  autoSaveInterval: 30000,
  showLineNumbers: false,
  showPreview: true,
  previewPosition: 'right',
  theme: 'system',
};

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useLocalStorage<EditorSettings>('md-editor-settings', defaultSettings);

  // Migrate old settings without fontFamily
  useEffect(() => {
    if (settings && !settings.fontFamily) {
      setSettings({ ...defaultSettings, ...settings });
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    // Get font family CSS variable
    const fontMap: Record<string, string> = {
      'inter': 'var(--font-inter), system-ui, sans-serif',
      'plus-jakarta-sans': 'var(--font-plus-jakarta-sans), system-ui, sans-serif',
      'fira-code': 'var(--font-fira-code), ui-monospace, monospace',
      'jetbrains-mono': 'var(--font-jetbrains-mono), ui-monospace, monospace',
    };
    
    const fontFamily = fontMap[settings.fontFamily] || fontMap['inter'];
    
    // Set inline style for immediate effect
    root.style.fontFamily = fontFamily;
    
    // Also set class for Tailwind
    root.classList.remove('font-inter', 'font-plus-jakarta-sans', 'font-fira-code', 'font-jetbrains-mono');
    root.classList.add(`font-${settings.fontFamily}`);
  }, [settings.fontFamily]);

  return <>{children}</>;
}
