'use client';

import { Sun, Moon, Monitor, Eye, EyeOff, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorSettings } from '@/components/providers/font-provider';
import { useTheme } from '@/components/providers/theme-provider';
import { RelativeTime } from '@/components/relative-time';
import { cn } from '@/lib/utils';
import type { Document } from '@/types/editor';
import type { Theme } from './providers/theme-provider';

interface StatusBarProps {
  document: Document | null;
  showPreview: boolean;
  onTogglePreview: () => void;
  savingState: 'saved' | 'saving' | 'draft';
}

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Aydınlık', icon: Sun },
  { id: 'dark', label: 'Karanlık', icon: Moon },
  { id: 'system', label: 'Sistem', icon: Monitor },
];

export function StatusBar({
  document,
  showPreview,
  onTogglePreview,
  savingState,
}: StatusBarProps) {
  const { settings, setSettings } = useEditorSettings();
  const { theme, setTheme } = useTheme();

  const stats = document
    ? {
        words: document.content.trim() === '' ? 0 : document.content.trim().split(/\s+/).length,
        characters: document.content.length,
        readingMinutes: Math.max(1, Math.round(
          (document.content.trim() === '' ? 0 : document.content.trim().split(/\s+/).length) / 220,
        )),
      }
    : { words: 0, characters: 0, readingMinutes: 0 };

  const cycleTheme = () => {
    const order: Theme[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const currentTheme = THEMES.find((t) => t.id === theme) ?? THEMES[2];
  const ThemeIcon = currentTheme.icon;

  const adjustFont = (delta: number) => {
    const next = Math.min(24, Math.max(12, settings.fontSize + delta));
    setSettings({ ...settings, fontSize: next });
  };

  return (
    <footer className="status-bar" role="contentinfo" aria-label="Belge durumu">
      <div className="status-bar__left">
        <span>
          {stats.words.toLocaleString('tr-TR')} sözcük
        </span>
        <span className="status-bar__sep">·</span>
        <span>
          {stats.characters.toLocaleString('tr-TR')} karakter
        </span>
        {stats.words > 0 && (
          <>
            <span className="status-bar__sep">·</span>
            <span>{stats.readingMinutes} dk okuma</span>
          </>
        )}
      </div>

      <div className="status-bar__center" aria-live="polite">
        <span
          className="status-bar__dot"
          data-state={savingState}
          aria-hidden
        />
        <span>
          {savingState === 'saving'
            ? 'Kaydediliyor…'
            : savingState === 'draft'
              ? 'Taslak — kaydedilmedi'
              : (
                <>
                  Kaydedildi ·{' '}
                  <RelativeTime value={document?.updatedAt ?? new Date()} />
                </>
              )}
        </span>
      </div>

      <div className="status-bar__right">
        <button
          type="button"
          className="status-bar__btn"
          onClick={() => adjustFont(-1)}
          aria-label="Yazı boyutunu küçült"
          title="Yazı boyutunu küçült"
        >
          <Minus aria-hidden />
        </button>
        <span className="font-mono text-[0.6875rem] text-ink-tertiary tabular-nums">
          {settings.fontSize}px
        </span>
        <button
          type="button"
          className="status-bar__btn"
          onClick={() => adjustFont(1)}
          aria-label="Yazı boyutunu büyüt"
          title="Yazı boyutunu büyüt"
        >
          <Plus aria-hidden />
        </button>

        <span className="status-bar__sep" aria-hidden>
          |
        </span>

        <button
          type="button"
          className={cn('status-bar__btn')}
          onClick={onTogglePreview}
          aria-label={showPreview ? 'Önizlemeyi gizle' : 'Önizlemeyi göster'}
          aria-pressed={showPreview}
          title={showPreview ? 'Önizlemeyi gizle (⌘⇧P)' : 'Önizlemeyi göster (⌘⇧P)'}
        >
          {showPreview ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
          <span>{showPreview ? 'Önizleme açık' : 'Önizleme kapalı'}</span>
        </button>

        <span className="status-bar__sep" aria-hidden>
          |
        </span>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={cycleTheme}
          aria-label={`Tema: ${currentTheme.label} (döngüsel)`}
          title={`Tema: ${currentTheme.label}`}
          className="text-ink-tertiary hover:text-ink-primary"
        >
          <ThemeIcon aria-hidden />
        </Button>
      </div>
    </footer>
  );
}
