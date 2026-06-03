'use client';

import { X, Sun, Moon, Monitor, Type, Sliders, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import type { EditorSettings } from '@/types/editor';

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
}

const fontOptions = [
  { id: 'inter', name: 'Inter', label: 'Sans-serif', style: 'font-sans' },
  { id: 'plus-jakarta-sans', name: 'Plus Jakarta', label: 'Modern', style: 'font-sans' },
  { id: 'fira-code', name: 'Fira Code', label: 'Ligatures', style: 'font-mono' },
  { id: 'jetbrains-mono', name: 'JetBrains', label: 'Mono', style: 'font-mono' },
] as const;

const themeOptions = [
  { id: 'light', name: 'Light', icon: Sun },
  { id: 'dark', name: 'Dark', icon: Moon },
  { id: 'system', name: 'System', icon: Monitor },
] as const;

export function SettingsDrawer({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: SettingsDrawerProps) {
  const { theme, setTheme } = useTheme();

  const updateSetting = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background border-l shadow-2xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sliders className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Settings</h2>
              <p className="text-sm text-muted-foreground">Customize your editor</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-73px)] overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Theme Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Theme</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border p-4 transition-all',
                        theme === option.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{option.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Font Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Type className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Font Family</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {fontOptions.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => updateSetting('fontFamily', font.id)}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-all',
                      font.style,
                      settings.fontFamily === font.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    )}
                  >
                    <span className="text-base font-medium">{font.name}</span>
                    <span className="text-xs text-muted-foreground">{font.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Font Size & Line Height */}
            <section className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="font-size" className="text-sm">Font Size</Label>
                  <span className="text-sm font-medium text-primary">
                    {settings.fontSize}px
                  </span>
                </div>
                <Slider
                  id="font-size"
                  min={12}
                  max={24}
                  step={1}
                  value={settings.fontSize}
                  onValueChange={(value) => updateSetting('fontSize', value as number)}
                  className="py-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="line-height" className="text-sm">Line Height</Label>
                  <span className="text-sm font-medium text-primary">
                    {settings.lineHeight}
                  </span>
                </div>
                <Slider
                  id="line-height"
                  min={1.2}
                  max={2.4}
                  step={0.1}
                  value={settings.lineHeight}
                  onValueChange={(value) => updateSetting('lineHeight', value as number)}
                  className="py-1"
                />
              </div>
            </section>

            {/* Editor Options */}
            <section>
              <h3 className="text-sm font-medium mb-4">Editor Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Word Wrap</Label>
                    <p className="text-xs text-muted-foreground">Wrap long lines</p>
                  </div>
                  <Switch
                    checked={settings.wordWrap}
                    onCheckedChange={(checked) => updateSetting('wordWrap', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Spell Check</Label>
                    <p className="text-xs text-muted-foreground">Browser spell check</p>
                  </div>
                  <Switch
                    checked={settings.spellCheck}
                    onCheckedChange={(checked) => updateSetting('spellCheck', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Line Numbers</Label>
                    <p className="text-xs text-muted-foreground">Show line numbers</p>
                  </div>
                  <Switch
                    checked={settings.showLineNumbers}
                    onCheckedChange={(checked) => updateSetting('showLineNumbers', checked)}
                  />
                </div>
              </div>
            </section>

            {/* Auto Save */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Save className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Auto Save</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Enable Auto Save</Label>
                    <p className="text-xs text-muted-foreground">Save changes automatically</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </div>

                {settings.autoSave && (
                  <div className="pl-4 border-l-2 border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm">Save Interval</Label>
                      <span className="text-sm font-medium text-primary">
                        {settings.autoSaveInterval / 1000}s
                      </span>
                    </div>
                    <Slider
                      min={5000}
                      max={60000}
                      step={5000}
                      value={settings.autoSaveInterval}
                      onValueChange={(value) => updateSetting('autoSaveInterval', value as number)}
                      className="py-1"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Preview */}
            <section>
              <h3 className="text-sm font-medium mb-4">Preview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Show Preview</Label>
                    <p className="text-xs text-muted-foreground">Display rendered preview</p>
                  </div>
                  <Switch
                    checked={settings.showPreview}
                    onCheckedChange={(checked) => updateSetting('showPreview', checked)}
                  />
                </div>

                {settings.showPreview && (
                  <div>
                    <Label className="text-sm mb-3 block">Preview Position</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['right', 'bottom', 'split'] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => updateSetting('previewPosition', pos)}
                          className={cn(
                            'rounded-lg border p-3 text-xs font-medium capitalize transition-all',
                            settings.previewPosition === pos
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
