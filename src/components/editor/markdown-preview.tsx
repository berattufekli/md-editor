'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { EditorSettings } from '@/types/editor';

interface MarkdownPreviewProps {
  content: string;
  settings: EditorSettings;
  className?: string;
}

export function MarkdownPreview({
  content,
  settings,
  className,
}: MarkdownPreviewProps) {
  return (
    <ScrollArea className={cn('h-full w-full', className)}>
      <div
        className="prose prose-sm dark:prose-invert max-w-none p-4"
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  );
}
