import { describe, expect, it } from 'vitest';
import {
  createDocument,
  hydrateDocuments,
  safeFilename,
  transformSelection,
  wordStats,
  DEFAULT_MARKDOWN,
  filterDocuments,
  formatRelativeDate,
  splitSearchTerms,
} from './editor-utils';
import type { Document } from '@/types/editor';

const baseDoc = (over: Partial<Document> = {}): Document => ({
  id: 'doc-1',
  title: 'Başlık',
  content: 'İçerik',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-02T10:00:00Z'),
  ...over,
});

describe('safeFilename', () => {
  it('Türkçe ve boşluk içeren başlıkları güvenli dosya adına çevirir', () => {
    expect(safeFilename('Yeni Not Defteri')).toBe('Yeni-Not-Defteri.md');
  });

  it('özel karakterleri temizler', () => {
    expect(safeFilename('Hello!! World??')).toBe('Hello-World.md');
  });

  it('sadece geçersiz karakterlerden oluşan başlığı "untitled" döner', () => {
    expect(safeFilename('///')).toBe('untitled.md');
  });

  it('boş string için "untitled" döner', () => {
    expect(safeFilename('')).toBe('untitled.md');
  });
});

describe('wordStats', () => {
  it('basit cümledeki kelime/ karakter/ satır sayısını döner', () => {
    expect(wordStats('Merhaba dünya bu bir testtir')).toEqual({
      words: 5,
      characters: 28,
      lines: 1,
    });
  });

  it('boş string ve sadece boşluk için 0 değerler döner', () => {
    expect(wordStats('')).toEqual({ words: 0, characters: 0, lines: 0 });
    expect(wordStats('   \n  ')).toEqual({ words: 0, characters: 6, lines: 2 });
  });

  it('Unicode karakterleri kelime olarak sayar', () => {
    expect(wordStats('İstanbul Ankara İzmir').words).toBe(3);
  });

  it('çok satırlı içerikte satır sayısını doğru verir', () => {
    expect(wordStats('a\nb\nc').lines).toBe(3);
  });
});

describe('createDocument', () => {
  it('verilen başlık ve içerikle doküman üretir', () => {
    const doc = createDocument('Yeni', 'selam');
    expect(doc.title).toBe('Yeni');
    expect(doc.content).toBe('selam');
    expect(doc.id.length).toBeGreaterThan(0);
  });

  it('başlık verilmezse varsayılanı kullanır', () => {
    expect(createDocument().title).toBe('Untitled Document');
  });

  it('oluşturma ve güncelleme tarihleri eşit olur', () => {
    const doc = createDocument('X');
    expect(doc.createdAt.getTime()).toBe(doc.updatedAt.getTime());
  });
});

describe('hydrateDocuments', () => {
  it('ISO string tarihlerini Date nesnesine dönüştürür', () => {
    const docs = hydrateDocuments([
      {
        id: 'a',
        title: 'A',
        content: '',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-02-01T10:00:00.000Z',
      },
    ]);
    expect(docs[0].createdAt).toBeInstanceOf(Date);
    expect(docs[0].createdAt.toISOString()).toBe('2024-01-01T10:00:00.000Z');
  });

  it('geçersiz öğeleri filtreler', () => {
    const docs = hydrateDocuments([
      null,
      { id: 'a', title: 'A', content: '', createdAt: 0, updatedAt: 0 },
      { title: 'no id' },
    ]);
    expect(docs).toHaveLength(1);
    expect(docs[0].id).toBe('a');
  });

  it('boş olmayan içerik alanlarını korur', () => {
    const docs = hydrateDocuments([
      { id: 'a', title: 'A', content: 'hi', createdAt: 0, updatedAt: 0 },
    ]);
    expect(docs[0].content).toBe('hi');
  });
});

describe('transformSelection', () => {
  it('seçili metin etrafına işaret ekler', () => {
    const result = transformSelection('Merhaba dünya', 0, 7, 'bold');
    expect(result.content).toBe('**Merhaba** dünya');
  });

  it('seçim boşsa placeholder ekler', () => {
    const result = transformSelection('abc', 1, 1, 'bold');
    expect(result.content).toBe('a**kalın metin**bc');
  });

  it('liste aksiyonu yeni satıra liste öğesi ekler', () => {
    const result = transformSelection('hello', 5, 5, 'ul');
    expect(result.content).toContain('\n- ');
  });

  it('kod bloğu seçili metni ``` blok içine alır', () => {
    const result = transformSelection('console.log()', 0, 14, 'codeBlock');
    expect(result.content).toContain('```');
    expect(result.content).toContain('console.log()');
  });
});

describe('filterDocuments', () => {
  const docs: Document[] = [
    baseDoc({ id: '1', title: 'React Notları', content: 'JSX ve hooks' }),
    baseDoc({ id: '2', title: 'TypeScript', content: 'Tipler' }),
    baseDoc({ id: '3', title: 'Boş', content: '' }),
  ];

  it('boş sorguda tüm dokümanları döner', () => {
    expect(filterDocuments(docs, '')).toHaveLength(3);
  });

  it('başlığa göre filtreler (case-insensitive)', () => {
    expect(filterDocuments(docs, 'react').map((d) => d.id)).toEqual(['1']);
  });

  it('içeriğe göre de eşleşir', () => {
    expect(filterDocuments(docs, 'hooks').map((d) => d.id)).toEqual(['1']);
  });

  it('Türkçe aramayı case-insensitive yapar', () => {
    expect(filterDocuments(docs, 'TYPESCRIPT').map((d) => d.id)).toEqual(['2']);
  });

  it('birden çok terimle arar (tüm terimler eşleşmeli)', () => {
    expect(filterDocuments(docs, 'react hooks').map((d) => d.id)).toEqual(['1']);
    expect(filterDocuments(docs, 'react typescript')).toHaveLength(0);
  });
});

describe('splitSearchTerms', () => {
  it('boşlukla ayrılmış terimleri diziye çevirir', () => {
    expect(splitSearchTerms('   React  hooks  ')).toEqual(['react', 'hooks']);
  });

  it('boş string için boş dizi döner', () => {
    expect(splitSearchTerms('')).toEqual([]);
  });
});

describe('formatRelativeDate', () => {
  it('birkaç saniye öncesini yumuşak ifadeyle döner', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    const past = new Date('2024-01-01T11:59:30Z');
    expect(formatRelativeDate(past, now)).toMatch(/saniye|dakika|saat/);
  });

  it('çok eski tarihler için tam tarih döner', () => {
    const now = new Date('2024-06-01T00:00:00Z');
    const past = new Date('2022-01-01T00:00:00Z');
    expect(formatRelativeDate(past, now)).toMatch(/2022/);
  });
});

describe('DEFAULT_MARKDOWN', () => {
  it('örnek markdown içerik sağlar', () => {
    expect(DEFAULT_MARKDOWN).toContain('#');
    expect(DEFAULT_MARKDOWN.length).toBeGreaterThan(0);
  });
});
