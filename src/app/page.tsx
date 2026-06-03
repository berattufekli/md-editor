'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { MarkdownToolbar } from '@/components/editor/markdown-toolbar';
import { MarkdownPreview } from '@/components/editor/markdown-preview';
import { EditorSidebar } from '@/components/editor/editor-sidebar';
import { SettingsDrawer } from '@/components/editor/settings-drawer';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTheme } from '@/components/providers/theme-provider';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  Upload,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document, EditorSettings } from '@/types/editor';

const DEFAULT_CONTENT = `# Welcome to MD Editor

Start writing your markdown here!

## Features

- **Bold** and *italic* text
- Code blocks with syntax highlighting
- Tables, lists, and task lists
- And much more!

## Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## Task List

- [x] Create markdown editor
- [x] Add toolbar
- [ ] Add export functionality
- [ ] Add cloud sync

---

Happy writing! 🚀
`;

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export default function Home() {
  const [documents, setDocuments] = useLocalStorage<Document[]>('md-editor-documents', []);
  const [settings, setSettings] = useLocalStorage<EditorSettings>('md-editor-settings', {
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
  });

  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme } = useTheme();

  // Initialize with default document if empty
  useEffect(() => {
    if (documents.length === 0) {
      const defaultDoc: Document = {
        id: generateId(),
        title: 'Untitled Document',
        content: DEFAULT_CONTENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDocuments([defaultDoc]);
      setTimeout(() => setActiveDocumentId(defaultDoc.id), 0);
    } else if (!activeDocumentId && documents.length > 0) {
      setTimeout(() => setActiveDocumentId(documents[0].id), 0);
    }
    setTimeout(() => setIsLoading(false), 0);
  }, [documents, activeDocumentId, setDocuments]);

  // Auto-save functionality
  useEffect(() => {
    if (!settings.autoSave || !activeDocumentId) return;

    const interval = setInterval(() => {
      const doc = documents.find((d) => d.id === activeDocumentId);
      if (doc) {
        // Document is already saved via onChange
      }
    }, settings.autoSaveInterval);

    return () => clearInterval(interval);
  }, [settings.autoSave, settings.autoSaveInterval, activeDocumentId, documents]);

  const activeDocument = documents.find((doc) => doc.id === activeDocumentId);

  const updateDocument = useCallback(
    (content: string) => {
      if (!activeDocumentId) return;
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === activeDocumentId
            ? { ...doc, content, updatedAt: new Date() }
            : doc
        )
      );
    },
    [activeDocumentId, setDocuments]
  );

  const createDocument = useCallback(() => {
    const newDoc: Document = {
      id: generateId(),
      title: `Untitled Document ${documents.length + 1}`,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocumentId(newDoc.id);
  }, [documents.length, setDocuments]);

  const renameDocument = useCallback(
    (id: string, title: string) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, title, updatedAt: new Date() } : doc
        )
      );
    },
    [setDocuments]
  );

  const deleteDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => {
        const filtered = prev.filter((doc) => doc.id !== id);
        // If we deleted the active document, switch to another one
        if (activeDocumentId === id && filtered.length > 0) {
          setActiveDocumentId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeDocumentId, setDocuments]
  );

  const exportDocument = useCallback(
    (doc: Document) => {
      const blob = new Blob([doc.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    []
  );

  const importDocument = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Remove .md extension from filename for title
        const title = file.name.replace(/\.md$/, '');
        const newDoc: Document = {
          id: generateId(),
          title,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setDocuments((prev) => [...prev, newDoc]);
        setActiveDocumentId(newDoc.id);
      };
      reader.readAsText(file);
    },
    [setDocuments]
  );

  const handleFileImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,text/markdown';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importDocument(file);
      }
    };
    input.click();
  }, [importDocument]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center gap-2 border-b px-4">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeftOpen size={18} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <FileText size={20} className="text-primary" />
          <span className="font-semibold">MD Editor</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          {activeDocument && (
            <>
              <Tooltip>
                <TooltipTrigger >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleFileImport}
                  >
                    <Upload size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Import Markdown File</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => exportDocument(activeDocument)}
                  >
                    <Download size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export as Markdown</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        showPreview: !prev.showPreview,
                      }))
                    }
                  >
                    {settings.showPreview ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {settings.showPreview ? 'Hide Preview' : 'Show Preview'}
                </TooltipContent>
              </Tooltip>
            </>
          )}

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Tooltip>
            <TooltipTrigger >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setTheme('light')}
              >
                <Sun size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Light Mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setTheme('dark')}
              >
                <Moon size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dark Mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setTheme('system')}
              >
                <Monitor size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>System Mode</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Tooltip>
            <TooltipTrigger >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            'transition-all duration-300',
            isSidebarOpen ? 'w-64' : 'w-0'
          )}
        >
          {isSidebarOpen && (
            <EditorSidebar
              documents={documents}
              activeDocumentId={activeDocumentId}
              onSelectDocument={setActiveDocumentId}
              onCreateDocument={createDocument}
              onRenameDocument={renameDocument}
              onDeleteDocument={deleteDocument}
              className="h-full"
            />
          )}
        </div>

        {/* Editor Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {activeDocument ? (
            <>
              {/* Toolbar */}
              <ToolbarWithHandlers
                content={activeDocument.content}
                onChange={updateDocument}
                className="border-b"
              />

              {/* Editor and Preview */}
              <div
                className={cn(
                  'flex flex-1 overflow-hidden',
                  settings.showPreview && settings.previewPosition === 'split'
                    ? 'flex-row'
                    : settings.showPreview && settings.previewPosition === 'bottom'
                    ? 'flex-col'
                    : 'flex-row'
                )}
              >
                {/* Editor */}
                <div
                  className={cn(
                    'flex flex-1 flex-col overflow-hidden',
                    settings.showPreview &&
                      settings.previewPosition === 'split' &&
                      'w-1/2 border-r'
                  )}
                >
                  <MarkdownEditor
                    content={activeDocument.content}
                    onChange={updateDocument}
                    placeholder="Start writing your markdown here..."
                    className="flex-1"
                  />
                </div>

                {/* Preview */}
                {settings.showPreview && (
                  <div
                    className={cn(
                      'flex flex-1 overflow-hidden border-l',
                      settings.previewPosition === 'right' && 'border-l',
                      settings.previewPosition === 'bottom' && 'border-t',
                      settings.previewPosition === 'split' && 'w-1/2 border-l-0'
                    )}
                  >
                    <MarkdownPreview
                      content={activeDocument.content}
                      settings={settings}
                      className="flex-1 border-l"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <FileText size={64} className="text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold">No Document Selected</h2>
                <p className="text-sm text-muted-foreground">
                  Select a document from the sidebar or create a new one
                </p>
              </div>
              <Button onClick={createDocument}>
                <FileText size={16} className="mr-2" />
                Create Document
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}

// Toolbar with content-aware handlers
function ToolbarWithHandlers({
  content,
  onChange,
  className,
}: {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}) {
  const insertText = useCallback(
    (before: string, after: string = '', placeholder: string = '') => {
      const textarea = document.querySelector(
        '.markdown-textarea'
      ) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end) || placeholder;
      const newText =
        content.substring(0, start) +
        before +
        selectedText +
        after +
        content.substring(end);

      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + before.length + selectedText.length;
        textarea.setSelectionRange(start + before.length, newCursorPos);
      }, 0);
    },
    [content, onChange]
  );

  const handleBold = useCallback(() => insertText('**', '**', 'bold text'), [insertText]);
  const handleItalic = useCallback(() => insertText('*', '*', 'italic text'), [insertText]);
  const handleStrikethrough = useCallback(() => insertText('~~', '~~', 'strikethrough'), [insertText]);
  const handleCode = useCallback(() => insertText('`', '`', 'code'), [insertText]);
  const handleCodeBlock = useCallback(() => insertText('\n```\n', '\n```\n', 'code block'), [insertText]);
  const handleLink = useCallback(() => insertText('[', '](url)', 'link text'), [insertText]);
  const handleImage = useCallback(() => insertText('![', '](image-url)', 'alt text'), [insertText]);
  const handleHeading1 = useCallback(() => insertText('\n# ', '\n', 'Heading 1'), [insertText]);
  const handleHeading2 = useCallback(() => insertText('\n## ', '\n', 'Heading 2'), [insertText]);
  const handleHeading3 = useCallback(() => insertText('\n### ', '\n', 'Heading 3'), [insertText]);
  const handleQuote = useCallback(() => insertText('\n> ', '\n', 'quote'), [insertText]);
  const handleUl = useCallback(() => insertText('\n- ', '\n', 'list item'), [insertText]);
  const handleOl = useCallback(() => insertText('\n1. ', '\n', 'list item'), [insertText]);
  const handleTask = useCallback(() => insertText('\n- [ ] ', '\n', 'task'), [insertText]);
  const handleHr = useCallback(() => insertText('\n---\n', '', ''), [insertText]);
  const handleTable = useCallback(
    () => insertText('\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n', '', ''),
    [insertText]
  );

  return (
    <MarkdownToolbar
      onBold={handleBold}
      onItalic={handleItalic}
      onStrikethrough={handleStrikethrough}
      onCode={handleCode}
      onCodeBlock={handleCodeBlock}
      onLink={handleLink}
      onImage={handleImage}
      onHeading1={handleHeading1}
      onHeading2={handleHeading2}
      onHeading3={handleHeading3}
      onQuote={handleQuote}
      onUl={handleUl}
      onOl={handleOl}
      onTask={handleTask}
      onHr={handleHr}
      onTable={handleTable}
      className={className}
    />
  );
}
