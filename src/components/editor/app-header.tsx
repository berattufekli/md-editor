'use client';

import { Button } from '@/components/ui/button';
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
import { wordStats } from '@/lib/editor-utils';
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

      <div className="ml-auto flex items-center gap-1">
        {activeDocument ? (
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
        ) : null}
      </div>

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
    </header>
  );
}
