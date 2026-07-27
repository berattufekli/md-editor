import type { Document } from '@/types/editor';

export const DEFAULT_MARKDOWN = `# MD Editor

Modern, klavye odaklı, minimal bir markdown ortamı. Soldaki raydan bir doküman aç, sağdaki ayarlardan yazma deneyimini kendine göre biçimlendir.

## Neler yapabilirsin?

- **Kalın**, *italik* ve ~~üstü çizili~~ vurgular
- \`satır içi kod\` ve kod blokları
- [Bağlantılar](https://nextjs.org) ile notlarını zenginleştir
- Görev listeleri ile plan yönet

\`\`\`ts
export function greet(name: string) {
  return \`Merhaba, \${name}!\`;
}
\`\`\`

## Görev listesi

- [x] Tema ve tipografi ayarla
- [x] Doküman yönetimi
- [ ] Yedekleme stratejisi

| Komut | Kısayol |
| --- | --- |
| Kalın | Ctrl/⌘ + B |
| İtalik | Ctrl/⌘ + I |
| Bağlantı | Ctrl/⌘ + K |

---

Hazır olduğunda soldaki raydan yeni bir doküman oluşturabilir, sağ üstten içeriklerini \`.md\` olarak dışa aktarabilirsin.
`;

export const DEFAULT_DOCUMENT_TITLE = 'Untitled Document';

export function createDocument(
  title: string = DEFAULT_DOCUMENT_TITLE,
  content: string = '',
): Document {
  const now = new Date();
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };
}

export function hydrateDocument(value: unknown): Document | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'string') return null;
  const createdAt = new Date(
    typeof item.createdAt === 'string' || typeof item.createdAt === 'number'
      ? item.createdAt
      : Date.now(),
  );
  const updatedAt = new Date(
    typeof item.updatedAt === 'string' || typeof item.updatedAt === 'number'
      ? item.updatedAt
      : Date.now(),
  );
  const safeCreated =
    createdAt.getTime() > updatedAt.getTime() ? updatedAt : createdAt;
  return {
    id: item.id,
    title:
      typeof item.title === 'string' && item.title.trim()
        ? item.title
        : DEFAULT_DOCUMENT_TITLE,
    content: typeof item.content === 'string' ? item.content : '',
    createdAt: safeCreated,
    updatedAt,
  };
}

export function hydrateDocuments(value: unknown): Document[] {
  if (!Array.isArray(value)) return [];
  const docs: Document[] = [];
  for (const item of value) {
    const doc = hydrateDocument(item);
    if (doc) docs.push(doc);
  }
  return docs;
}

export function splitSearchTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/u)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function filterDocuments(docs: Document[], query: string): Document[] {
  const terms = splitSearchTerms(query);
  if (terms.length === 0) return docs;
  return docs.filter((doc) => {
    const haystack = `${doc.title}\n${doc.content}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function wordStats(content: string) {
  const trimmed = content.trim();
  const words = trimmed ? trimmed.split(/\s+/u).length : 0;
  const lines = content ? content.split('\n').length : 0;
  return {
    words,
    characters: Array.from(content).length,
    lines,
  };
}

export function safeFilename(title: string): string {
  const cleaned = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/gu, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${cleaned || 'untitled'}.md`;
}

export function isSafeFilename(name: string): boolean {
  if (!name || name.length > 120) return false;
  return !/(\.\.|^\.|\/$|\\)/.test(name);
}

export type MarkdownAction =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code'
  | 'link'
  | 'image'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'task'
  | 'hr'
  | 'codeBlock'
  | 'table';

export function transformSelection(
  content: string,
  start: number,
  end: number,
  action: MarkdownAction,
  options: { placeholder?: string } = {},
) {
  const safeStart = Math.max(0, Math.min(start, content.length));
  const safeEnd = Math.max(safeStart, Math.min(end, content.length));
  const selected = content.slice(safeStart, safeEnd);
  const placeholder = options.placeholder;
  const transforms: Record<
    MarkdownAction,
    { before: string; after: string; placeholder: string; block?: boolean }
  > = {
    bold: { before: '**', after: '**', placeholder: 'kalın metin' },
    italic: { before: '*', after: '*', placeholder: 'italik metin' },
    strikethrough: { before: '~~', after: '~~', placeholder: 'metin' },
    code: { before: '`', after: '`', placeholder: 'kod' },
    link: { before: '[', after: '](https://)', placeholder: 'bağlantı metni' },
    image: {
      before: '![',
      after: '](https://)',
      placeholder: 'alternatif metin',
    },
    heading1: { before: '\n# ', after: '', placeholder: 'Başlık 1', block: true },
    heading2: { before: '\n## ', after: '', placeholder: 'Başlık 2', block: true },
    heading3: { before: '\n### ', after: '', placeholder: 'Başlık 3', block: true },
    quote: { before: '\n> ', after: '', placeholder: 'alıntı', block: true },
    ul: { before: '\n- ', after: '', placeholder: 'Liste öğesi', block: true },
    ol: { before: '\n1. ', after: '', placeholder: 'Liste öğesi', block: true },
    task: { before: '\n- [ ] ', after: '', placeholder: 'görev', block: true },
    hr: { before: '\n---\n', after: '', placeholder: '' },
    codeBlock: {
      before: '\n```ts\n',
      after: '\n```\n',
      placeholder: 'kod',
      block: true,
    },
    table: {
      before: '\n| Sütun | Değer |\n| --- | --- |\n| ',
      after: ' |  |',
      placeholder: 'hücre',
      block: true,
    },
  };
  const t = transforms[action];
  const placeholderText = placeholder ?? t.placeholder;
  let inserted: string;
  if (action === 'ul' || action === 'ol' || action === 'task') {
    const prefix = action === 'ul' ? '- ' : action === 'ol' ? '1. ' : '- [ ] ';
    const lines = (selected || placeholderText).split('\n');
    inserted = `${t.before}${lines
      .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
      .join('\n')}`;
  } else {
    inserted = `${t.before}${selected || placeholderText}${t.after}`;
  }
  const newContent = content.slice(0, safeStart) + inserted + content.slice(safeEnd);
  const selectionStart = safeStart + t.before.length;
  const selectionEnd = selectionStart + (selected || placeholderText).length;
  return {
    content: newContent,
    selectionStart,
    selectionEnd,
  };
}

export function formatRelativeDate(date: Date, now: Date = new Date()): string {
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  if (seconds < 60) return `${minutes} dakika önce`;
  if (minutes < 60) return `${minutes} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days < 7) return `${days} gün önce`;
  return target.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatExactDate(date: Date): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatExactTime(date: Date): string {
  return new Date(date).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
