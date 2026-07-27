'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, FileText, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { MarkdownPreview } from '@/components/editor/markdown-preview';
import { Ray } from '@/components/editor/ray';
import { SettingsPanel } from '@/components/editor/settings-panel';
import { StageToolbar } from '@/components/editor/stage-toolbar';
import { TopBar } from '@/components/editor/top-bar';
import { StatusBar } from '@/components/status-bar';
import { EmptyState } from '@/components/empty-state';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useEditorSettings } from '@/components/providers/font-provider';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcut';
import {
  createDocument,
  DEFAULT_MARKDOWN,
  safeFilename,
  transformSelection,
  type MarkdownAction,
} from '@/lib/editor-utils';
import type { Document, EditorSettings } from '@/types/editor';

const initialDocuments: Document[] = [createDocument('Hoşgeldin', DEFAULT_MARKDOWN)];
const COLLAPSED_KEY = 'md-editor-sidebar-collapsed';

export default function Home() {
  const [documents, setDocuments] = useLocalStorage<Document[]>(
    'md-editor-documents',
    initialDocuments,
  );
  const { settings, setSettings } = useEditorSettings();
  const [activeId, setActiveId] = useState<string | null>(
    () => initialDocuments[0]?.id ?? null,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>(
    COLLAPSED_KEY,
    false,
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [mobileView] = useState<'write' | 'preview'>('write');
  const [savingState, setSavingState] = useState<'saved' | 'saving' | 'draft'>(
    'saved',
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const active = documents.find((doc) => doc.id === activeId) ?? documents[0] ?? null;

  // -------------------------------------------------------------------------
  // Saving state — debounced indicator
  // -------------------------------------------------------------------------
  const lastSavedSnapshot = useRef<string>('');

  useEffect(() => {
    if (!active) return;
    const snapshot = `${active.id}|${active.title}|${active.content}`;
    if (snapshot === lastSavedSnapshot.current) return;
    setSavingState('saving');
    const timer = window.setTimeout(() => {
      lastSavedSnapshot.current = snapshot;
      setSavingState('saved');
    }, 350);
    return () => window.clearTimeout(timer);
  }, [active]);

  // -------------------------------------------------------------------------
  // Document CRUD
  // -------------------------------------------------------------------------
  const update = useCallback(
    (patch: Partial<Document>) => {
      if (!active) return;
      setDocuments((docs) =>
        docs.map((doc) =>
          doc.id === active.id
            ? { ...doc, ...patch, updatedAt: new Date() }
            : doc,
        ),
      );
    },
    [active, setDocuments],
  );

  const create = useCallback(() => {
    const doc = createDocument(`Adsız ${documents.length + 1}`);
    setDocuments((docs) => [...docs, doc]);
    setActiveId(doc.id);
    setMobileSidebarOpen(false);
    setTimeout(() => {
      const titleInput = document.querySelector<HTMLInputElement>(
        '.topbar__title-input',
      );
      titleInput?.focus();
      titleInput?.select();
    }, 60);
  }, [documents.length, setDocuments]);

  const remove = useCallback(
    (id: string) => {
      if (documents.length <= 1) return;
      const next = documents.filter((doc) => doc.id !== id);
      setDocuments(next);
      if (id === active?.id) {
        setActiveId(next[0]?.id ?? null);
      }
    },
    [active?.id, documents, setDocuments],
  );

  const rename = useCallback(
    (id: string, title: string) => {
      setDocuments((docs) =>
        docs.map((doc) => (doc.id === id ? { ...doc, title } : doc)),
      );
    },
    [setDocuments],
  );

  // -------------------------------------------------------------------------
  // Toolbar / selection actions
  // -------------------------------------------------------------------------
  const runAction = useCallback(
    (action: MarkdownAction) => {
      const area =
        textareaRef.current ??
        document.querySelector<HTMLTextAreaElement>('.markdown-textarea');
      if (!active || !area) return;
      const result = transformSelection(
        active.content,
        area.selectionStart,
        area.selectionEnd,
        action,
      );
      update({ content: result.content });
      requestAnimationFrame(() => {
        area.focus();
        area.setSelectionRange(result.selectionStart, result.selectionEnd);
      });
    },
    [active, update],
  );

  // -------------------------------------------------------------------------
  // File import / export
  // -------------------------------------------------------------------------
  const exportFile = useCallback(() => {
    if (!active) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([active.content], { type: 'text/markdown' }),
    );
    a.download = safeFilename(active.title);
    a.click();
    URL.revokeObjectURL(a.href);
  }, [active]);

  const importFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,text/markdown,text/plain';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const doc = createDocument(
        file.name.replace(/\.md$/i, ''),
        await file.text(),
      );
      setDocuments((d) => [...d, doc]);
      setActiveId(doc.id);
    };
    input.click();
  }, [setDocuments]);

  // -------------------------------------------------------------------------
  // Global keyboard shortcuts
  // -------------------------------------------------------------------------
  useKeyboardShortcuts(
    {
      'mod+b': () => runAction('bold'),
      'mod+i': () => runAction('italic'),
      'mod+k': () => runAction('link'),
      'mod+shift+f': () => setFocusMode((f) => !f),
      'mod+\\': () => setSidebarCollapsed((c) => !c),
      'mod+,': () => setSettingsOpen((s) => !s),
      'mod+shift+p': () => {
        setSettings((s: EditorSettings) => {
          const next = { ...s, showPreview: !s.showPreview };
          // persist via context effect
          return next;
        });
      },
      'mod+n': () => create(),
    },
    { ignoreInEditable: false },
  );

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------
  const showPreview = settings.showPreview;
  const splitMode = showPreview
    ? settings.previewPosition === 'bottom'
      ? 'bottom'
      : 'right'
    : 'off';

  return (
    <main className="app-shell">
      <TopBar
        activeDocument={active}
        sidebarOpen={!sidebarCollapsed}
        onToggleSidebar={() => {
          // Desktop: collapse persistent ray. Mobile: open drawer.
          if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
            setMobileSidebarOpen((o) => !o);
          } else {
            setSidebarCollapsed((c) => !c);
          }
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onImport={importFile}
        onExport={exportFile}
        onTitleChange={(title) => update({ title })}
      />

      <div className="workspace" data-preview={splitMode}>
        {!sidebarCollapsed && (
          <Ray
            documents={documents}
            activeDocumentId={active?.id ?? null}
            onSelectDocument={(id) => setActiveId(id)}
            onCreateDocument={create}
            onRenameDocument={rename}
            onDeleteDocument={remove}
            className="ray-desktop"
          />
        )}

        <section className="stage">
          {active ? (
            <>
              <div className="panes" data-split={splitMode}>
                <div className="pane">
                  <div className="pane-label">
                    <PenLine aria-hidden className="size-3" />
                    yaz
                  </div>
                  <div
                    className={`h-full ${mobileView === 'preview' ? 'mobile-hidden md:block' : ''}`}
                  >
                    <MarkdownEditor
                      ref={textareaRef}
                      content={active.content}
                      onChange={(content) => update({ content })}
                      focusMode={focusMode}
                    />
                  </div>
                </div>
                {showPreview && (
                  <div className="pane">
                    <div className="pane-label">öni</div>
                    <div
                      className={`h-full ${mobileView === 'write' ? 'mobile-hidden md:block' : ''}`}
                    >
                      <MarkdownPreview content={active.content} />
                    </div>
                  </div>
                )}
              </div>
              <StageToolbar
                onAction={runAction}
                focusMode={focusMode}
                onToggleFocusMode={() => setFocusMode((f) => !f)}
              />
            </>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex-1">
                <EmptyState
                  icon={<FileText className="size-5" />}
                  title="Henüz bir belgen yok"
                  hint="Yeni bir belge oluştur ve yazmaya başla. Belge başlığı üst çubukta her zaman düzenlenebilir kalır."
                  shortcut="⌘N · yeni belge"
                  action={
                    <Button onClick={create} size="sm">
                      <Plus className="size-3.5" strokeWidth={2} />
                      Yeni belge
                    </Button>
                  }
                />
              </div>
              <StageToolbar
                onAction={runAction}
                focusMode={focusMode}
                onToggleFocusMode={() => setFocusMode((f) => !f)}
              />
            </div>
          )}
        </section>
      </div>

      {/* Mobile drawer — outside the workspace grid to avoid layout shift */}
      {mobileSidebarOpen && (
        <div className="mobile-drawer md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Rayı kapat"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative h-full">
            <Ray
              documents={documents}
              activeDocumentId={active?.id ?? null}
              onSelectDocument={(id) => {
                setActiveId(id);
                setMobileSidebarOpen(false);
              }}
              onCreateDocument={create}
              onRenameDocument={rename}
              onDeleteDocument={remove}
            />
          </div>
        </div>
      )}

      {/* Settings — right-side slide-in drawer with backdrop */}
      <button
        type="button"
        className="settings-backdrop"
        data-open={settingsOpen}
        aria-label="Ayarları kapat"
        onClick={() => setSettingsOpen(false)}
        tabIndex={settingsOpen ? 0 : -1}
      />
      <aside
        className="settings-drawer"
        data-open={settingsOpen}
        aria-label="Ayarlar"
        aria-hidden={!settingsOpen}
      >
        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onPreviewToggle={() => {
            /* settings persists */
          }}
        />
      </aside>

      <StatusBar
        document={active}
        showPreview={showPreview}
        onTogglePreview={() => {
          setSettings({ ...settings, showPreview: !showPreview });
        }}
        savingState={savingState}
      />
    </main>
  );
}
