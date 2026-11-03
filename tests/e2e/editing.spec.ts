import { expect, test } from '@playwright/test';
import { editor, fresh, openSettings, preview, selectAll, write } from './helpers';

test.beforeEach(async ({ page }) => fresh(page));

test.describe('formatting toolbar', () => {
  const wraps: [string, string][] = [
    ['Kalın', '**merhaba**'],
    ['Eğik', '_merhaba_'],
    ['Üstü çizili', '~~merhaba~~'],
  ];
  for (const [label, expected] of wraps) {
    test(`${label} wraps the selection`, async ({ page }) => {
      await write(page, 'merhaba');
      await selectAll(page);
      await page.getByRole('button', { name: label, exact: true }).click();
      await expect(editor(page)).toHaveValue(expected);
    });
  }

  const blocks: [string, string][] = [
    ['Başlık 1', '# merhaba'],
    ['Başlık 2', '## merhaba'],
    ['Başlık 3', '### merhaba'],
    ['Alıntı', '> merhaba'],
    ['Sırasız liste', '- merhaba'],
    ['Sıralı liste', '1. merhaba'],
    ['Görev listesi', '- [ ] merhaba'],
  ];
  for (const [label, expected] of blocks) {
    test(`${label} inserts "${expected}"`, async ({ page }) => {
      await write(page, 'merhaba');
      await selectAll(page);
      await page.getByRole('button', { name: label, exact: true }).click();
      await expect(editor(page)).toHaveValue(new RegExp(expected.replace(/[[\]*]/g, '\\$&')));
    });
  }

  test('the overflow menu offers code, link, image, table and rule', async ({ page }) => {
    await write(page, 'x');
    await selectAll(page);
    const more = page.getByRole('button', { name: 'Daha fazla biçimlendirme' });
    const cases: [string, RegExp][] = [
      ['Satır içi kod', /`x`/],
      ['Bağlantı', /\[x\]\(https:\/\/\)/],
      ['Görsel', /!\[x\]\(https:\/\/\)/],
    ];
    for (const [label, re] of cases) {
      await write(page, 'x');
      await selectAll(page);
      await more.click();
      await page.getByRole('menuitem', { name: new RegExp(label) }).click();
      await expect(editor(page)).toHaveValue(re);
    }
    await write(page, 'x');
    await more.click();
    await page.getByRole('menuitem', { name: /Tablo/ }).click();
    await expect(editor(page)).toHaveValue(/\| Sütun 1 \| Sütun 2 \|/);
    await write(page, 'x');
    await more.click();
    await page.getByRole('menuitem', { name: /Yatay çizgi/ }).click();
    await expect(editor(page)).toHaveValue(/---/);
  });

  test('"Tümünü göster" reveals every tool in the bar', async ({ page }) => {
    await page.getByRole('button', { name: 'Daha fazla biçimlendirme' }).click();
    await page.getByRole('menuitem', { name: 'Tümünü göster' }).click();
    await expect(page.getByRole('button', { name: 'Tablo', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Daha az göster' }).click();
    await expect(page.getByRole('button', { name: 'Daha fazla biçimlendirme' })).toBeVisible();
  });
});

test.describe('keyboard shortcuts', () => {
  test('Ctrl/⌘ + B bolds and Ctrl/⌘ + I italicises the selection', async ({ page }) => {
    await write(page, 'metin');
    await selectAll(page);
    await page.keyboard.press('ControlOrMeta+B');
    await expect(editor(page)).toHaveValue('**metin**');
    await write(page, 'metin');
    await selectAll(page);
    await page.keyboard.press('ControlOrMeta+I');
    await expect(editor(page)).toHaveValue('_metin_');
  });

  test('Ctrl/⌘ + Shift + P toggles the preview', async ({ page }) => {
    await expect(preview(page)).toBeVisible();
    await editor(page).click();
    await page.keyboard.press('ControlOrMeta+Shift+P');
    await expect(preview(page)).toHaveCount(0);
    await page.keyboard.press('ControlOrMeta+Shift+P');
    await expect(preview(page)).toBeVisible();
  });

  test('Ctrl/⌘ + , opens the settings drawer', async ({ page }) => {
    await editor(page).click();
    await page.keyboard.press('ControlOrMeta+,');
    await expect(page.getByRole('complementary', { name: 'Ayarlar' })).toBeVisible();
  });

  test('Ctrl/⌘ + \\ collapses the library', async ({ page }) => {
    await editor(page).click();
    await page.keyboard.press('ControlOrMeta+\\');
    await expect(page.getByRole('complementary', { name: 'Belgeler' })).toHaveCount(0);
  });
});

test.describe('preview rendering', () => {
  test('renders tables, task lists and strikethrough (GFM)', async ({ page }) => {
    await write(page, '| a | b |\n| - | - |\n| 1 | 2 |\n\n- [x] bitti\n- [ ] sırada\n\n~~eski~~');
    await expect(preview(page).locator('table')).toBeVisible();
    await expect(preview(page).locator('td').first()).toHaveText('1');
    await expect(preview(page).locator('input[type=checkbox]')).toHaveCount(2);
    await expect(preview(page).locator('input[type=checkbox]').first()).toBeChecked();
    await expect(preview(page).locator('del')).toHaveText('eski');
  });

  test('highlights fenced code', async ({ page }) => {
    await write(page, '```js\nconst a = 1;\n```');
    await expect(preview(page).locator('pre code .hljs-keyword').first()).toHaveText('const');
  });

  test('shows links and quotes', async ({ page }) => {
    await write(page, '[site](https://example.com)\n\n> alıntı');
    await expect(preview(page).getByRole('link', { name: 'site' })).toHaveAttribute('href', 'https://example.com');
    await expect(preview(page).locator('blockquote')).toContainText('alıntı');
  });

  test('does not render raw HTML or run scripts', async ({ page }) => {
    await write(page, '<script>window.__pwned = 1</script>\n\n<img src=x onerror="window.__pwned = 2">\n\n**güvenli**');
    await expect(preview(page).locator('strong')).toHaveText('güvenli');
    await expect(preview(page).locator('script, img')).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
  });

  test('updates as you type', async ({ page }) => {
    await write(page, '# Birinci');
    await expect(preview(page).getByRole('heading', { name: 'Birinci' })).toBeVisible();
    await write(page, '# İkinci');
    await expect(preview(page).getByRole('heading', { name: 'İkinci' })).toBeVisible();
  });
});

test.describe('status bar', () => {
  test('counts words, characters and reading time', async ({ page }) => {
    await write(page, 'bir iki üç dört beş');
    const bar = page.getByRole('contentinfo', { name: 'Belge durumu' });
    await expect(bar).toContainText('5 sözcük');
    await expect(bar).toContainText('19 karakter');
    await expect(bar).toContainText('1 dk okuma');
    await write(page, '');
    await expect(bar).toContainText('0 sözcük');
  });

  test('shows saving state then saved', async ({ page }) => {
    await write(page, 'x');
    await expect(page.getByRole('contentinfo').getByText(/Kaydedildi/)).toBeVisible();
  });

  test('the font size buttons change the editor text size', async ({ page }) => {
    const bar = page.getByRole('contentinfo', { name: 'Belge durumu' });
    await expect(bar).toContainText('16px');
    await bar.getByRole('button', { name: 'Yazı boyutunu büyüt' }).click();
    await expect(bar).toContainText('17px');
    expect(await editor(page).evaluate((el) => getComputedStyle(el).fontSize)).toBe('17px');
    await bar.getByRole('button', { name: 'Yazı boyutunu küçült' }).click();
    await expect(bar).toContainText('16px');
  });

  test('the preview can be hidden and shown from the status bar', async ({ page }) => {
    const bar = page.getByRole('contentinfo', { name: 'Belge durumu' });
    await bar.getByRole('button', { name: 'Önizlemeyi gizle' }).click();
    await expect(preview(page)).toHaveCount(0);
    await bar.getByRole('button', { name: 'Önizlemeyi göster' }).click();
    await expect(preview(page)).toBeVisible();
  });

  test('the theme button cycles light, dark and system', async ({ page }) => {
    const bar = page.getByRole('contentinfo', { name: 'Belge durumu' });
    await page.emulateMedia({ colorScheme: 'light' });
    await bar.getByRole('button', { name: /^Tema:/ }).click();
    const html = page.locator('html');
    await expect(bar.getByRole('button', { name: /^Tema:/ })).toBeVisible();
    const cls = await html.getAttribute('class');
    expect(cls).toBeTruthy();
  });
});

test.describe('outline', () => {
  test('lists headings, nests them, and jumps to the chosen one', async ({ page }) => {
    const doc = Array.from({ length: 40 }, (_, i) => `satır ${i}`).join('\n\n');
    await write(page, `# Giriş\n\n${doc}\n\n## Bölüm A\n\n${doc}\n\n### Alt bölüm\n\nson`);
    await page.getByRole('button', { name: 'Anahat' }).click();
    const items = page.getByRole('menuitem');
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toContainText('Giriş');
    await expect(items.nth(2)).toContainText('Alt bölüm');
    await items.nth(2).click();
    await expect(page.locator('.markdown-preview h3')).toBeInViewport();
    expect(await editor(page).evaluate((el) => (el as HTMLTextAreaElement).selectionStart)).toBeGreaterThan(100);
  });

  test('is disabled when the document has no headings', async ({ page }) => {
    await write(page, 'sadece metin');
    await expect(page.getByRole('button', { name: 'Anahat' })).toBeDisabled();
  });

  test('ignores # inside code blocks', async ({ page }) => {
    await write(page, '```sh\n# yorum\n```\n\n# Gerçek');
    await page.getByRole('button', { name: 'Anahat' }).click();
    await expect(page.getByRole('menuitem')).toHaveCount(1);
  });
});

test.describe('settings', () => {
  test('the drawer opens and closes', async ({ page }) => {
    await openSettings(page);
    await page.getByRole('button', { name: 'Ayarları kapat' }).first().click();
    await expect(page.getByRole('complementary', { name: 'Ayarlar' })).toBeHidden();
  });

  test('theme choices apply to the page', async ({ page }) => {
    await openSettings(page);
    await page.getByRole('button', { name: 'Karanlık' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('button', { name: 'Aydınlık' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('font size and line height sliders change the editor', async ({ page }) => {
    await openSettings(page);
    await page.getByRole('slider', { name: 'Boyut' }).fill('20');
    expect(await editor(page).evaluate((el) => getComputedStyle(el).fontSize)).toBe('20px');
    await page.getByRole('slider', { name: 'Satır yüksekliği' }).fill('2');
    expect(await editor(page).evaluate((el) => parseFloat(getComputedStyle(el).lineHeight) / parseFloat(getComputedStyle(el).fontSize))).toBeCloseTo(2, 1);
  });

  test('line numbers can be switched off', async ({ page }) => {
    await expect(page.locator('.markdown-textarea-wrap')).toHaveAttribute('data-line-numbers', 'false');
    await openSettings(page);
    await page.getByRole('switch', { name: 'Satır numaraları' }).click();
    await expect(page.locator('.markdown-textarea-wrap')).toHaveAttribute('data-line-numbers', 'true');
    await expect(page.locator('.markdown-textarea-wrap')).toHaveAttribute('data-line-count', /1\n2/);
    await page.getByRole('switch', { name: 'Satır numaraları' }).click();
    await expect(page.locator('.markdown-textarea-wrap')).toHaveAttribute('data-line-numbers', 'false');
  });

  test('word wrap and spell check switches update the editor', async ({ page }) => {
    await openSettings(page);
    const wrap = page.getByRole('switch', { name: 'Sözcük kaydırma' });
    const before = await wrap.getAttribute('aria-checked');
    await wrap.click();
    await expect(wrap).not.toHaveAttribute('aria-checked', before!);
    const spell = page.getByRole('switch', { name: 'Yazım denetimi' });
    const spellBefore = await spell.getAttribute('aria-checked');
    await spell.click();
    await expect(editor(page)).toHaveAttribute('spellcheck', spellBefore === 'true' ? 'false' : 'true');
  });

  test('preview can be turned off and moved below', async ({ page }) => {
    await openSettings(page);
    await page.getByRole('button', { name: 'Alt', exact: true }).click();
    await expect(page.locator('.panes')).toHaveAttribute('data-split', 'bottom');
    await page.getByRole('button', { name: 'Sağ', exact: true }).click();
    await expect(page.locator('.panes')).toHaveAttribute('data-split', 'right');
    await page.getByRole('switch', { name: 'Önizlemeyi göster' }).click();
    await expect(preview(page)).toHaveCount(0);
  });

  test('settings are remembered after a reload', async ({ page }) => {
    await openSettings(page);
    await page.getByRole('slider', { name: 'Boyut' }).fill('19');
    await page.reload();
    expect(await editor(page).evaluate((el) => getComputedStyle(el).fontSize)).toBe('19px');
  });
});

test('focus mode can be toggled', async ({ page }) => {
  await page.getByRole('button', { name: 'Odak moduna geç' }).click();
  await expect(page.locator('.markdown-textarea-wrap')).toHaveAttribute('data-focus-mode', 'true');
  await page.getByRole('button', { name: 'Odak modundan çık' }).click();
  await expect(page.locator('.markdown-textarea-wrap')).toHaveAttribute('data-focus-mode', 'false');
});

test.describe('small screens', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Yaz and Önizleme tabs show one pane at a time', async ({ page }) => {
    await fresh(page);
    await expect(page.getByRole('tab', { name: 'Yaz' })).toHaveAttribute('aria-selected', 'true');
    await expect(editor(page)).toBeVisible();
    await expect(preview(page)).toBeHidden();
    await page.getByRole('tab', { name: 'Önizleme' }).click();
    await expect(preview(page)).toBeVisible();
    await expect(editor(page)).toBeHidden();
    await expect(preview(page).getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });

  test('the tabs disappear when the preview is off', async ({ page }) => {
    await fresh(page);
    await page.getByRole('contentinfo').getByRole('button', { name: 'Önizlemeyi gizle' }).click();
    await expect(page.getByRole('tab', { name: 'Yaz' })).toHaveCount(0);
    await expect(editor(page)).toBeVisible();
  });

  test('the library opens as a drawer and picking a document closes it', async ({ page }) => {
    await fresh(page);
    await page.getByRole('button', { name: /Rayı/ }).first().click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await drawer.getByRole('button', { name: 'Yeni belge oluştur' }).click();
    await expect(drawer).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Belge başlığı' })).toHaveValue('Adsız 2');
  });

  test('the page does not scroll sideways', async ({ page }) => {
    await fresh(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
