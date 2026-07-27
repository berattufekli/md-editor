import { describe, expect, it } from 'vitest';
import {
  createDocument,
  DEFAULT_DOCUMENT_TITLE,
  DEFAULT_MARKDOWN,
  filterDocuments,
  formatRelativeDate,
  hydrateDocuments,
  hydrateSettings,
  safeFilename,
  splitSearchTerms,
  transformSelection,
  wordStats,
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
  it('Türkçe karakterleri ve boşlukları temizler', () => {
    expect(safeFilename('Yeni Not Defteri')).toBe('Yeni_Not_Defteri.md');
  });

  it('özel karakterleri alt çizgi yapar', () => {
    expect(safeFilename('Hello!! World?')).toBe('Hello_World.md');
  });

  it('tamamı geçersiz giriş için "untitled" üretir', () => {
    expect(safeFilename('///')).toBe('untitled.md');
  });

  it('boş string için "untitled" döner', () => {
    expect(safeFilename('')).toBe('untitled.md');
  });
});

describe('wordStats', () => {
  it('kelime, karakter ve satır sayısını döner', () => {
    expect(wordStats('Merhaba dünya bu bir testtir')).toEqual({
      words: 5,
      characters: 28,
      lines: 1,
      readingMinutes: 1,
    });
  });

  it('boş içerikte sıfır istatistikleri döner', () => {
    expect(wordStats('')).toEqual({
      words: 0,
      characters: 0,
      lines: 0,
      readingMinutes: 1,
    });
  });

  it('çok satırlı içerikte doğru satır sayısını verir', () => {
    expect(wordStats('a\nb\nc')).toEqual({
      words: 3,
      characters: 5,
      lines: 3,
      readingMinutes: 1,
    });
  });
});

describe('createDocument', () => {
  it('default createdAt ve updatedAt Date örneği ile döner', () => {
    const doc = createDocument('Test', '# Test');
    expect(doc.createdAt).toBeInstanceOf(Date);
    expect(doc.updatedAt).toBeInstanceOf(Date);
  });
});

describe('hydrateDocuments', () => {
  it('geçerli bir listeyi güvenli biçimde Document[] yapar', () => {
    const docs = hydrateDocuments([
      { id: 'a', title: 'A', content: 'x', createdAt: '2024-01-01', updatedAt: '2024-01-02' },
    ]);
    expect(docs).toHaveLength(1);
    expect(docs[0].title).toBe('A');
    expect(docs[0].createdAt).toBeInstanceOf(Date);
  });

  it('dizi olmayan girdi için boş liste döner', () => {
    expect(hydrateDocuments(null)).toEqual([]);
    expect(hydrateDocuments({})).toEqual([]);
  });
});

describe('hydrateSettings', () => {
  it('eksik alanları varsayılanla tamamlar', () => {
    const merged = hydrateSettings({ fontSize: 20 });
    expect(merged.fontSize).toBe(20);
    expect(merged.lineHeight).toBe(1.7);
    expect(merged.mobileView).toBe('write');
  });

  it('boş olmayan girdi için ayarları olduğu gibi döner', () => {
    const merged = hydrateSettings({ fontSize: 20, lineHeight: 2.1 });
    expect(merged.fontSize).toBe(20);
    expect(merged.lineHeight).toBe(2.1);
  });
});

describe('transformSelection', () => {
  it('boş içerikte boş seçimde de placeholder uygulanmaz (küçük kontrat)', () => {
    const result = transformSelection('', 0, 0, 'link');
    // seçim yoksa da placeholder uygulanmalı
    expect(result.content).toBe('[bağlantı metni](https://)');
  });

  it('seçim yok, "bold" verildiğinde boş seçimde placeholder kullanır', () => {
    const result = transformSelection('', 0, 0, 'bold');
    expect(result.content).toBe('**kalın metin**');
    expect(result.selectionStart).toBe(2);
    expect(result.selectionEnd).toBe(2 + 'kalın metin'.length);
  });

  it('başına satırbaşı ekleyen aksiyonlar sıfır pozisyonda satır ekler', () => {
    const result = transformSelection('metin', 0, 0, 'heading1');
    expect(result.content.startsWith('\n# ')).toBe(true);
    expect(result.content.endsWith('metin')).toBe(true);
  });
});

describe('filterDocuments', () => {
  it('boş sorgu için tüm belgeleri döner', () => {
    const docs = [baseDoc({ id: 'a' }), baseDoc({ id: 'b' })];
    expect(filterDocuments(docs, '')).toEqual(docs);
  });

  it('terim eşleşmesi yapar, başlık ve içerik üzerinden arar', () => {
    const docs = [
      baseDoc({ id: 'a', title: 'Toplantı', content: 'Pazartesi' }),
      baseDoc({ id: 'b', title: 'Alışveriş', content: 'Çarşamba' }),
    ];
    const result = filterDocuments(docs, 'toplant');
    expect(result.map((doc) => doc.id)).toEqual(['a']);
  });
});

describe('formatRelativeDate', () => {
  it('1 dakikadan az fark için "az önce" döner', () => {
    expect(formatRelativeDate(Date.now() - 10_000)).toBe('az önce');
  });

  it('gün cinsinden farkı döner', () => {
    const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);
    expect(formatRelativeDate(twoDaysAgo)).toBe('2 gün önce');
  });
});

describe('splitSearchTerms', () => {
  it('boşlukla ayrılmış terimleri küçültür', () => {
    expect(splitSearchTerms('  Bir İki  Üç ')).toEqual(['bir', 'iki', 'üç']);
  });

  it('boş string için boş dizi döner', () => {
    expect(splitSearchTerms('')).toEqual([]);
  });
});

describe('default constants', () => {
  it('varsayılan başlık ve metin tanımlıdır', () => {
    expect(DEFAULT_DOCUMENT_TITLE).toBe('Welcome');
    expect(DEFAULT_MARKDOWN).toContain(DEFAULT_DOCUMENT_TITLE);
    expect(DEFAULT_MARKDOWN).toContain('-');
  });
});
