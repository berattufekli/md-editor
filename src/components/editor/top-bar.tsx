'use client';

import {
  PanelLeftClose,
  PanelLeftOpen,
  Upload,
  Download,
  Settings as SettingsIcon,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { BrandMark } from '@/components/brand-mark';
import type { Document } from '@/types/editor';

interface TopBarProps {
  activeDocument: Document | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onImport: () => void;
  onExport: () => void;
  onTitleChange: (title: string) => void;
}

export function TopBar({
  activeDocument,
  sidebarOpen,
  onToggleSidebar,
  onOpenSettings,
  onImport,
  onExport,
  onTitleChange,
}: TopBarProps) {
  return (
    <header className="topbar" role="banner">
      <div className="flex items-center gap-2 min-w-0">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={sidebarOpen ? 'Rayı gizle' : 'Rayı göster'}
                aria-expanded={sidebarOpen}
                onClick={onToggleSidebar}
                className="text-ink-secondary"
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
            <span className="font-mono text-[0.625rem] text-ink-tertiary ml-2">⌘\\</span>
          </TooltipContent>
        </Tooltip>

        <button
          type="button"
          className="topbar__brand group"
          onClick={onToggleSidebar}
          aria-label="MD Editor — rayı aç/kapat"
        >
          <BrandMark size={22} className="text-ink-primary" />
          <span className="font-display text-sm font-semibold tracking-tight text-ink-primary hidden sm:inline">
            MD<span className="text-ink-tertiary">·</span>Editor
          </span>
        </button>
      </div>

      <div className="topbar__title min-w-0">
        {activeDocument ? (
          <>
            <FileText
              aria-hidden
              className="size-3.5 text-ink-tertiary flex-shrink-0"
              strokeWidth={1.75}
            />
            <input
              type="text"
              className="topbar__title-input"
              value={activeDocument.title}
              onChange={(e) => onTitleChange(e.target.value)}
              aria-label="Belge başlığı"
              spellCheck={false}
              maxLength={120}
            />
          </>
        ) : (
          <span className="font-mono text-xs text-ink-tertiary">
            bir belge seç
          </span>
        )}
      </div>

      <div className="topbar__actions">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Markdown dosyasını içe aktar"
                onClick={onImport}
                disabled={!activeDocument}
                className="text-ink-secondary"
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
                aria-label="Markdown dosyasını dışa aktar"
                onClick={onExport}
                disabled={!activeDocument}
                className="text-ink-secondary"
              />
            }
          >
            <Download aria-hidden className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Dışa aktar (.md)</TooltipContent>
        </Tooltip>

        <span
          className="mx-1 h-5 w-px bg-rule"
          aria-hidden
        />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Ayarları aç"
                onClick={onOpenSettings}
                className="text-ink-secondary"
              />
            }
          >
            <SettingsIcon aria-hidden className="size-4" />
          </TooltipTrigger>
          <TooltipContent>
            Ayarlar
            <span className="font-mono text-[0.625rem] text-ink-tertiary ml-2">⌘,</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
