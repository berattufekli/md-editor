'use client';

import { X, Sun, Moon, Monitor, Eye, Save, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme, type Theme } from '@/components/providers/theme-provider';
import { useEditorSettings } from '@/components/providers/font-provider';
import type { EditorSettings } from '@/types/editor';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onPreviewToggle: () => void;
}

const FONT_OPTIONS: {
  id: EditorSettings['fontFamily'];
  name: string;
  sample: string;
  className: string;
}[] = [
  {
    id: 'inter',
    name: 'Inter',
    sample: 'Aa 0123',
    className: 'font-sans',
  },
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta',
    sample: 'Aa 0123',
    className: 'font-plus-jakarta-sans',
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    sample: 'fn() => {}',
    className: 'font-fira-code',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains',
    sample: 'const x = 1;',
    className: 'font-jetbrains-mono',
  },
];

const PREVIEW_POSITIONS: { id: 'right' | 'bottom'; label: string; icon: typeof Eye }[] = [
  { id: 'right', label: 'Sağ', icon: Eye },
  { id: 'bottom', label: 'Alt', icon: Eye },
];

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (next: number) => void;
}) {
  return (
    <div className="slider-row">
      <div className="slider-row__head">
        <span className="slider-row__label">{label}</span>
        <span className="slider-row__value tabular-nums">
          {value}
          {unit ?? ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full appearance-none bg-transparent
          [&::-webkit-slider-runnable-track]:h-px
          [&::-webkit-slider-runnable-track]:bg-rule
          [&::-webkit-slider-runnable-track]:rounded-full
          [&::-moz-range-track]:h-px
          [&::-moz-range-track]:bg-rule
          [&::-moz-range-track]:rounded-full
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-ink-primary
          [&::-webkit-slider-thumb]:-mt-[5px]
          [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_var(--surface-3)]
          [&::-moz-range-thumb]:w-3
          [&::-moz-range-thumb]:h-3
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-ink-primary
          [&::-moz-range-thumb]:border-0
          focus-visible:outline-2
          focus-visible:outline-ring
          focus-visible:outline-offset-2"
      />
    </div>
  );
}

function Switch({
  checked,
  onCheckedChange,
  label,
  hint,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="toggle-row">
      <div className="toggle-row__text">
        <span className="toggle-row__label">{label}</span>
        {hint ? <span className="toggle-row__hint">{hint}</span> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className="switch"
        data-checked={checked}
        onClick={() => onCheckedChange(!checked)}
      />
    </div>
  );
}

export function SettingsPanel({
  open,
  onClose,
  onPreviewToggle,
}: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const { settings, setSettings } = useEditorSettings();

  if (!open) return null;

  const update = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K],
  ) => {
    setSettings({ ...settings, [key]: value });
  };

  const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Aydınlık', icon: Sun },
    { id: 'dark', label: 'Karanlık', icon: Moon },
    { id: 'system', label: 'Sistem', icon: Monitor },
  ];

  return (
    <div className="settings-drawer__inner">
      <div className="settings-drawer__header">
        <div>
          <div className="settings-drawer__title">Ayarlar</div>
          <div className="text-xs text-ink-tertiary mt-0.5">
            Yazma yüzeyini kendine göre biçimlendir
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Ayarları kapat"
          className="text-ink-secondary"
        >
          <X aria-hidden className="size-4" />
        </Button>
      </div>

      <div className="settings-drawer__body">
        <section className="settings-section">
          <div className="settings-section__label">Tema</div>
          <div className="theme-pills">
            {THEMES.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  className="theme-pill"
                  data-active={theme === option.id}
                  onClick={() => setTheme(option.id)}
                >
                  <Icon aria-hidden />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section__label">
            <Type aria-hidden className="size-3" />
            Yazı tipi
          </div>
          <div className="font-row">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.id}
                type="button"
                className={cn('font-card', font.className)}
                data-active={settings.fontFamily === font.id}
                onClick={() => update('fontFamily', font.id)}
              >
                <span className="font-card__name">{font.name}</span>
                <span className="font-card__sample">{font.sample}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section__label">Yazı boyutu</div>
          <Slider
            label="Boyut"
            value={settings.fontSize}
            min={12}
            max={24}
            step={1}
            unit="px"
            onChange={(v) => update('fontSize', v)}
          />
          <Slider
            label="Satır yüksekliği"
            value={settings.lineHeight}
            min={1.2}
            max={2.4}
            step={0.1}
            onChange={(v) => update('lineHeight', Math.round(v * 10) / 10)}
          />
        </section>

        <section className="settings-section">
          <div className="settings-section__label">Düzenleyici</div>
          <Switch
            checked={settings.wordWrap}
            onCheckedChange={(v) => update('wordWrap', v)}
            label="Sözcük kaydırma"
            hint="Uzun satırları sar"
          />
          <Switch
            checked={settings.spellCheck}
            onCheckedChange={(v) => update('spellCheck', v)}
            label="Yazım denetimi"
            hint="Tarayıcı yerleşik"
          />
          <Switch
            checked={settings.showLineNumbers}
            onCheckedChange={(v) => update('showLineNumbers', v)}
            label="Satır numaraları"
            hint="Sol kenarda"
          />
        </section>

        <section className="settings-section">
          <div className="settings-section__label">
            <Save aria-hidden className="size-3" />
            Kayıt
          </div>
          <Switch
            checked={settings.autoSave}
            onCheckedChange={(v) => update('autoSave', v)}
            label="Otomatik kaydet"
            hint="Yerel depolamaya"
          />
          {settings.autoSave && (
            <div className="mt-2 pl-3 border-l border-rule">
              <Slider
                label="Aralık"
                value={settings.autoSaveInterval / 1000}
                min={5}
                max={60}
                step={5}
                unit=" sn"
                onChange={(v) =>
                  update('autoSaveInterval', Math.round(v) * 1000)
                }
              />
            </div>
          )}
        </section>

        <section className="settings-section">
          <div className="settings-section__label">
            <Eye aria-hidden className="size-3" />
            Önizleme
          </div>
          <Switch
            checked={settings.showPreview}
            onCheckedChange={(v) => {
              update('showPreview', v);
              onPreviewToggle();
            }}
            label="Önizlemeyi göster"
            hint="Yazarken canlı render"
          />
          {settings.showPreview && (
            <div className="mt-3">
              <div className="text-xs text-ink-tertiary mb-2">Konum</div>
              <div className="preview-pills">
                {PREVIEW_POSITIONS.map((pos) => {
                  const Icon = pos.icon;
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      className="preview-pill"
                      data-active={settings.previewPosition === pos.id}
                      onClick={() => update('previewPosition', pos.id)}
                    >
                      <Icon aria-hidden className="size-3" />
                      <span>{pos.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="settings-section">
          <div className="settings-section__label">Hakkında</div>
          <p className="text-xs leading-relaxed text-ink-secondary">
            MD Editor — tarayıcıda yerel, reklamsız, klavye öncelikli bir markdown
            çalışma alanı. Belgelerin cihazdan ayrılmaz; sadece sen dışa aktarırsan
            çıkar.
          </p>
        </section>
      </div>
    </div>
  );
}
