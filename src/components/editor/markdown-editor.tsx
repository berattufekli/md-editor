'use client';

import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useEditorSettings } from '@/components/providers/font-provider';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange?: (start: number, end: number) => void;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
  focusMode?: boolean;
}

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  function MarkdownEditor(
    {
      content,
      onChange,
      onSelectionChange,
      className,
      placeholder = 'Burada başla…  ⌘B kalın yapar, ⌘K bağlantı ekler.',
      ariaLabel = 'Markdown düzenleyici',
      focusMode = false,
    },
    ref,
  ) {
    const { settings } = useEditorSettings();
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const setRef = (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
    };

    // Notify parent of selection changes
    useEffect(() => {
      const node = internalRef.current;
      if (!node || !onSelectionChange) return;
      const handler = () => onSelectionChange(node.selectionStart, node.selectionEnd);
      node.addEventListener('select', handler);
      node.addEventListener('keyup', handler);
      node.addEventListener('click', handler);
      return () => {
        node.removeEventListener('select', handler);
        node.removeEventListener('keyup', handler);
        node.removeEventListener('click', handler);
      };
    }, [onSelectionChange]);

    const lineCount = useMemo(() => {
      if (!content) return 1;
      return content.split('\n').length;
    }, [content]);

    // Build the line-number gutter (1..N)
    const gutter = useMemo(() => {
      if (!settings.showLineNumbers) return '';
      return Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
    }, [lineCount, settings.showLineNumbers]);

    return (
      <div
        className={cn(
          'markdown-textarea-wrap h-full w-full overflow-hidden',
          className,
        )}
        data-line-numbers={settings.showLineNumbers}
        data-line-count={gutter}
        data-focus-mode={focusMode}
      >
        <textarea
          ref={setRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          spellCheck={settings.spellCheck}
          suppressHydrationWarning
          className={cn(
            'markdown-textarea block',
            settings.showLineNumbers && 'pl-16',
          )}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            wordWrap: settings.wordWrap ? 'break-word' : 'normal',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
          }}
        />
      </div>
    );
  },
);
