'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Upload,
  Download,
  Eye,
  EyeOff,
  PenLine,
  Settings,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { useEditorSettings } from '@/components/providers/font-provider';
import { formatExactTime, wordStats } from '@/lib/editor-utils';
import { cn } from '@/lib/utils';
import type { Document } from '@/types/editor';

interface AppHeaderProps {
  activeDocument: Document | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onImport: () => void;
  onExport: (doc: Document) => void;
  onMobilePreviewToggle: () => void;
  isMobilePreview: boolean;
}

export function AppHeader({
  activeDocument,
  sidebarOpen,
  onToggleSidebar,
  onOpenSettings,
  onImport,
  onExport,
  onMobilePreviewToggle,
  isMobilePreview,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { settings } = useEditorSettings();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const stats = activeDocument
    ? wordStats(activeDocument.content)
    : { words: 0, characters: 0, lines: 0 };

  return (
    <header
      className={cn(
        'flex h-14 items-center gap-2 border-b border-border bg-background px-3 sm:px-4',
      )}
      role="banner"
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={sidebarOpen ? 'Rayı gizle' : 'Rayı göster'}
              aria-expanded={sidebarOpen}
              onClick={onToggleSidebar}
            />
          }
        >
          {sidebarOpen ? (
            <PanelLeftClose aria-hidden className="size-4" />
          ) : (
            <PanelLeftOpen aria-hidden className="size-4" />
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {sidebarOpen ? 'Rayı gizle' : 'Rayı göster'}
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden
          className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card text-foreground"
        >
          <PenLine className="size-3.5" />
        </span>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold leading-none">
            MD Editor
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {activeDocument ? 'Yerel çalışma alanı' : 'Yerel taslak'}
          </p>
        </div>
      </div>

      <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />

      {activeDocument && (
        <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
          <span className="truncate text-sm text-muted-foreground">
            {activeDocument.title}
          </span>
          {hydrated && (
            <span
              className="text-[11px] text-muted-foreground"
              aria-live="polite"
            >
              {stats.words.toLocaleString('tr-TR')} sözcük ·{' '}
              {stats.characters.toLocaleString('tr-TR')} karakter ·{' '}
              {formatExactTime(activeDocument.updatedAt)}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-1 lg:flex-none">
        {activeDocument && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Markdown dosyasını içe aktar"
                    onClick={onImport}
                  />
                }
              >
                <Upload aria-hidden className="size-4" />
              </TooltipTrigger>
              <TooltipContent>İçe aktar</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Markdown dosyası olarak dışa aktar"
                    onClick={() => onExport(activeDocument)}
                  />
                }
              >
                <Download aria-hidden className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Dışa aktar</TooltipContent>
            </Tooltip>

            {settings.showPreview ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Önizlemeyi gizle"
                      onClick={onMobilePreviewToggle}
                      className={cn(
                        isMobilePreview && 'bg-accent text-foreground',
                        'md:hidden',
                      )}
                    />
                  }
                >
                  <EyeOff aria-hidden className="size-4" />
                </TooltipTrigger>
                <TooltipContent>Önizlemeyi gizle</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Önizlemeyi göster"
                      onClick={onMobilePreviewToggle}
                      className="md:hidden"
                    />
                  }
                >
                  <Eye aria-hidden className="size-4" />
                </TooltipTrigger>
                <TooltipContent>Önizlemeyi göster</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        <Separator orientation="vertical" className="mx-1 h-5" />

        <div
          className="hidden items-center gap-0.5 sm:flex"
          role="group"
          aria-label="Tema"
        >
          <ThemeButton
            current={theme}
            target="light"
            onClick={() => setTheme('light')}
            label="Açık tema"
          >
            <Sun aria-hidden className="size-4" />
          </ThemeButton>
          <ThemeButton
            current={theme}
            target="dark"
            onClick={() => setTheme('dark')}
            label="Koyu tema"
          >
            <Moon aria-hidden className="size-4" />
          </ThemeButton>
          <ThemeButton
            current={theme}
            target="system"
            onClick={() => setTheme('system')}
            label="Sistem teması"
          >
            <Monitor aria-hidden className="size-4" />
          </ThemeButton>
        </div>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Ayarları aç"
                onClick={onOpenSettings}
              />
            }
          >
            <Settings aria-hidden className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Ayarlar</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}

function ThemeButton({
  current,
  target,
  onClick,
  label,
  children,
}: {
  current: 'light' | 'dark' | 'system';
  target: 'light' | 'dark' | 'system';
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const active = current === target;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={active}
            onClick={onClick}
            className={cn(
              active &&
                'bg-accent text-foreground ring-1 ring-foreground/10',
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
