'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, FolderOpen, MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EmptyState } from '@/components/empty-state';
import { RelativeTime } from '@/components/relative-time';
import { cn } from '@/lib/utils';
import { firstContentLine, wordStats } from '@/lib/editor-utils';
import type { Document } from '@/types/editor';

interface RayProps {
  documents: Document[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onCreateDocument: () => void;
  onRenameDocument: (id: string, title: string) => void;
  onDeleteDocument: (id: string) => void;
  className?: string;
}

export function Ray({
  documents,
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  onRenameDocument,
  onDeleteDocument,
  className,
}: RayProps) {
  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Cmd/Ctrl+K focuses the search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = documents.filter((doc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q)
    );
  });

  const beginRename = (doc: Document) => {
    setRenamingId(doc.id);
    setRenameValue(doc.title);
  };

  const finishRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenameDocument(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const onRenameKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finishRename();
    } else if (e.key === 'Escape') {
      setRenamingId(null);
      setRenameValue('');
    }
  };

  return (
    <aside className={cn('ray', className)} aria-label="Belgeler">
      <div className="ray__header">
        <div className="ray__search">
          <input
            ref={searchRef}
            type="search"
            size={1}
            placeholder="Belgelerde ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            spellCheck={false}
            aria-label="Belgelerde ara"
          />
          {!search && (
            <span className="ray__search-shortcut" aria-hidden>
              ⌘K
            </span>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="ray__new"
                onClick={onCreateDocument}
                aria-label="Yeni belge oluştur"
              >
                <Plus aria-hidden className="size-3.5" strokeWidth={2} />
                <span>Yeni</span>
              </button>
            }
          />
          <TooltipContent>Yeni belge (⌘N)</TooltipContent>
        </Tooltip>
      </div>

      <div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={search ? <FolderOpen className="size-4" /> : <FileText className="size-4" />}
            title={search ? 'Eşleşen belge yok' : 'Henüz boş'}
            hint={
              search
                ? 'Farklı bir arama dene ya da yeni bir belge oluştur.'
                : 'Yeni bir belge oluşturarak başla. ⌘N kısayolunu da kullanabilirsin.'
            }
            shortcut={search ? undefined : '⌘N · yeni belge'}
            action={
              <Button variant="default" size="sm" onClick={onCreateDocument}>
                <Plus className="size-3.5" strokeWidth={2} />
                Yeni belge
              </Button>
            }
            className="py-10"
          />
        ) : (
          <ul className="ray__list" role="list">
            <li className="ray__list-label">
              {search
                ? `${filtered.length} sonuç`
                : 'Tüm belgeler'}
              <span className="ml-2 text-ink-tertiary/60 normal-case tracking-normal">
                · {documents.length}
              </span>
            </li>
            {filtered.map((doc) => {
              const preview = firstContentLine(doc.content);
              const stats = wordStats(doc.content);
              const isActive = activeDocumentId === doc.id;
              return (
                <li key={doc.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    className="ray__item"
                    data-active={isActive}
                    onClick={() => onSelectDocument(doc.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectDocument(doc.id);
                      }
                    }}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {renamingId === doc.id ? (
                      <input
                        type="text"
                        className="ray__rename-input"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={onRenameKey}
                        onBlur={finishRename}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        maxLength={120}
                      />
                    ) : (
                      <div className="ray__item-title">{doc.title || 'Adsız'}</div>
                    )}
                    {preview && renamingId !== doc.id ? (
                      <div className="ray__item-preview">{preview}</div>
                    ) : null}
                    <div className="ray__item-meta">
                      <RelativeTime value={doc.updatedAt} />
                      <span className="ray__item-meta-dot" aria-hidden />
                      <span>{stats.words} sözcük</span>
                    </div>
                    <div className="ray__item-actions" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              className="tool-btn"
                              aria-label={`${doc.title} için eylemler`}
                            />
                          }
                        >
                          <MoreHorizontal aria-hidden className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[160px]">
                          <DropdownMenuItem onClick={() => beginRename(doc)}>
                            <Pencil className="size-3.5" />
                            Yeniden adlandır
                          </DropdownMenuItem>
                          {documents.length > 1 && (
                            <DropdownMenuItem
                              onClick={() => onDeleteDocument(doc.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                              Sil
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="ray__footer">
        <span>Yerel · şifrelenmemiş</span>
        <span className="font-mono">
          {documents.length} {documents.length === 1 ? 'belge' : 'belge'}
        </span>
      </div>
    </aside>
  );
}
