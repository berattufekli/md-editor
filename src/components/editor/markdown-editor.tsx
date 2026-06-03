'use client';

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { EditorSettings } from '@/types/editor';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  placeholder?: string;
}

export function MarkdownEditor({
  content,
  onChange,
  className,
  placeholder = 'Start writing your markdown here...',
}: MarkdownEditorProps) {
  const [settings] = useLocalStorage<EditorSettings>('md-editor-settings', {
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

  return (
    <Textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={settings.spellCheck}
      className={cn(
        'markdown-textarea min-h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-base outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
        settings.showLineNumbers && 'pl-12',
        className
      )}
      style={{
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
        wordWrap: settings.wordWrap ? 'break-word' : undefined,
        whiteSpace: 'pre-wrap',
      }}
    />
  );
}
