import type { Document, EditorSettings } from '@/types/editor';

export type MarkdownAction =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code'
  | 'codeBlock'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'task'
  | 'hr'
  | 'table'
  | 'link'
  | 'image';

export const DEFAULT_DOCUMENT_TITLE = 'Welcome';

export const DEFAULT_MARKDOWN = `# ${DEFAULT_DOCUMENT_TITLE}

Merhaba — buraya dilediğin gibi markdown yazabilirsin.

- Yaz **kalın**, _eğik_, ~~üstü çizili~~ metin yaz.
- Yapılacak listeler ve tablolar \`remark-gfm\` sayesinde çalışır.
- Soldaki raydan yeni belgeler oluştur, sağ üstten içe/dışa aktar.

> İpucu: \`Ctrl+B\`, \`Ctrl+I\`, \`Ctrl+K\` kısayollarını dene.
`;

export function splitSearchTerms(query: string): string[] {
  return query
    .trim()
    .toLocaleLowerCase('tr-TR')
    .split(/\s+/)
    .filter(Boolean);
}

export function filterDocuments(documents: Document[], query: string): Document[] {
  const terms = splitSearchTerms(query);
  if (terms.length === 0) return documents;
  return documents.filter((doc) => {
    const haystack = `${doc.title}\n${doc.content}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function formatRelativeDate(value: Date | string | number): string {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (Number.isNaN(diffMs)) return '';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return date.toLocaleDateString('tr-TR');
}

export function safeFilename(value: string): string {
  const ascii = value
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\-_. ]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  const result = ascii || 'untitled';
  return result.endsWith('.md') ? result : `${result}.md`;
}

export interface WordStats {
  words: number;
  characters: number;
  lines: number;
  readingMinutes: number;
}

export function wordStats(content: string): WordStats {
  const trimmed = content ?? '';
  const words =
    trimmed.trim() === '' ? 0 : trimmed.trim().split(/\s+/).length;
  return {
    words,
    characters: trimmed.length,
    lines: trimmed === '' ? 0 : trimmed.split('\n').length,
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}

/**
 * Returns first non-empty line of a markdown document, used for sidebar
 * preview. Strips simple heading/list markers and surrounding quotes.
 */
export function firstContentLine(content: string, maxLen = 80): string {
  if (!content) return '';
  const lines = content.split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) continue; // skip titles
    if (line.startsWith('---') || line.startsWith('```')) continue;
    const stripped = line
      .replace(/^[-*+>]\s+/, '')
      .replace(/^\d+\.\s+/, '')
      .replace(/^>\s+/, '')
      .replace(/`/g, '')
      .trim();
    if (stripped.length === 0) continue;
    return stripped.length > maxLen
      ? `${stripped.slice(0, maxLen - 1).trim()}…`
      : stripped;
  }
  return '';
}

export function formatSavedAgo(value: Date | string | number): string {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (Number.isNaN(diffMs)) return '';
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 5) return 'şu an';
  if (seconds < 60) return `${seconds} sn önce`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

export function createDocument(title: string, content: string = ''): Document {
  const now = new Date();
  return {
    id: createId(),
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };
}

export function hydrateDocuments(value: unknown): Document[] {
  if (!Array.isArray(value)) return [];
  return (value as Array<Partial<Document>>).map((raw) => {
    const created = new Date(raw.createdAt ?? Date.now());
    const updated = new Date(raw.updatedAt ?? created);
    return {
      id: typeof raw.id === 'string' ? raw.id : createId(),
      title: typeof raw.title === 'string' ? raw.title : DEFAULT_DOCUMENT_TITLE,
      content: typeof raw.content === 'string' ? raw.content : '',
      createdAt: created,
      updatedAt: updated,
    };
  });
}

export function hydrateSettings(value: unknown): EditorSettings {
  const defaults: EditorSettings = {
    fontSize: 16,
    lineHeight: 1.7,
    fontFamily: 'inter',
    wordWrap: true,
    spellCheck: true,
    autoSave: true,
    autoSaveInterval: 30000,
    showLineNumbers: false,
    showPreview: true,
    previewPosition: 'right',
    theme: 'system',
    mobileView: 'write',
  };
  if (typeof value !== 'object' || value === null) return defaults;
  return { ...defaults, ...(value as Partial<EditorSettings>) };
}

export interface SelectionTransform {
  content: string;
  selectionStart: number;
  selectionEnd: number;
}

function wrapSelection(
  content: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string,
): SelectionTransform {
  const beforeText = content.slice(0, start);
  const selected = content.slice(start, end);
  const afterText = content.slice(end);
  const inner = selected.length > 0 ? selected : placeholder;
  const next = `${beforeText}${before}${inner}${after}${afterText}`;
  const cursorStart = beforeText.length + before.length;
  return {
    content: next,
    selectionStart: cursorStart,
    selectionEnd: cursorStart + inner.length,
  };
}

export function transformSelection(
  content: string,
  start: number,
  end: number,
  action: MarkdownAction,
): SelectionTransform {
  switch (action) {
    case 'bold':
      return wrapSelection(content, start, end, '**', '**', 'kalın metin');
    case 'italic':
      return wrapSelection(content, start, end, '_', '_', 'eğik metin');
    case 'strikethrough':
      return wrapSelection(content, start, end, '~~', '~~', 'üstü çizili');
    case 'code':
      return wrapSelection(content, start, end, '`', '`', 'kod');
    case 'codeBlock':
      return wrapSelection(content, start, end, '\n```\n', '\n```\n', 'kod bloğu');
    case 'heading1':
      return wrapSelection(content, start, end, '\n# ', '\n', 'Başlık 1');
    case 'heading2':
      return wrapSelection(content, start, end, '\n## ', '\n', 'Başlık 2');
    case 'heading3':
      return wrapSelection(content, start, end, '\n### ', '\n', 'Başlık 3');
    case 'quote':
      return wrapSelection(content, start, end, '\n> ', '\n', 'alıntı');
    case 'ul':
      return wrapSelection(content, start, end, '\n- ', '\n', 'madde');
    case 'ol':
      return wrapSelection(content, start, end, '\n1. ', '\n', 'madde');
    case 'task':
      return wrapSelection(content, start, end, '\n- [ ] ', '\n', 'görev');
    case 'hr':
      return wrapSelection(content, start, end, '\n---\n', '\n', '');
    case 'table':
      return wrapSelection(
        content,
        start,
        end,
        '\n| Sütun 1 | Sütun 2 |\n| --- | --- |\n| Hücre | Hücre |\n',
        '',
        '',
      );
    case 'link':
      return wrapSelection(
        content,
        start,
        end,
        '[',
        '](https://)',
        'bağlantı metni',
      );
    case 'image':
      return wrapSelection(
        content,
        start,
        end,
        '![',
        '](https://)',
        'görsel alt metni',
      );
    default:
      return { content, selectionStart: start, selectionEnd: end };
  }
}
