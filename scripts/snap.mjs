// Visual verification script for MD Editor redesign.
// Captures desktop default, settings-open, and mobile states.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const URL = process.env.URL || 'http://localhost:3000/';
const OUT = path.resolve(process.cwd(), 'docs/screenshots');
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  // ---- Desktop, default ----
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    // wait for fonts to settle
    await page.waitForTimeout(600);
    // Debug: measure the Ray width and computed styles
    const debug = await page.evaluate(() => {
      const ray = document.querySelector('aside.ray');
      const header = document.querySelector('.ray__header');
      const search = document.querySelector('.ray__search');
      const searchInput = document.querySelector('.ray__search input');
      const newBtn = document.querySelector('.ray__new');
      if (!ray) return { found: false };
      const r = (el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        return { w: Math.round(rect.width), h: Math.round(rect.height), display: cs.display, minWidth: cs.minWidth };
      };
      return {
        found: true,
        ray: r(ray),
        header: r(header),
        search: r(search),
        searchInput: r(searchInput),
        newBtn: r(newBtn),
      };
    });
    console.log('debug', JSON.stringify(debug, null, 2));
    const file = path.join(OUT, '01-desktop-default.png');
    await page.screenshot({ path: file, fullPage: false });
    console.log('saved', file);

    // Open settings drawer
    await page.locator('button[aria-label="Ayarları aç"]').click();
    await page.waitForTimeout(400);
    const file2 = path.join(OUT, '02-desktop-settings-open.png');
    await page.screenshot({ path: file2, fullPage: false });
    console.log('saved', file2);

    // Close settings — use the X button (inside the drawer)
    await page.locator('.settings-drawer button[aria-label="Ayarları kapat"]').click();
    await page.waitForTimeout(300);

    // Toggle preview off
    await page.locator('button[aria-label*="Önizlemeyi gizle"]').click();
    await page.waitForTimeout(300);
    const file3 = path.join(OUT, '03-desktop-preview-off.png');
    await page.screenshot({ path: file3, fullPage: false });
    console.log('saved', file3);

    // Toggle preview back on
    await page.locator('button[aria-label*="Önizlemeyi göster"]').click();
    await page.waitForTimeout(300);

    // Toggle dark mode via status bar cycle (system -> light -> dark)
    const themeBtn = page.locator('footer.status-bar button[aria-label*="Tema"]').first();
    // Two clicks: system -> light -> dark
    await themeBtn.click();
    await page.waitForTimeout(200);
    await themeBtn.click();
    await page.waitForTimeout(500);
    const file4 = path.join(OUT, '04-desktop-dark.png');
    await page.screenshot({ path: file4, fullPage: false });
    console.log('saved', file4);

    // Toggle back to light (one more click: dark -> system)
    await themeBtn.click();
    await page.waitForTimeout(300);

    await ctx.close();
  }

  // ---- Mobile ----
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const file = path.join(OUT, '05-mobile-default.png');
    await page.screenshot({ path: file, fullPage: false });
    console.log('saved', file);

    // Open mobile drawer
    await page.locator('button[aria-label="Belgelerde ara"]').first().focus().catch(() => {});
    const docsToggle = page.locator('header.topbar button[aria-label*="Ray"]');
    if (await docsToggle.count()) {
      await docsToggle.first().click();
      await page.waitForTimeout(400);
      const file2 = path.join(OUT, '06-mobile-drawer-open.png');
      await page.screenshot({ path: file2, fullPage: false });
      console.log('saved', file2);
    }

    await ctx.close();
  }
} finally {
  await browser.close();
}
console.log('done');
