'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import { useEditorSettings } from '@/components/providers/font-provider';
import type { ComponentPropsWithoutRef } from 'react';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

const FONT_STACKS: Record<string, string> = {
  inter: 'var(--font-inter), system-ui, sans-serif',
  'plus-jakarta-sans':
    'var(--font-plus-jakarta-sans), system-ui, sans-serif',
  'fira-code': 'var(--font-fira-code), ui-monospace, monospace',
  'jetbrains-mono': 'var(--font-jetbrains-mono), ui-monospace, monospace',
};

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const { settings } = useEditorSettings();
  const editorFamily =
    FONT_STACKS[settings.fontFamily] ?? FONT_STACKS.inter;

  return (
    <div
      className={cn('markdown-preview h-full overflow-y-auto', className)}
      suppressHydrationWarning
      style={
        {
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          '--editor-font-family': `var(--font-source-serif), Georgia, serif`,
        } as React.CSSProperties
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: (props) => (
            <a
              {...(props as ComponentPropsWithoutRef<'a'>)}
              target={props.href?.startsWith('http') ? '_blank' : undefined}
              rel={props.href?.startsWith('http') ? 'noreferrer' : undefined}
            />
          ),
        }}
      >
        {content || '*Yazmaya başla…*'}
      </ReactMarkdown>
      {/* editorFamily intentionally not applied — preview stays editorial */}
      <span hidden aria-hidden style={{ fontFamily: editorFamily }} />
    </div>
  );
}
