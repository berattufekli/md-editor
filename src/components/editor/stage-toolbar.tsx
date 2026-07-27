'use client';

import { useState, type ReactNode } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Code2,
  Link,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Minus as MinusIcon,
  Table as TableIcon,
  MoreHorizontal,
  Focus,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { MarkdownAction } from '@/lib/editor-utils';

interface ActionBinding {
  id: string;
  icon: ReactNode;
  label: string;
  shortcut?: string;
  action: MarkdownAction;
}

interface Group {
  id: string;
  items: ActionBinding[];
}

const GROUPS: Group[] = [
  {
    id: 'inline',
    items: [
      { id: 'bold', icon: <Bold />, label: 'Kalın', shortcut: '⌘B', action: 'bold' },
      { id: 'italic', icon: <Italic />, label: 'Eğik', shortcut: '⌘I', action: 'italic' },
      { id: 'strike', icon: <Strikethrough />, label: 'Üstü çizili', action: 'strikethrough' },
    ],
  },
  {
    id: 'heading',
    items: [
      { id: 'h1', icon: <Heading1 />, label: 'Başlık 1', action: 'heading1' },
      { id: 'h2', icon: <Heading2 />, label: 'Başlık 2', action: 'heading2' },
      { id: 'h3', icon: <Heading3 />, label: 'Başlık 3', action: 'heading3' },
    ],
  },
  {
    id: 'list',
    items: [
      { id: 'quote', icon: <Quote />, label: 'Alıntı', action: 'quote' },
      { id: 'ul', icon: <List />, label: 'Sırasız liste', action: 'ul' },
      { id: 'ol', icon: <ListOrdered />, label: 'Sıralı liste', action: 'ol' },
      { id: 'task', icon: <CheckSquare />, label: 'Görev listesi', action: 'task' },
    ],
  },
  {
    id: 'block',
    items: [
      { id: 'code', icon: <Code />, label: 'Satır içi kod', action: 'code' },
      { id: 'codeblock', icon: <Code2 />, label: 'Kod bloğu', action: 'codeBlock' },
      { id: 'link', icon: <Link />, label: 'Bağlantı', shortcut: '⌘K', action: 'link' },
      { id: 'image', icon: <ImageIcon />, label: 'Görsel', action: 'image' },
      { id: 'table', icon: <TableIcon />, label: 'Tablo', action: 'table' },
      { id: 'hr', icon: <MinusIcon />, label: 'Yatay çizgi', action: 'hr' },
    ],
  },
];

interface StageToolbarProps {
  onAction: (action: MarkdownAction) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  className?: string;
}

function ToolButton({
  icon,
  label,
  shortcut,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="tool-btn"
            aria-label={label}
            onClick={onClick}
          />
        }
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent side="top" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut ? (
          <span className="font-mono text-[0.625rem] text-ink-tertiary">
            {shortcut}
          </span>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

export function StageToolbar({
  onAction,
  focusMode,
  onToggleFocusMode,
  className,
}: StageToolbarProps) {
  const [showAll, setShowAll] = useState(false);

  // Always-visible first three groups, the rest collapse under "more" on small screens
  const primary = GROUPS.slice(0, 3);
  const overflow = GROUPS[3]?.items ?? [];

  return (
    <div className={cn('stage-toolbar', className)} role="toolbar" aria-label="Markdown eylemleri">
      {(showAll ? GROUPS : primary).map((group, groupIdx) => (
        <div key={group.id} className="flex items-center">
          {groupIdx > 0 && <div className="stage-toolbar__divider" aria-hidden />}
          <div className="stage-toolbar__group">
            {group.items.map((item) => (
              <ToolButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                shortcut={item.shortcut}
                onClick={() => onAction(item.action)}
              />
            ))}
          </div>
        </div>
      ))}

      {!showAll && overflow.length > 0 && (
        <>
          <div className="stage-toolbar__divider" aria-hidden />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="tool-btn"
                  aria-label="Daha fazla biçimlendirme"
                />
              }
            >
              <MoreHorizontal aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="min-w-[200px]">
              {overflow.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onAction(item.action)}
                  className="flex items-center gap-2"
                >
                  <span className="text-ink-secondary">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="font-mono text-[0.625rem] text-ink-tertiary">
                      {item.shortcut}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
              <div className="my-1 h-px bg-rule" />
              <DropdownMenuItem
                onClick={() => setShowAll(true)}
                className="text-ink-tertiary text-xs"
              >
                Tümünü göster
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {showAll && overflow.length > 0 && (
        <button
          type="button"
          className="tool-btn ml-1"
          aria-label="Daha az göster"
          onClick={() => setShowAll(false)}
        >
          <span className="font-mono text-[0.625rem] font-semibold">‹</span>
        </button>
      )}

      <div className="stage-toolbar__spacer" />

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className={cn('tool-btn', focusMode && 'text-accent-brand')}
              aria-label={focusMode ? 'Odak modundan çık' : 'Odak moduna geç'}
              aria-pressed={focusMode}
              onClick={onToggleFocusMode}
            />
          }
        >
          <Focus aria-hidden />
        </TooltipTrigger>
        <TooltipContent side="top" className="flex items-center gap-2">
          <span>Odak modu</span>
          <span className="font-mono text-[0.625rem] text-ink-tertiary">⌘⇧F</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
