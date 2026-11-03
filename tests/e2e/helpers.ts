import { expect, type Page } from '@playwright/test';

export const editor = (page: Page) => page.getByRole('textbox', { name: 'Markdown düzenleyici' });
export const preview = (page: Page) => page.locator('.markdown-preview');
export const titleInput = (page: Page) => page.getByRole('textbox', { name: 'Belge başlığı' });
export const library = (page: Page) => page.getByRole('complementary', { name: 'Belgeler' });
export const docItems = (page: Page) => library(page).locator('.ray__item');

/** Fresh start: no stored documents or settings from earlier tests. */
export async function fresh(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(editor(page)).toBeVisible();
}

export async function write(page: Page, text: string) {
  await editor(page).fill(text);
}

export async function newDoc(page: Page) {
  await page.getByRole('button', { name: 'Yeni belge oluştur' }).click();
}

export async function itemMenu(page: Page, title: string, action: string) {
  await page.getByRole('button', { name: `${title} için eylemler`, exact: true }).click({ force: true });
  await page.getByRole('menuitem', { name: action }).click();
}

export async function openSettings(page: Page) {
  await page.getByRole('button', { name: 'Ayarları aç' }).click();
  await expect(page.getByRole('complementary', { name: 'Ayarlar' })).toBeVisible();
}

/** Select the whole editor text. */
export async function selectAll(page: Page) {
  await editor(page).click();
  await page.keyboard.press('ControlOrMeta+A');
}
