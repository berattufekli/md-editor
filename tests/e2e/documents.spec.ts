import { expect, test } from '@playwright/test';
import { docItems, editor, fresh, itemMenu, library, newDoc, preview, titleInput, write } from './helpers';

test.beforeEach(async ({ page }) => fresh(page));

test('opens with a welcome document that is rendered in the preview', async ({ page }) => {
  await expect(docItems(page)).toHaveCount(1);
  await expect(titleInput(page)).toHaveValue('Hoşgeldin');
  await expect(preview(page).getByRole('heading', { level: 1, name: 'Welcome' })).toBeVisible();
});

test('creating a document makes it active and empty', async ({ page }) => {
  await newDoc(page);
  await expect(docItems(page)).toHaveCount(2);
  await expect(titleInput(page)).toHaveValue('Adsız 2');
  await expect(editor(page)).toHaveValue('');
  await expect(titleInput(page)).toBeFocused();
});

test('Ctrl/⌘ + N creates a document', async ({ page }) => {
  await editor(page).click();
  await page.keyboard.press('ControlOrMeta+N');
  await expect(docItems(page)).toHaveCount(2);
});

test('the title can be edited in the top bar and shows in the library', async ({ page }) => {
  await titleInput(page).fill('Proje notları');
  await expect(library(page).getByText('Proje notları')).toBeVisible();
});

test('a document can be renamed from its menu', async ({ page }) => {
  await itemMenu(page, 'Hoşgeldin', 'Yeniden adlandır');
  const input = library(page).locator('.ray__rename-input');
  await input.fill('Yeni ad');
  await input.press('Enter');
  await expect(titleInput(page)).toHaveValue('Yeni ad');
});

test('renaming with Escape keeps the old title', async ({ page }) => {
  await itemMenu(page, 'Hoşgeldin', 'Yeniden adlandır');
  const input = library(page).locator('.ray__rename-input');
  await input.fill('Vazgeçtim');
  await input.press('Escape');
  await expect(titleInput(page)).toHaveValue('Hoşgeldin');
});

test('switching documents switches the editor content', async ({ page }) => {
  await newDoc(page);
  await write(page, '# İkinci belge');
  await docItems(page).first().click();
  await expect(editor(page)).toHaveValue(/# Welcome/);
  await docItems(page).nth(1).click();
  await expect(editor(page)).toHaveValue('# İkinci belge');
});

test('duplicating copies the content into a new, active document', async ({ page }) => {
  await itemMenu(page, 'Hoşgeldin', 'Çoğalt');
  await expect(docItems(page)).toHaveCount(2);
  await expect(titleInput(page)).toHaveValue('Hoşgeldin (kopya)');
  await expect(editor(page)).toHaveValue(/# Welcome/);
});

test('deleting a document can be undone', async ({ page }) => {
  await newDoc(page);
  await write(page, 'silinecek içerik');
  await titleInput(page).fill('Geçici');
  await itemMenu(page, 'Geçici', 'Sil');
  await expect(docItems(page)).toHaveCount(1);
  await expect(page.getByRole('status').filter({ hasText: 'Geçici' })).toContainText('silindi');
  await page.getByRole('button', { name: 'Geri al' }).click();
  await expect(docItems(page)).toHaveCount(2);
  await expect(titleInput(page)).toHaveValue('Geçici');
  await expect(editor(page)).toHaveValue('silinecek içerik');
});

test('the last document cannot be deleted', async ({ page }) => {
  await page.getByRole('button', { name: 'Hoşgeldin için eylemler', exact: true }).click({ force: true });
  await expect(page.getByRole('menuitem', { name: 'Sil' })).toHaveCount(0);
});

test('library search matches titles and content', async ({ page }) => {
  await newDoc(page);
  await write(page, 'ananas ve elma');
  await titleInput(page).fill('Meyveler');
  const search = page.getByRole('searchbox', { name: 'Belgelerde ara' });
  await search.fill('ananas');
  await expect(docItems(page)).toHaveCount(1);
  await expect(docItems(page).first()).toContainText('Meyveler');
  await search.fill('yok böyle bir şey');
  await expect(library(page).getByText('Eşleşen belge yok')).toBeVisible();
  await search.fill('');
  await expect(docItems(page)).toHaveCount(2);
});

test('Ctrl/⌘ + K focuses the library search when the editor is not focused', async ({ page }) => {
  await titleInput(page).click();
  await page.keyboard.press('ControlOrMeta+K');
  await expect(page.getByRole('searchbox', { name: 'Belgelerde ara' })).toBeFocused();
  await expect(editor(page)).not.toHaveValue(/\]\(https:\/\/\)/);
});

test('Ctrl/⌘ + K inside the editor inserts a link instead', async ({ page }) => {
  await write(page, 'site');
  await editor(page).click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('ControlOrMeta+K');
  await expect(editor(page)).toHaveValue('[site](https://)');
  await expect(editor(page)).toBeFocused();
});

test('documents and edits survive a reload', async ({ page }) => {
  await newDoc(page);
  await write(page, '# Kalıcı');
  await titleInput(page).fill('Saklı');
  await page.reload();
  await expect(docItems(page)).toHaveCount(2);
  await library(page).getByText('Saklı').click();
  await expect(editor(page)).toHaveValue('# Kalıcı');
});

test('a Markdown file can be imported as a document', async ({ page }) => {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Markdown dosyasını içe aktar' }).click(),
  ]);
  await chooser.setFiles({ name: 'notlar.md', mimeType: 'text/markdown', buffer: Buffer.from('# İçe aktarıldı\n\nmerhaba') });
  await expect(titleInput(page)).toHaveValue('notlar');
  await expect(editor(page)).toHaveValue(/# İçe aktarıldı/);
  await expect(docItems(page)).toHaveCount(2);
});

test('the active document can be exported as a .md file', async ({ page }) => {
  await titleInput(page).fill('Dışa Aktar');
  await write(page, '# Dışarı\n\nmetin');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Markdown dosyasını dışa aktar' }).click()]);
  expect(download.suggestedFilename()).toMatch(/\.md$/);
  let text = '';
  for await (const chunk of await download.createReadStream()) text += chunk;
  expect(text).toBe('# Dışarı\n\nmetin');
});

test('the library can be collapsed and reopened', async ({ page }) => {
  await expect(library(page)).toBeVisible();
  await page.getByRole('button', { name: 'Rayı gizle' }).click();
  await expect(library(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Rayı göster' }).click();
  await expect(library(page)).toBeVisible();
});
